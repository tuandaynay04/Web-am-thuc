import Link from 'next/link';

import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">
        Đăng ký
      </h1>

      <p className="mt-2 text-gray-600">
        Tạo tài khoản để lưu món,
        quản lý bếp và đánh giá công thức.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm">
        Đã có tài khoản?{' '}
        <Link
          href="/login"
          className="font-medium underline"
        >
          Đăng nhập
        </Link>
      </p>
    </main>
  );
}