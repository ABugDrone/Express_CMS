import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      <Link to="/" className="hover:text-amber-600 transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" /> Home
      </Link>
      {items.filter(Boolean).map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          {item.href ? (
            <Link to={item.href} className="hover:text-amber-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
