import React from 'react';
import { ShieldCheck, Scale, Layers } from 'lucide-react';

export const Footer = () => {
  return (
    <div className="mt-2">
      <div className="bg-white dark:bg-[#101522] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 flex flex-col gap-5">
        {/* Quote */}
        <div className="pl-4 border-l-2 border-[#1E3A8A] dark:border-blue-500">
          <p className="font-heading text-[15px] italic font-medium leading-relaxed text-slate-700 dark:text-slate-200">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">— Nelson Mandela</p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-[#1e293b]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={14} className="text-[#1E3A8A] dark:text-blue-400" />
            </div>
            <div>
              <div className="text-[11.5px] font-bold text-slate-800 dark:text-white tracking-wide">SECURE</div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Fairness and integrity.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Scale size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-[11.5px] font-bold text-slate-800 dark:text-white tracking-wide">FAIR</div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Equity and inclusion.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-[11.5px] font-bold text-slate-800 dark:text-white tracking-wide">INTELLIGENT</div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Pedagogical innovation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
