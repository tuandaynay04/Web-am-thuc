'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiFetch } from '@/lib/api';

type RegisterResponse = {
  message: string;

  user: {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
  };
};

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

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
      await apiFetch<RegisterResponse>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            fullName,
            password,
          }),
        },
      );

      router.push('/login');
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Đăng ký thất bại',
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
          htmlFor="fullName"
          className="mb-2 block font-medium"
        >
          Họ và tên
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          required
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Nguyễn Văn A"
        />
      </div>

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
          placeholder="user@webamthuc.vn"
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
            setPassword(event.target.value)
          }
          required
          minLength={8}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Tối thiểu 8 ký tự"
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
          ? 'Đang đăng ký...'
          : 'Đăng ký'}
      </button>
    </form>
  );
}