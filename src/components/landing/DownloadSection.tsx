import React from 'react';
import { Download, Monitor, Smartphone, Terminal, ExternalLink, Check } from 'lucide-react';
import { DOWNLOAD_OPTIONS } from '../../content/productCopy';

export const DownloadSection: React.FC = () => {
  return (
    <section id="download" className="py-24 px-4 sm:px-8 border-b border-atkin-border max-w-[1180px] mx-auto w-full select-none">
      <div className="space-y-3 max-w-[720px] pb-16">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-atkin-muted">
          <span className="font-semibold text-atkin-ink">05 DISTRIBUTION</span>
          <span>/</span>
          <span>NATIVE CLIENTS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal leading-tight">
          Run ATKIN on your workstations and mobile companion.
        </h2>
        <p className="text-[15px] text-atkin-muted leading-relaxed font-sans">
          Download pre-built binaries for desktop, install the Android companion APK, or compile directly from the open-source repository.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DOWNLOAD_OPTIONS.map((opt) => (
          <div
            key={opt.href}
            className={`rounded-[8px] bg-atkin-surface border p-6 flex flex-col justify-between space-y-6 shadow-2xs ${
              opt.primary ? 'border-atkin-ink' : 'border-atkin-border'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded bg-atkin-bg border border-atkin-border">
                  {opt.platform === 'Windows' && <Monitor className="w-5 h-5 text-atkin-ink" />}
                  {opt.platform === 'Android' && <Smartphone className="w-5 h-5 text-atkin-ink" />}
                  {opt.platform.includes('Source') && <Terminal className="w-5 h-5 text-atkin-ink" />}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">
                  {opt.badge}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-serif text-atkin-ink font-normal">
                  {opt.title}
                </h3>
                <p className="text-[12px] font-mono text-atkin-muted">
                  {opt.requirement}
                </p>
              </div>

              <div className="text-[11.5px] font-mono text-atkin-muted bg-atkin-bg p-2.5 rounded border border-atkin-border truncate">
                {opt.filename || 'git clone github.com/vaibhav4046/proofline'}
              </div>
            </div>

            <div className="pt-2">
              <a
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 rounded-[4px] font-medium text-[12.5px] font-sans flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  opt.primary
                    ? 'bg-atkin-ink text-atkin-bg hover:opacity-90'
                    : 'border border-atkin-border bg-atkin-bg hover:bg-atkin-bg-subtle text-atkin-ink'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{opt.primary ? 'Download for Windows' : `Get ${opt.title}`}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
