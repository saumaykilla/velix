import React from 'react';
import { createClient } from '@/utils/supabase/server';

export default async function OverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex-grow p-[16px] md:p-[40px] overflow-y-auto w-full relative">
      <div className="max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              Marketing Overview
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Track your performance velocity across all active channels.
            </p>
          </div>
          <button className="sm:hidden w-full py-3 px-4 rounded-lg bg-gradient-to-br from-secondary-container to-primary-container text-white font-label-sm text-label-sm shadow-[0_12px_24px_-8px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 cursor-pointer border-none focus:outline-none">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Campaign
          </button>
        </div>

        {/* Key Performance Metrics (Bento Grid Top Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Metric Card 1 */}
          <div className="border border-primary/10 rounded-xl p-6 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.12)] transition-shadow duration-300 relative group overflow-hidden bg-glass">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -z-10 group-hover:bg-primary-container/10 transition-colors duration-500" />
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Active Campaigns
            </p>
            <div className="flex items-end justify-between">
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none">24</h3>
              <div className="flex items-center text-secondary font-label-sm text-label-sm bg-secondary/10 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="ml-1 font-bold">+3</span>
              </div>
            </div>
          </div>

          {/* Metric Card 2 */}
          <div className="border border-primary/10 rounded-xl p-6 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.12)] transition-shadow duration-300 relative group overflow-hidden bg-glass">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -z-10 group-hover:bg-primary-container/10 transition-colors duration-500" />
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Total Reach
            </p>
            <div className="flex items-end justify-between">
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none">1.2M</h3>
              <div className="flex items-center text-secondary font-label-sm text-label-sm bg-secondary/10 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="ml-1 font-bold">12%</span>
              </div>
            </div>
          </div>

          {/* Metric Card 3 */}
          <div className="border border-primary/10 rounded-xl p-6 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.12)] transition-shadow duration-300 relative group overflow-hidden bg-glass">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -z-10 group-hover:bg-primary-container/10 transition-colors duration-500" />
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Avg Conversion
            </p>
            <div className="flex items-end justify-between">
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none">4.8%</h3>
              <div className="flex items-center text-on-surface-variant font-label-sm text-label-sm bg-surface-variant/50 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                <span className="ml-1 font-bold">0%</span>
              </div>
            </div>
          </div>

          {/* Metric Card 4 */}
          <div className="border border-primary/10 rounded-xl p-6 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.12)] transition-shadow duration-300 relative group overflow-hidden bg-glass">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -z-10 group-hover:bg-primary-container/10 transition-colors duration-500" />
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Blended ROI
            </p>
            <div className="flex items-end justify-between">
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-primary leading-none">312%</h3>
              <div className="flex items-center text-primary-container font-label-sm text-label-sm bg-primary-container/10 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="ml-1 font-bold">24%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Content & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Campaigns */}
          <div className="lg:col-span-2 border border-primary/10 rounded-xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.03)] overflow-hidden flex flex-col bg-glass">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Campaigns</h3>
              <button className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer border-none bg-transparent focus:outline-none">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/30">
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
                      Campaign
                    </th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
                      Status
                    </th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium text-right">
                      Spend
                    </th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium text-right">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5 text-sm">
                  <tr className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-body-md text-body-md font-semibold text-on-surface">Q4 Alpha Launch</p>
                      <p className="font-label-sm text-label-sm text-tertiary-container mt-1">Multi-channel</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-[10px] bg-primary-container/10 text-primary border border-primary/20 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-label-sm text-label-sm text-on-surface">$12,450</td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-6 flex items-end gap-[2px] opacity-70 group-hover:opacity-100 transition-opacity ml-auto justify-end">
                        <div className="w-2 bg-secondary-container rounded-t-sm h-[30%]" />
                        <div className="w-2 bg-secondary-container rounded-t-sm h-[50%]" />
                        <div className="w-2 bg-secondary-container rounded-t-sm h-[40%]" />
                        <div className="w-2 bg-secondary-container rounded-t-sm h-[70%]" />
                        <div className="w-2 bg-primary-container rounded-t-sm h-[90%]" />
                        <div className="w-2 bg-primary rounded-t-sm h-[100%]" />
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-body-md text-body-md font-semibold text-on-surface">Retargeting V2</p>
                      <p className="font-label-sm text-label-sm text-tertiary-container mt-1">Social Paid</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-[10px] bg-surface-variant text-on-surface-variant border border-outline-variant/30 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mr-1.5" />
                        Scheduled
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-label-sm text-label-sm text-on-surface">$3,200</td>
                    <td className="px-6 py-4 text-right text-tertiary-container font-label-sm text-[10px]">—</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-body-md text-body-md font-semibold text-on-surface">Holiday Promo Email</p>
                      <p className="font-label-sm text-label-sm text-tertiary-container mt-1">Direct</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-[10px] bg-surface-container-high text-on-surface border border-outline-variant/20 font-bold">
                        Draft
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-label-sm text-label-sm text-on-surface">$0</td>
                    <td className="px-6 py-4 text-right text-tertiary-container font-label-sm text-[10px]">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performing Channels */}
          <div className="border border-primary/10 rounded-xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.03)] p-6 flex flex-col bg-glass">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Top Channels</h3>
            <div className="flex flex-col gap-6 flex-1">
              {/* Channel 1 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">share</span>
                    Social Paid
                  </span>
                  <span className="font-label-sm text-label-sm text-primary">45%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-container to-primary-container rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>
              {/* Channel 2 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">search</span>
                    Search Ads
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">32%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: '32%' }} />
                </div>
              </div>
              {/* Channel 3 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-tertiary-container">mail</span>
                    Email Direct
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary-container">23%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-outline-variant rounded-full" style={{ width: '23%' }} />
                </div>
              </div>
            </div>
            <button className="mt-6 w-full py-2.5 border border-primary/20 rounded-lg text-primary font-label-sm text-label-sm hover:bg-primary/5 transition-colors cursor-pointer focus:outline-none bg-transparent font-semibold">
              Detailed Breakdown
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
