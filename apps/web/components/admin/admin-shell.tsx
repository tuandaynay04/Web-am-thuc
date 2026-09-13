'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { authApiFetch } from '@/lib/api';

type MeResponse = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
};

type AdminShellProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    href: '/admin',
    label: 'Tổng quan',
    icon: '📊',
  },
  {
    href: '/admin/recipes',
    label: 'Món ăn',
    icon: '🍲',
  },
  {
    href: '/admin/categories',
    label: 'Danh mục',
    icon: '📁',
  },
  {
    href: '/admin/ingredients',
    label: 'Nguyên liệu',
    icon: '🥬',
  },
  {
    href: '/admin/users',
    label: 'Người dùng',
    icon: '👥',
  },
  {
    href: '/admin/reviews',
    label: 'Đánh giá',
    icon: '⭐',
  },
];

export function AdminShell({
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<MeResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const me =
          await authApiFetch<MeResponse>(
            '/auth/me',
          );

        if (me.role !== 'ADMIN') {
          router.replace('/');
          return;
        }

        setUser(me);
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    void checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl border border-orange-100 bg-white px-8 py-6 shadow-sm">
          <p className="font-medium text-stone-600">
            Đang kiểm tra quyền quản trị...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl gap-8 px-6 py-8">
      <aside className="w-64 shrink-0">
        <div className="sticky top-28 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="border-b border-orange-100 px-3 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
              Quản trị
            </p>

            <p className="mt-2 truncate text-sm font-medium text-stone-700">
              {user.email}
            </p>
          </div>

          <nav className="mt-4 space-y-1">
            {navigation.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(
                      item.href,
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'flex items-center gap-3 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white'
                      : 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-orange-50 hover:text-orange-600'
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-orange-100 pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-orange-50"
            >
              ← Về website
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}