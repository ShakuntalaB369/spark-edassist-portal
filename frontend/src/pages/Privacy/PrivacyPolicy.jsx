import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>

          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
              <p>
                To provide academic assessments and custom reports, we collect only the necessary data:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li><strong>Account & Auth:</strong> Google email address, profile picture, name, and access token.</li>
                <li><strong>Profile configuration:</strong> Selected age group, educational context country, and subject preferences.</li>
                <li><strong>Assessment history:</strong> Answers selected, scores, accuracy percentage, time taken per assessment, and generated feedback reports.</li>
                <li><strong>Consent records:</strong> Timestamps, statuses (granted, declined, withdrawn, expired), and versions of personalization consent decisions.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. How We Use Information</h2>
              <p>
                We use collected information strictly to:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>Provide and verify academic assessments in real-time.</li>
                <li>Track and display your subject mastery score.</li>
                <li>Generate competency performance analysis (Foundational, Applied, Collaborative, Reflective).</li>
                <li>Provide personalized educational recommendations (subject to active user consent).</li>
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Personalization Consent & Rights</h2>
              <p>
                Personalization and custom study recommendations require active **Personalization Consent**. You have full control over this decision:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li><strong>Grant or Decline:</strong> You can grant or decline consent at any time. Decline restricts personalized recommendations.</li>
                <li><strong>Change or Withdraw:</strong> You can explicitly change or withdraw consent via the Privacy Settings page. Withdrawal takes effect immediately.</li>
                <li><strong>Expiry:</strong> Consent records carry an expiration limit, after which the system prompts a renewal to ensure your choices remain current.</li>
                <li><strong>Conflict system:</strong> If an action conflicts with your recorded consent, the system displays a clear warning prior to executing the operation.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Data Sharing and Third-Party API Usage</h2>
              <p>
                To generate detailed educational assessments and reports, the application uses external AI services. Your scores, subject categories, and responses may be shared securely with these AI services for report compilation. We do not share your private Google SSO tokens or personal credentials.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Data Retention</h2>
              <p>
                We retain your account details, assessments, and consent history as long as your profile is active on the platform. You may request account and data deletion at any time through our Support channels.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Security</h2>
              <p>
                We implement industry-standard secure socket layers (SSL), Google authentication token verification, and encryption protocols to protect your profile details and assessment history.
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

export default PrivacyPolicy;
