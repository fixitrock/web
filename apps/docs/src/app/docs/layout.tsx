import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { BookOpen, PackageSearch, Store } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      tabMode="top"
      sidebar={{
        defaultOpenLevel: 1,
        tabs: {
          transform(option) {
            if (option.url.includes('/getting-started')) {
              return { ...option, title: 'Getting Started', icon: <BookOpen className="size-4" /> };
            }
            if (option.url.includes('/user')) {
              return { ...option, title: 'Users', icon: <PackageSearch className="size-4" /> };
            }
            if (option.url.includes('/seller')) {
              return { ...option, title: 'Sellers', icon: <Store className="size-4" /> };
            }
            return option;
          },
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
