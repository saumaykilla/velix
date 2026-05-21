import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

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
            href="/settings"
            className="text-sm font-semibold text-slate-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-500/5 transition-colors"
          >
            Settings
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

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 sm:px-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            Hello, {displayName}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Welcome to your autonomous marketing velocity console.
          </p>
        </div>

        {/* Dashboard Grid Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: New Project */}
          <div className="glass-card rounded-[24px] p-6 glass-card-hover flex flex-col justify-between h-52 group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-4 border border-orange-500/20 shadow-[0_2px_8px_rgba(249,115,22,0.06)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                New Campaign
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Ingest your brand context, site URLs, and themes to initiate campaign generation.
              </p>
            </div>
            <button className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-4 transition-colors">
              Get Started <span>&rarr;</span>
            </button>
          </div>

          {/* Card 2: Settings */}
          <Link
            href="/settings"
            className="glass-card rounded-[24px] p-6 glass-card-hover flex flex-col justify-between h-52 group text-left"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-4 border border-orange-500/20 shadow-[0_2px_8px_rgba(249,115,22,0.06)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                GCP Settings
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Connect your Google Cloud Vertex AI coordinates, locations, and environment configurations.
              </p>
            </div>
            <span className="text-sm font-bold text-orange-600 flex items-center gap-1 mt-4">
              Configure <span>&rarr;</span>
            </span>
          </Link>

          {/* Card 3: Campaigns History */}
          <div className="glass-card rounded-[24px] p-6 glass-card-hover flex flex-col justify-between h-52 group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-4 border border-orange-500/20 shadow-[0_2px_8px_rgba(249,115,22,0.06)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                Campaign Logs
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Review, distribute, and orchestrate visual and textual outputs generated by Velix.
              </p>
            </div>
            <button className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-4 transition-colors">
              View History <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Visual Campaign Flow Timeline Representation */}
        <div className="glass-card rounded-[24px] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Engine Idle
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Autonomous Campaign Stream Pipeline
            </h3>
            <p className="text-slate-500 text-sm">
              How Velix launches your campaigns at the speed of thought.
            </p>
          </div>

          {/* Connected Timeline Flow */}
          <div className="relative">
            {/* SVG Connection Dotted Lines representing velocity flow */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 hidden md:block px-12 z-0">
              <svg className="w-full h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 10 10 L 800 10" 
                  stroke="#F97316" 
                  strokeWidth="2" 
                  strokeDasharray="6 6" 
                  className="opacity-25"
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/15 mb-3 border-4 border-[#FFFDF8] relative z-10">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Scrape Website</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                  Extract content, colors, and objectives directly from your target URLs.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm mb-3 border-4 border-[#FFFDF8] relative z-10">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Strategy & Context</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                  Process goals and reference previous campaign assets for consistent storytelling.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm mb-3 border-4 border-[#FFFDF8] relative z-10">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Generate Assets</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                  Produce images, captions, hashtags, and cohesive video storyboards.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm mb-3 border-4 border-[#FFFDF8] relative z-10">
                  4
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Deploy Velocity</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                  Export high-conversion campaigns ready for Instagram, LinkedIn, and TikTok.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-orange-500/5 pt-6 text-center">
            <p className="text-slate-400 text-sm mb-1">Ready to start?</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Configure your GCP Vertex AI connection in <Link href="/settings" className="text-orange-600 hover:text-orange-700 font-bold transition-colors">Settings</Link> to run the campaign stream.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
