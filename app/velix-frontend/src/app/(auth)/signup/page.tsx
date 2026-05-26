import React from 'react';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col ambient-bg relative overflow-hidden">


      <main className="flex-grow flex items-center justify-center p-[16px] md:p-[40px] mt-16 relative z-10">
        {/* Registration Card */}
        <div className="w-full max-w-[480px] bg-glass rounded-xl border border-primary-container/10 amber-glow p-8 md:p-[48px] relative overflow-hidden">
          {/* Subtle accent top line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary-container to-primary-container opacity-50" />

          <div className="text-center mb-[32px]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-lowest border border-primary-container/20 mb-6 amber-glow animate-pulse">
              <span className="font-headline-md text-headline-md font-bold text-primary-container">VX</span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
              Create Account
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Join Velix Marketing OS and accelerate your growth.
            </p>
          </div>

          <SignupForm />

          <div className="mt-[32px] pt-[24px] border-t border-primary-container/10 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Link className="text-primary font-semibold hover:underline" href="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>


    </div>
  );
}
export const metadata = {
  title: 'Velix Marketing OS - Registration',
};
