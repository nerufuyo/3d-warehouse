import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MdClose, MdMenu } from 'react-icons/md';

import { useWebSettings } from 'contexts/webSettings';

const navLinks: { name: string; href: string; pathName: string }[] = [
  {
    name: 'Home',
    href: '/',
    pathName: '',
  },
  {
    name: '3D Models',
    href: '/3d',
    pathName: '/3d',
  },
  {
    name: 'About',
    href: '/about',
    pathName: '/about',
  },
  {
    name: 'Contact',
    href: '/contact',
    pathName: '/contact',
  },
];
export default function Navbar() {
  const settings = useWebSettings();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    if (router.pathname === '/') {
      setActiveIndex(0);
      return;
    }

    const index = navLinks.findIndex((navLink) =>
      navLink.pathName.startsWith(router.pathname),
    );
    if (index === -1) {
      setActiveIndex(0);
    } else {
      setActiveIndex(index);
    }
  }, [router.pathname]);

  return (
    <nav className={'w-full select-none'}>
      <div
        className={
          'w-full px-2 md:px-4 py-1 bg-black border-b border-zinc-500 flex justify-between sticky top-0 z-[9999]'
        }
      >
        <Link
          href={'/'}
          className={'flex items-center gap-2 opacity-90'}
        >
          <img
            src={'/favicon.ico'}
            alt={settings.siteName}
            width={32}
            height={32}
            loading={'eager'}
          />
          <span className={'text-xl font-bold hidden md:block'}>
            {settings.siteName}
          </span>
        </Link>

        <div
          className={'flex md:hidden items-center justify-center w-full p-1'}
        >
          <span className={'font-bold text-xl'}>{settings.siteName}</span>
        </div>

        <ul className={'hidden md:flex items-center gap-4'}>
          {navLinks.map((navLink, index) => (
            <li key={`navLink-${navLink.name}@${index}`}>
              <Link
                href={navLink.href}
                className={`${activeIndex === index ? 'active' : ''}`}
              >
                {navLink.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className={'flex items-center relative md:hidden z-[9999]'}>
          <MdMenu
            className={`${
              isMenuOpen
                ? 'rotate-180 opacity-0 pointer-events-none'
                : 'rotate-0 opacity-100 pointer-events-auto'
            } transition-all absolute right-0 top-auto`}
            size={24}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          <MdClose
            className={`${
              isMenuOpen
                ? 'rotate-0 opacity-100 pointer-events-auto'
                : 'rotate-180 opacity-0 pointer-events-none'
            } transition-all absolute right-0 top-auto`}
            size={24}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
      </div>

      <div
        className={`${
          isMenuOpen ? 'top-0' : '-top-full'
        } transition-all duration-300 fixed w-full h-screen flex md:hidden flex-col py-12 bg-zinc-900/80 backdrop-blur z-[9998]`}
      >
        <ul className={'flex flex-col items-center w-full'}>
          {navLinks.map((navLink, index) => (
            <Link
              href={navLink.href}
              key={`navLink-${navLink.name}@${index}`}
              className={`${
                activeIndex === index
                  ? 'bg-white text-black focus:text-black font-bold pl-8'
                  : 'text-white pl-4'
              } w-full py-2 px-4 text-xl transition-all duration-300 opacity-100`}
              onClick={() => setIsMenuOpen(false)}
            >
              {navLink.name}
            </Link>
          ))}
        </ul>
      </div>
    </nav>
  );
}
