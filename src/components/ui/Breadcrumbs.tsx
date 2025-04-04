'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight, FaHome } from 'react-icons/fa';

interface BreadcrumbsProps {
  className?: string;
}

export default function Breadcrumbs({ className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    // Remove trailing slash and split path into segments
    const segments = pathname
      .replace(/\/$/, '')
      .split('/')
      .filter(Boolean);

    // Generate breadcrumb items
    return segments.map((segment, index) => {
      // Build the URL for this breadcrumb
      const url = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Format the label (capitalize first letter, replace hyphens with spaces)
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\[.*?\]/, 'View') // Replace dynamic segments like [id] with "View"
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        label,
        url,
        isLast: index === segments.length - 1
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  if (!breadcrumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 flex items-center"
            aria-label="Home"
          >
            <FaHome className="w-4 h-4" />
          </Link>
        </li>
        
        {breadcrumbs.map(({ label, url, isLast }) => (
          <li key={url} className="flex items-center">
            <FaChevronRight className="w-3 h-3 text-gray-400 mx-2" aria-hidden="true" />
            {isLast ? (
              <span
                className="text-gray-700 font-medium"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                href={url}
                className="text-gray-500 hover:text-gray-700"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 