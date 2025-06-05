'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const NavbarAuth = () => {
  const { data: session } = useSession();
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  useEffect(() => {
    const fetchUnreviewedCount = async () => {
      try {
        const res = await fetch('/api/reviews/unreviewed-count');
        if (res.ok) {
          const data = await res.json();
          setUnreviewedCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unreviewed count:', error);
      }
    };

    if (session) {
      fetchUnreviewedCount();
    }
  }, [session]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
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
