'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiFetch } from '@/lib/api';
import { saveAccessToken } from '@/lib/auth/token';

type LoginResponse = {
  accessToken: string;

  user: {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'USER' | 'ADMIN';
  };
};

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const result =
        await apiFetch<LoginResponse>(
          '/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

      saveAccessToken(
        result.accessToken,
      );

      router.push('/');
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Đăng nhập thất bại',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-medium"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          className="w-full rounded-xl border px-4 py-3"
          placeholder="demo@webamthuc.vn"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-medium"
        >
          Mật khẩu
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
          required
          className="w-full rounded-xl border px-4 py-3"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? 'Đang đăng nhập...'
          : 'Đăng nhập'}
      </button>
    </form>
  );
}