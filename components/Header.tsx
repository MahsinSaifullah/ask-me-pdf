import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from './ui/button';
import { FilePlus2 } from 'lucide-react';

const Header = () => {
  return (
    <div className="flex justify-between bg-white shadow-sm p-5 border-b">
      <Link href="/dashboard" className="text-2xl">
        Ask me <span className="text-indigo-600">PDF</span>
      </Link>
      <SignedIn>
        <div className="flex items-center space-x-4">
          <Button asChild variant="link" className="hidden md:flex">
            <Link href="/dashbord/upgrade">Pricing</Link>
          </Button>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href="/dashbord">My Documents</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-indigo-600 hidden md:flex"
          >
            <Link href="/dashbord/upload">
              <FilePlus2 className="text-indigo-600" />
            </Link>
          </Button>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
};

export default Header;