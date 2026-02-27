"use client";

import { motion } from "framer-motion";

export function AnimatedLogo() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 group-hover:shadow-primary/25 group-hover:border-primary/30 transition-all overflow-hidden"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-8 h-8 text-slate-800 dark:text-slate-100 drop-shadow-sm"
          fill="currentColor"
        >
          {/* Left Ear */}
          <circle cx="22" cy="22" r="14" />
          <circle cx="22" cy="22" r="7" fill="rgba(0,0,0,0.1)" className="dark:fill-white/10" />

          {/* Right Ear */}
          <circle cx="78" cy="22" r="14" />
          <circle cx="78" cy="22" r="7" fill="rgba(0,0,0,0.1)" className="dark:fill-white/10" />

          {/* Main Head */}
          <path d="M 12 55 C 12 15, 88 15, 88 55 C 88 100, 65 95, 50 95 C 35 95, 12 100, 12 55 Z" />

          {/* Inner Face/Snout area */}
          <ellipse cx="50" cy="68" rx="22" ry="16" fill="rgba(0,0,0,0.06)" className="dark:fill-white/10" />

          {/* Nose */}
          <path d="M 40 60 Q 50 56 60 60 Q 50 72 40 60 Z" fill="#0f172a" className="dark:fill-slate-900" />

          {/* Eyes */}
          <circle cx="34" cy="46" r="6" fill="#0f172a" className="dark:fill-slate-900" />
          <circle cx="66" cy="46" r="6" fill="#0f172a" className="dark:fill-slate-900" />

          {/* Eye Sparkles */}
          <circle cx="32" cy="44" r="2" fill="white" />
          <circle cx="64" cy="44" r="2" fill="white" />
        </svg>
      </motion.div>
      <div className="flex flex-col">
        <span className="font-bold text-xl tracking-tight leading-none text-slate-900 dark:text-white group-hover:text-primary transition-colors">
          Git<span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Mon</span>
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1.5 opacity-80">Insights</span>
      </div>
    </div>
  );
}
