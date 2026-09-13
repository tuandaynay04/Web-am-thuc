import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">
        Đăng nhập
      </h1>

      <p className="mt-2 text-gray-600">
        Đăng nhập để quản lý bếp,
        món yêu thích và đánh giá.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm">
        Chưa có tài khoản?{' '}
        <Link
          href="/register"
          className="font-medium underline"
        >
          Đăng ký
        </Link>
      </p>
    </main>
  );
}