'use client';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Document, Page, pdfjs } from 'react-pdf';
import { useEffect, useState } from 'react';
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewProps {
  url?: string;
}

const PdfView: React.FC<PdfViewProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (!url) {
      return;
    }

    const fetchFile = async () => {
      const response = await fetch(url);
      const file = await response.blob();

      setFile(file);
    };

    fetchFile();
  }, [url]);

  return (
    <div className="flex flex-col justify-center items-center">
      {!file && (
        <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
      )}
      {file && (
        <Document
          loading={null}
          file={file}
          rotate={rotation}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="m-4 overflow-scroll"
        >
          <Page className="shadow-lg" scale={scale} pageNumber={pageNumber} />
        </Document>
      )}
    </div>
  );
};

export default PdfView;
