'use client';

import Image from "next/image";
import Link from "next/link";
import content from "@/content/content.json";

const NavbarAuth = () => {

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image src="/logoTF.png" alt={content.navbar.brand} width={800} height={800} className="h-11 w-auto" priority />
              <Image
                src="/logo-1.png"
                alt="Logo"
                width={800}
                height={800}
                className="h-11 w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAuth;
