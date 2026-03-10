import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import Link from 'next/link';

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
      <span>Fix iT Rock Docs</span>
    </Link>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandTitle />,
    },
  };
}
