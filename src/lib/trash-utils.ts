'use client';

/**
 * @fileOverview Institutional Trash Utility Node
 * Manages the atomic transfer of records between active collections and the recovery vault.
 * Updated: Implements 90-day retention for members and stores deletion justifications.
 */

import { 
  Firestore, 
  doc, 
  writeBatch, 
  serverTimestamp, 
  deleteDoc,
  collection
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export type TrashItemMetadata = {
  originalId: string;
  originalCollection: string;
  deletedBy: string | null;
  deletedAt: any;
  displayName: string;
  category: string;
  deletionReason?: string;
  permanentDeletionDate: any;
  deletionStatus: "TRASHED";
};

/**
 * moveToTrash - Displaces a document to the recovery vault.
 */
export async function moveToTrash(
  db: Firestore, 
  user: User | null, 
  item: any, 
  collectionName: string,
  reason: string,
  displayNameField: string = 'name'
) {
  if (!db || !item?.id) return;

  const batch = writeBatch(db);
  const trashRef = doc(collection(db, 'trash'));
  const originalRef = doc(db, collectionName, item.id);

  // Calculate permanent deletion date (90 days for members, 60 for others)
  const retentionDays = collectionName === 'memberProfiles' ? 90 : 60;
  const now = new Date();
  const permanentDeletionDate = new Date(now.getTime() + (retentionDays * 24 * 60 * 60 * 1000));

  const trashData = {
    ...item,
    trashMetadata: {
      originalId: item.id,
      originalCollection: collectionName,
      deletedBy: user?.email || 'Authorized Admin',
      deletedAt: serverTimestamp(),
      displayName: item[displayNameField] || item.title || item.fullName || 'Unnamed Record',
      category: collectionName === 'memberProfiles' ? 'Personnel' : collectionName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      deletionReason: reason,
      permanentDeletionDate: permanentDeletionDate,
      deletionStatus: "TRASHED"
    }
  };

  // 1. Establish in Trash
  batch.set(trashRef, trashData);
  
  // 2. Erase from active collection
  batch.delete(originalRef);

  // 3. Log Audit Entry
  const auditRef = doc(collection(db, 'deletion_audit_logs'));
  batch.set(auditRef, {
    memberId: item.memberId || item.id,
    memberName: trashData.trashMetadata.displayName,
    performedBy: user?.email,
    timestamp: serverTimestamp(),
    deletionReason: reason,
    action: "MEMBER_MOVED_TO_RECYCLE_BIN"
  });

  // 4. Dispatch (Non-blocking)
  return batch.commit()
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `trash_batch_${collectionName}`,
        operation: 'write',
        requestResourceData: trashData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * restoreFromTrash - Reintegrates a document from the vault to its original collection.
 */
export async function restoreFromTrash(db: Firestore, user: User | null, trashItem: any) {
  if (!db || !trashItem?.trashMetadata) return;

  const batch = writeBatch(db);
  const { originalId, originalCollection } = trashItem.trashMetadata;
  const trashRef = doc(db, 'trash', trashItem.id);
  const originalRef = doc(db, originalCollection, originalId);

  const { trashMetadata, ...originalData } = trashItem;

  // 1. Re-establish in original collection
  batch.set(originalRef, {
    ...originalData,
    deletionStatus: "ACTIVE",
    restoredAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Purge from Trash
  batch.delete(trashRef);

  // 3. Log Audit
  const auditRef = doc(collection(db, 'deletion_audit_logs'));
  batch.set(auditRef, {
    memberId: originalData.memberId || originalId,
    memberName: trashMetadata.displayName,
    performedBy: user?.email,
    timestamp: serverTimestamp(),
    action: "MEMBER_RESTORED"
  });

  // 4. Dispatch (Non-blocking)
  return batch.commit()
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `restore_${originalCollection}`,
        operation: 'write',
        requestResourceData: originalData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * permanentPurge - Irreversibly deletes a record from the trash vault.
 */
export async function permanentPurge(db: Firestore, user: User | null, trashItem: any) {
  if (!db || !trashItem?.id) return;
  
  const batch = writeBatch(db);
  const trashRef = doc(db, 'trash', trashItem.id);
  
  batch.delete(trashRef);

  // Log Audit
  const auditRef = doc(collection(db, 'deletion_audit_logs'));
  batch.set(auditRef, {
    memberId: trashItem.memberId || trashItem.id,
    memberName: trashItem.trashMetadata?.displayName || 'Unknown',
    performedBy: user?.email || 'System',
    timestamp: serverTimestamp(),
    action: "PERMANENT_DELETE_COMPLETED"
  });

  return batch.commit()
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: trashRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}