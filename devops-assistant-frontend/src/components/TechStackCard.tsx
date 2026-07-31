'use client';

import { getLanguageColor } from '@/lib/utils';

interface TechStackCardProps {
  languages?: string[];
  framework?: string;
  database?: string;
  runtime?: string;
}

export default function TechStackCard({ languages = [], framework, database, runtime }: TechStackCardProps) {
  const hasTech = languages.length > 0 || framework || database || runtime;

  if (!hasTech) return null;

  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Detected Stack
      </h3>

      <div className="space-y-3">
        {languages.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className={`badge border text-xs ${getLanguageColor(lang)}`}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {(framework || database || runtime) && (
          <div className="space-y-2 pt-1">
            {framework && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-400">Framework</span>
                <span className="text-xs font-semibold text-slate-800">{framework}</span>
              </div>
            )}
            {database && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-400">Database</span>
                <span className="text-xs font-semibold text-slate-800">{database}</span>
              </div>
            )}
            {runtime && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-slate-400">Runtime</span>
                <span className="text-xs font-semibold text-slate-800">{runtime}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}