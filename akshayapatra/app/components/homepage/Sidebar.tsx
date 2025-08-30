'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation'; // ✅ App Router hooks
import { cn } from '@/lib/utils';
import { IconButton } from './Iconbutton';

export type SidebarItem = {
  id: string;
  label: string;
  href: string;   // route
  icon: string;   // e.g. "/icons/home.svg" (from /public)
};

type SidebarProps = {
  items?: SidebarItem[];
  className?: string;
};

const DEFAULT_ITEMS: SidebarItem[] = [
  { id: 'home',  label: 'home',  href: '/',           icon: '/icons/home.svg' },
  { id: 'dashboard', label: 'dashboard', href: '/dashboard',  icon: '/icons/dashboard.svg' },
  { id: 'program',      label: 'program',      href: '/program',icon: '/icons/program.svg' }
];

export const Sidebar: React.FC<SidebarProps> = ({ items = DEFAULT_ITEMS, className }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';

  // Derive active item from current route
  const activeFromRoute =
    items.find(it => pathname === it.href || pathname.startsWith(it.href + '/'))?.id
    ?? items[0]?.id;

  const [active, setActive] = React.useState<string>(activeFromRoute);

  // Sync active when route changes
  React.useEffect(() => {
    if (activeFromRoute && activeFromRoute !== active) setActive(activeFromRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleClick = (item: SidebarItem) => {
    setActive(item.id);
    router.push(item.href);
  };

  return (
    <nav
      className={cn('absolute z-10 w-12 left-3 top-[23px] bg-black rounded-2xl', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="flex flex-col items-center">
        {items.map((item, index) => (
          <li key={item.id} className="w-full p-2">
            <IconButton
              src={item.icon}
              alt={item.label}
              isActive={active === item.id}
              onClick={() => handleClick(item)}
            />
            {/* spacing similar to your previous layout */}
            {index < items.length - 3 && <div className="flex min-h-9 w-full mt-[13px]" />}
            {index >= items.length - 3 && index < items.length - 1 && <div className="mt-[13px]" />}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
