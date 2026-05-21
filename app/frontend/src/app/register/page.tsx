import Link from 'next/link'
import { signUp } from '@/app/auth/actions'

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const { error, success } = await searchParams

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
      {/* Centered card with soft orange shadow glow */}
      <div className="w-full max-w-md glass-card rounded-[24px] p-8 glass-card-hover relative overflow-hidden">
        {/* Soft velocity glowing accent elements inside the card */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-orange-100/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-100/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6 relative">
          {/* Velix High-Velocity Monogram */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 font-heading font-extrabold text-2xl mb-4 border border-orange-500/20 shadow-[0_4px_12px_rgba(249,115,22,0.1)] relative group">
            <span className="relative z-10">VX</span>
            {/* Speed trail element in logo */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Velix
          </h1>
          <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider mb-2">
            Marketing at Velocity
          </p>
          <p className="text-slate-500 text-sm">
            Create an account to start generating campaign assets
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-emerald-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form action={signUp} className="space-y-4 relative">
          <div>
            <label htmlFor="name" className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full antigravity-input px-4 py-3 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="Alex Johnson"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full antigravity-input px-4 py-3 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full antigravity-input px-4 py-3 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="w-full antigravity-input px-4 py-3 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 text-sm mt-3 flex items-center justify-center cursor-pointer"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-6 relative">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

