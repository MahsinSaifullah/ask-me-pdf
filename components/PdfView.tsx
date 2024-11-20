'use client';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// import { Document, Page, pdfjs } from 'react-pdf';
// import { useEffect, useState } from 'react';
// import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

interface PdfViewProps {
  url?: string;
}

const PdfView: React.FC<PdfViewProps> = ({ url }) => {
  return <div>PdfView</div>;
};

export default PdfView;
