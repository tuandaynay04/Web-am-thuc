'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { authApiFetch } from '@/lib/api';
import {
  AUTH_CHANGED_EVENT,
  getAccessToken,
  removeAccessToken,
} from '@/lib/auth/token';

type MeResponse = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
};

export function Header() {
  const [user, setUser] =
    useState<MeResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAccessToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const me =
          await authApiFetch<MeResponse>(
            '/auth/me',
          );

        setUser(me);
      } catch {
        removeAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void loadUser();

    function handleAuthChanged() {
      void loadUser();
    }

    window.addEventListener(
      AUTH_CHANGED_EVENT,
      handleAuthChanged,
    );

    return () => {
      window.removeEventListener(
        AUTH_CHANGED_EVENT,
        handleAuthChanged,
      );
    };
  }, []);

  function logout() {
    removeAccessToken();
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl text-white shadow-sm">
            🍳
          </div>

          <div>
            <div className="text-lg font-bold text-stone-900">
              Bếp Việt
            </div>

            <div className="text-xs text-stone-500">
              Khám phá vị ngon mỗi ngày
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-orange-50 hover:text-orange-600"
          >
            Món ăn
          </Link>

          {user && (
            <>
              <Link
                href="/pantry"
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                Bếp của tôi
              </Link>

              <Link
                href="/favorites"
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                Yêu thích
              </Link>
            </>
          )}

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-orange-50"
              >
                Đăng nhập
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Đăng ký
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <span className="hidden rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-700 md:block">
                {user.email}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-orange-50"
              >
                Đăng xuất
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}