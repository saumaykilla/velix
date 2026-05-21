import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Navigation bar */}
      <header className="w-full glass-card border-b border-orange-500/5 py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Velix Monogram Badge */}
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 font-heading font-extrabold text-lg border border-orange-500/20 shadow-[0_2px_8px_rgba(249,115,22,0.08)]">
            VX
          </div>
          <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
            Velix
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-500/5 transition-colors"
          >
            Dashboard
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-bold text-white bg-slate-900 hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm hover:shadow-md"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main settings content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 sm:px-8 relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
              Workspace Settings
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Configure Google Vertex AI integrations and project specifications.
            </p>
          </div>

          <div className="inline-flex items-center self-start sm:self-auto gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Supabase Connected
          </div>
        </div>

        <div className="space-y-6">
          {/* GCP Configuration Card */}
          <div className="glass-card rounded-[24px] p-8 relative overflow-hidden">
            {/* Ambient inner soft glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-orange-100/20 rounded-full blur-2xl pointer-events-none" />

            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Google Cloud Platform (GCP) Configuration
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Configure your Google Vertex AI credentials to enable marketing copy, image, and video generation.
              </p>
            </div>

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="projectId" className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
                    GCP Project ID
                  </label>
                  <input
                    id="projectId"
                    type="text"
                    className="w-full antigravity-input px-4 py-3 text-slate-900 placeholder-slate-400 text-sm font-mono-jetbrains"
                    placeholder="my-gcp-project-12345"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
                    Vertex AI Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="w-full antigravity-input px-4 py-3 text-slate-900 placeholder-slate-400 text-sm font-mono-jetbrains"
                    placeholder="us-central1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5 pl-1">
                  Google Service Account Key (JSON)
                </label>

                {/* Upload drag drop zone */}
                <div className="border border-dashed border-orange-200 hover:border-orange-400 rounded-xl p-6 bg-orange-50/5 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center group">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_2px_8px_rgba(249,115,22,0.06)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Click to upload or drag & drop GCP key file
                  </p>
                  <p className="text-xs text-slate-400">
                    JSON file containing your service account private credentials.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>

          {/* User Account Card */}
          <div className="glass-card rounded-[24px] p-8 relative overflow-hidden">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                User Session Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50 text-sm">
                <span className="text-slate-400 font-semibold">Logged in as</span>
                <span className="text-slate-800 font-mono-jetbrains font-medium">{user?.email}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-400 font-semibold">Last sign in time</span>
                <span className="text-slate-600 font-mono-jetbrains text-xs">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

