
'use client';

/**
 * @fileOverview Institutional Trash Utility Node
 * Manages the atomic transfer of records between active collections and the 60-day recovery vault.
 * Updated: Implements high-fidelity error handling and non-blocking mutation patterns.
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
};

/**
 * moveToTrash - Displaces a document to the 60-day recovery vault.
 */
export async function moveToTrash(
  db: Firestore, 
  user: User | null, 
  item: any, 
  collectionName: string,
  displayNameField: string = 'name'
) {
  if (!db || !item?.id) return;

  const batch = writeBatch(db);
  const trashRef = doc(collection(db, 'trash'));
  const originalRef = doc(db, collectionName, item.id);

  const trashData = {
    ...item,
    trashMetadata: {
      originalId: item.id,
      originalCollection: collectionName,
      deletedBy: user?.email || 'Unauthorized Agent',
      deletedAt: serverTimestamp(),
      displayName: item[displayNameField] || item.title || item.fullName || 'Unnamed Record',
      category: collectionName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  };

  // 1. Establish in Trash
  batch.set(trashRef, trashData);
  
  // 2. Erase from active collection
  batch.delete(originalRef);

  // 3. Dispatch (Non-blocking)
  batch.commit()
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
export async function restoreFromTrash(db: Firestore, trashItem: any) {
  if (!db || !trashItem?.trashMetadata) return;

  const batch = writeBatch(db);
  const { originalId, originalCollection } = trashItem.trashMetadata;
  const trashRef = doc(db, 'trash', trashItem.id);
  const originalRef = doc(db, originalCollection, originalId);

  const { trashMetadata, ...originalData } = trashItem;

  // 1. Re-establish in original collection
  batch.set(originalRef, {
    ...originalData,
    restoredAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Purge from Trash
  batch.delete(trashRef);

  // 3. Dispatch (Non-blocking)
  batch.commit()
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
export async function permanentPurge(db: Firestore, trashId: string) {
  if (!db || !trashId) return;
  
  const trashRef = doc(db, 'trash', trashId);
  
  deleteDoc(trashRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: trashRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}
