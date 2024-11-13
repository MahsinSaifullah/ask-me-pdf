'use client';

import { db, storage } from '@/firebase';
import { useUser } from '@clerk/nextjs';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export enum Status {
  UPLOADING = 'Uploading file...',
  UPLOADED = 'File uploaded successfully',
  SAVING = 'Saving file to database...',
  GENERATING = 'Generating AI embeddings, This will only take a few seconds...',
}

const useUpload = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const { user } = useUser();

  const handleUpload = async (file: File) => {
    if (!file || !user) {
      return;
    }

    const fileIdToUpload = uuidv4();
    const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUpload}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percentageProgress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        setStatus(Status.UPLOADING);
        setProgress(percentageProgress);
      },
      (error) => {
        console.error('Error uploading file', error);
      },
      async () => {
        setStatus(Status.UPLOADED);

        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

        setStatus(Status.SAVING);

        await setDoc(doc(db, 'users', user.id, 'files', fileIdToUpload), {
          name: file.name,
          size: file.size,
          type: file.type,
          downloadUrl: downloadUrl,
          ref: uploadTask.snapshot.ref.fullPath,
          createdAt: new Date(),
        });

        setStatus(Status.GENERATING);

        setFileId(fileIdToUpload);
      }
    );
  };

  return {
    progress,
    status,
    fileId,
    handleUpload,
  };
};

export default useUpload;
