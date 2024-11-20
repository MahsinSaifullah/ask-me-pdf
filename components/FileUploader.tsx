'use client';

import useUpload, { Status } from '@/hooks/useUpload';
import {
  CheckCircleIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const renderStatusIcon = (status: Status): JSX.Element => {
  switch (status) {
    case Status.UPLOADING:
      return <RocketIcon className="h-20 w-20 text-indigo-600" />;
    case Status.UPLOADED:
      return <CheckCircleIcon className="h-20 w-20 text-indigo-600" />;
    case Status.SAVING:
      return <SaveIcon className="h-20 w-20 text-indigo-600" />;
    case Status.GENERATING:
      return (
        <HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />
      );

    default:
      return <></>;
  }
};
const FileUploader = () => {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      await handleUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        'application/pdf': ['.pdf'],
      },
    });

  useEffect(() => {
    if (fileId) {
      router.push(`files/${fileId}`);
    }
  }, [fileId, router]);

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4 ${
              progress === 100 && 'hidden'
            }`}
            role="progressbar"
            style={{
              '--value': progress,
              '--size': '12rem',
              '--thickness': '1.3rem',
            }}
          >
            {progress} %
          </div>
          {status && renderStatusIcon(status)}
          <p className="text-indigo-600 animate-pulse">{status || ''}</p>
        </div>
      )}
      {!uploadInProgress && (
        <div
          {...getRootProps()}
          className={`flex items-center justify-center p-10 border-2 border-dashed
        mt-10 w-[90%] border-indigo-600
        text-indigo-600 rounded-lg h-96 ${
          isFocused || isDragAccept ? 'bg-indigo-300' : 'bg-indigo-100'
        }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-ping mb-10" />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="h-20 w-20 animate-bounce" />
                <p>Drag n drop some files here, or click to select files</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
