import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-[16px] md:p-[40px] relative overflow-hidden ambient-bg">
      {/* Decorative background elements for Glassmorphism feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container opacity-5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary-container opacity-5 blur-[100px]" />

      {/* Main Content Area */}
      <main className="w-full max-w-[440px] relative z-10">
        {/* Login Card */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-primary-container/10 rounded-xl p-8 sm:p-10 amber-glow flex flex-col gap-8 relative overflow-hidden">
          {/* Subtle internal glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container/30 to-transparent" />

          {/* Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <BrandLogo size="md" className="mb-2" />
            <h1 className="font-headline-md text-headline-md text-on-background">Welcome back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to continue to Velix</p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div className="text-center mt-2 border-t border-on-surface-variant/10 pt-6">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link className="text-primary font-semibold hover:text-primary-container transition-colors ml-1" href="/signup">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
export const metadata = {
  title: 'Login - Velix Marketing OS',
};
