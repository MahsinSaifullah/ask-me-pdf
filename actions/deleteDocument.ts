'use server';

import { adminDb, adminStorage } from '@/firebaseAdmin';
import { indexName } from '@/lib/langchain';
import pineconeClient from '@/lib/pinecone';
import userGuard from '@/lib/userGuard';
import { revalidatePath } from 'next/cache';

export const deleteDocument = async (docId: string) => {
  const userId = await userGuard();

  await adminDb
    .collection('users')
    .doc(userId!)
    .collection('files')
    .doc(docId)
    .delete();

  await adminStorage
    .bucket(process.env.FIREBASE_STORAGE_BUCKET)
    .file(`users/${userId}/files/${docId}`)
    .delete();

  const index = await pineconeClient.index(indexName);
  await index.namespace(docId).deleteAll();

  revalidatePath('/dashboard');
};
