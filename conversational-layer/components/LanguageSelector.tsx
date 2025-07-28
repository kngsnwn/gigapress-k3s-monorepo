'use client';

import { useI18n } from '@/lib/i18n';
import { Language } from '@/lib/i18n/types';

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{t.settings.language}:</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}