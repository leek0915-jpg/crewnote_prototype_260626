import Link from 'next/link';
import { BRAND } from '@/lib/constants';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export default function TopBar({ title, showBack = false }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <Link
            href="/feed"
            className="p-2 -ml-2 rounded-lg hover:bg-cream-dark transition-colors"
            aria-label="뒤로 가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <Link href="/feed" className="flex items-center gap-2">
          <span className="text-2xl">{BRAND.mascot.emoji}</span>
          <h1 className="text-lg font-bold text-foreground">{title || BRAND.name}</h1>
        </Link>
      </div>
    </header>
  );
}