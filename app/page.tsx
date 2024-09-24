import { Button } from '@/components/ui/button';
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from 'lucide-react';
import Link from 'next/link';

const FEATURE_PROMPTS = [
  {
    title: 'Store your PDF Documents',
    description:
      'Keep all your important PDF files securely stored and easily accessible anytime, anywhere',
    icon: GlobeIcon,
  },
  {
    title: 'Blazing Fast Responses',
    description:
      'Experience lightening-fast answers to your queries, ensuring you get the information you need instantly',
    icon: ZapIcon,
  },
  {
    title: 'Chat Memorization',
    description:
      'Our intelligent chatbot remembers previous interactions, providing a seemless and personalized experience.',
    icon: BrainCogIcon,
  },
  {
    title: 'Interactive PDF Viewer',
    description:
      'Engage with your PDFs like never before using our intuitive and interactive viewer',
    icon: EyeIcon,
  },
  {
    title: 'Cloud Backup',
    description:
      'Rest assured knowing your documents are safely backed up on the cloud, protected from loss or damage.',
    icon: ServerCogIcon,
  },
  {
    title: 'Responsive Across Devices',
    description:
      "Access and chat with your PDFs seamlessly on any device, whether it's your desktop, tablet or smartphone.",
    icon: MonitorSmartphoneIcon,
  },
];

export default function Home() {
  return (
    <main className="overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600 flex-1">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <section className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Your Interactive Document Companion
            </h2>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your PDFs into Interactive Conversations
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Introducing{' '}
              <span className="font-bold text-indigo-600">Ask Me PDF.</span>
              <br />
              <br /> Upload your document, and our chatbot will answer
              questions, summarize content, and answer all your Qs. Ideal for
              everyone, <span className="text-indigo-600">Ask Me PDF</span>{' '}
              turns static documents into{' '}
              <span className="font-bold">dynamic conversations</span> enhancing
              productivity 10x fold effortlessly.
            </p>
          </div>
          <Button asChild className="mt-10">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
