'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, CheckSquare } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>YMCA CRM</h2>
      </div>
      <nav className="sidebar-nav">
        <Link 
          href="/" 
          className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}
        >
          <Users size={18} />
          Stakeholders
        </Link>
        <Link 
          href="/actions" 
          className={`sidebar-link ${pathname === '/actions' ? 'active' : ''}`}
        >
          <CheckSquare size={18} />
          General Actions
        </Link>
      </nav>
    </aside>
  );
}
