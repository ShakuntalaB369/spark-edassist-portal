import React from 'react';
import { Link } from 'react-router-dom';

export const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-body flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-4 px-6 z-50 shadow-sm flex items-center justify-between">
        <span className="font-extrabold text-blue-600 dark:text-blue-400 tracking-wider text-sm">
          SPARK — EDASSIST FRAMEWORK
        </span>
        <Link 
          to="/login" 
          className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-450 border border-slate-350 dark:border-slate-700 px-3.5 py-1.5 rounded-full transition-all"
        >
          Back to Sign In
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[800px] w-full mx-auto px-6 py-10 grow flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-8 rounded-3xl shadow-sm text-left">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">
            Terms & Conditions
          </h1>

          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the SPARK EdAssist Framework, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the platform.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Account and Authentication</h2>
              <p>
                Users access the platform securely via Google Single Sign-On (SSO). You are responsible for maintaining the security of your Google account credentials. The framework is not liable for unauthorized access resulting from compromised email accounts.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Educational Assessment Usage</h2>
              <p>
                The platform is designed to run academic evaluation exercises, helping students assess their current knowledge across core educational topics. The system stores questions, answers, and completion records for performance review.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Skill Enhance & Personalized Insights</h2>
              <p>
                The Skill Enhance feature tracks competency growth, subject performance, and offers adaptive recommendations. Some functionalities rely on personalized context analysis, which is subject to user consent.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Limitations of AI-Generated Insights</h2>
              <p>
                Personalized study paths, bloom levels, feedback details, and next step recommendations are generated using artificial intelligence (AI) models. While we endeavor to ensure high quality, these insights are educational guidance materials only and do not guarantee specific academic performance outcomes or grades.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Consent, Expiry, and Withdrawal</h2>
              <p>
                Personalization features require explicit consent before active processing of historical subject performances is initiated.
              </p>
              <ul className="list-disc pl-5 mt-1 flex flex-col gap-1 text-slate-500">
                <li><strong>Collection:</strong> Consent is explicitly collected and recorded before launching personalized features.</li>
                <li><strong>Expiry:</strong> Recorded consents carry configured expiry timelines. Once expired, renewal is required to access personalization insights.</li>
                <li><strong>Withdrawal:</strong> You can withdraw consent at any time via the Privacy tab in the Sidebar. Withdrawal instantly restricts custom personalization.</li>
                <li><strong>Conflict:</strong> The system automatically warns you before initiating actions that conflict with your current recorded consent.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">7. User Responsibilities</h2>
              <p>
                Users must practice assessment integrity and complete exercises without automated scripts or plagiarized aids. Any commercial misuse or reverse engineering of the framework's assessment structure is prohibited.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">8. Account Termination & Support</h2>
              <p>
                We reserve the right to restrict access to accounts that violate platform security. For inquiries, configuration requests, or support, please access the platform's Support module.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs text-slate-400">
            <span>Last Updated: August 2026</span>
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;
