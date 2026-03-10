import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ExternalLink, PackageSearch, Store } from 'lucide-react';

function BrandTitle() {
  return (
    <Link href="/" className="flex items-center gap-3 font-medium">
      <Image
        src="/icons/fixitrock.png"
        alt="Fix iT Rock"
        width={28}
        height={28}
        className="rounded-lg"
      />
      <span>Fix iT Rock</span>
    </Link>
  );
}

type LayoutMode = {
  home?: boolean;
};

export function baseOptions(mode: LayoutMode = {}): BaseLayoutProps {
  return {
    links: [
      {
        text: 'Docs',
        url: '/docs',
        icon: <BookOpen className="size-4" />,
      },
      {
        text: 'Users',
        url: '/docs/user',
        icon: <PackageSearch className="size-4" />,
      },
      {
        text: 'Sellers',
        url: '/docs/seller',
        icon: <Store className="size-4" />,
      },
      {
        text: 'Live App',
        url: 'https://fixitrock.com',
        external: true,
        icon: <ExternalLink className="size-4" />,
      },
    ],
    nav: {
      title: <BrandTitle />,
      transparentMode: mode.home ? 'top' : 'none',
    },
  };
}
