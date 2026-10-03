'use server';

/**
 * @fileOverview Secure OTP Governance Actions
 * Manages the generation and verification of high-stakes security tokens for deletions.
 * Verified on server-side using a restricted handshake collection.
 */

import { initializeFirebase } from '@/firebase/init';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * generateSecureOtp - Establishes a security challenge in the registry.
 */
export async function generateSecureOtp(adminId: string) {
  const { db } = initializeFirebase('AdminTerminal');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const challengeId = `OTP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute TTL

  try {
    await setDoc(doc(db, 'verification_tokens', challengeId), {
      otp: otp, // In production, hash this value
      adminId,
      expiresAt: Timestamp.fromDate(expiresAt),
      type: 'MEMBER_DELETE',
      createdAt: serverTimestamp()
    });

    // SIMULATION: In a production environment, this would trigger an SMS/Email dispatch.
    console.log(`[SECURITY-DISPATCH] OTP for Admin ${adminId}: ${otp}. Valid for 10 mins.`);
    
    return { success: true, challengeId };
  } catch (e) {
    return { success: false };
  }
}

/**
 * verifySecureOtp - Validates the challenge on the server node.
 */
export async function verifySecureOtp(challengeId: string, providedOtp: string) {
  const { db } = initializeFirebase('AdminTerminal');
  const challengeRef = doc(db, 'verification_tokens', challengeId);

  try {
    const snap = await getDoc(challengeRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const isExpired = data.expiresAt.toDate() < new Date();
    const isMatch = data.otp === providedOtp;

    // SINGLE-USE PROTOCOL: Always consume/delete the token regardless of result
    await deleteDoc(challengeRef);

    return isMatch && !isExpired;
  } catch (e) {
    return false;
  }
}
