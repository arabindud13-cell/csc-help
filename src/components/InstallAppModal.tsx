import React from 'react';
import { Smartphone, Download, CheckCircle, Share, PlusSquare, Monitor, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/Radhamadhab_Online_Center_Logo_68908320.png"
                alt="Radhamadhab Online Center"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'en' ? 'Download & Install App' : 'অ্যাপ ডাউনলোড ও ইনস্টল করুন'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Radhamadhab Online Center' : 'রাধা মাধব অনলাইন সেন্টার'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
              {language === 'en' ? 'App Already Installed!' : 'অ্যাপটি ইতিমধ্যে আপনার ডিভাইসে ইনস্টল করা আছে!'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'en'
                ? 'You are running the standalone application from your home screen or desktop.'
                : 'আপনার হোম স্ক্রিন বা অ্যাপ ড্রয়ার থেকে এটি সরাসরি চালু করতে পারবেন।'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'en'
                ? 'Install this application directly onto your Android phone, iPhone, tablet or computer. Works offline with zero browser bars!'
                : 'কোনও জিপ ফাইল লাগবে না! সরাসরি আপনার মোবাইল বা কম্পিউটারে আসল অ্যাপ হিসেবে ইনস্টল করুন। ইন্টারনেট ছাড়াও দ্রুত কাজ করে।'}
            </p>

            {/* If 1-click install prompt is supported by browser */}
            {isInstallable && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'en' ? 'Install App on this Device' : 'এখনই ডিভাইসে অ্যাপ ডাউনলোড / ইনস্টল করুন'}</span>
              </button>
            )}

            {/* Step-by-step instructions for Android & Desktop Chrome */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="font-bold text-xs flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>{language === 'en' ? 'Android / Chrome Installation:' : 'অ্যান্ড্রয়েড / ক্রোম থেকে ইনস্টল করার নিয়ম:'}</span>
              </div>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  {language === 'en' ? 'Tap browser 3 dots menu (⋮)' : 'ব্রাউজারের ৩টি ডট মেনুতে (⋮) ট্যাপ করুন'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Select "Install App" or "Add to Home screen"'
                    : '"Install app" অথবা "Add to Home screen" নির্বাচন করুন'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Click "Install" to add Radhamadhab Online Center to your phone'
                    : '"Install" চাপলেই আপনার ফোনে সরাসরি অ্যাপ আইকন যোগ হয়ে যাবে'}
                </li>
              </ol>
            </div>

            {/* iOS Safari instructions */}
            {(isIOS || !isInstallable) && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="font-bold text-xs flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Share className="w-4 h-4 text-blue-500" />
                  <span>{language === 'en' ? 'iPhone / iPad (Safari) Installation:' : 'আইফোন / আইপ্যাড থেকে ইনস্টল:'}</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    {language === 'en' ? 'Tap the Share icon at bottom of Safari' : 'সাফারির নিচে থাকা শেয়ার (Share) বাটনে ট্যাপ করুন'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'Scroll down and tap "Add to Home Screen"'
                      : 'নিচে স্ক্রোল করে "Add to Home Screen" এ চাপুন'}
                  </li>
                  <li>
                    {language === 'en' ? 'Tap "Add" in top right corner' : 'উপরে ডানে "Add" এ চাপলেই ইনস্টল সম্পন্ন হবে'}
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
