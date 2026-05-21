import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velix - Marketing at Velocity",
  description: "Automate and launch cohesive social media marketing campaigns instantly using Vertex AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#FFFDF8] text-slate-800 relative overflow-x-hidden flex flex-col font-sans">
        {/* Dynamic backdrop layout with grids, speed blurs, and speed trails */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          {/* Velocity Grid */}
          <div className="absolute inset-0 bg-grid-velocity opacity-60" />
          
          {/* Ambient Orange & Peach Glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-orange-100/30 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[75%] rounded-full bg-amber-100/25 blur-[140px]" />
          <div className="absolute top-[25%] right-[10%] w-[35%] h-[40%] rounded-full bg-orange-50/20 blur-[110px]" />
          
          {/* Dynamic Curved SVG Speed Trails */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M -100,200 C 300,100 500,600 1000,400 C 1500,200 1700,700 2200,500" 
              fill="none" 
              stroke="#F97316" 
              strokeWidth="2" 
              strokeDasharray="8 6" 
            />
            <path 
              d="M -50,250 C 350,150 550,650 1050,450 C 1550,250 1750,750 2250,550" 
              fill="none" 
              stroke="#FB923C" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
          </svg>
        </div>
        
        {children}
      </body>
    </html>
  );
}

