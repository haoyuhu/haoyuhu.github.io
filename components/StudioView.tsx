import React, { useState } from 'react';
import { FileUp, FlaskConical, RefreshCw, TerminalSquare, WandSparkles } from 'lucide-react';
import { LocaleCode, PortfolioBundle } from '../types';
import { getLocalizedText, normalizeApiBaseUrl } from '../lib/i18n';

interface StudioViewProps {
  bundle: PortfolioBundle;
  locale: LocaleCode;
  apiBaseUrl?: string | null;
  onBundleReload: () => Promise<void>;
}

type StudioResult = Record<string, any> | null;

const StudioView: React.FC<StudioViewProps> = ({ bundle, locale, apiBaseUrl, onBundleReload }) => {
  const normalizedApiBase = normalizeApiBaseUrl(apiBaseUrl);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [noteText, setNoteText] = useState('');
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState<StudioResult>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const studioCopy = bundle.site.studio;

  const postFormData = (kind: 'note' | 'article', text: string, file?: File | null) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('dry_run', 'false');
    if (file) {
      formData.append('file', file);
    }
    return fetch(`${normalizedApiBase}/api/content/${kind}`, { method: 'POST', body: formData });
  };

  const sendForm = async (request: Promise<Response>, action: string) => {
    if (!normalizedApiBase) {
      setResult({ error: getLocalizedText(bundle.assistant.unavailableMessage, locale) });
      return;
    }
    setBusy(action);
    try {
      const response = await request;
      const payload = await response.json();
      setResult(payload);
      await onBundleReload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ide-border bg-ide-panel p-6">
        <div className="mb-3 flex items-center gap-3">
          <TerminalSquare size={18} className="text-accent" />
          <h2 className="text-xl font-bold text-ide-text">{getLocalizedText(studioCopy.title, locale)}</h2>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-ide-text-dim">{getLocalizedText(studioCopy.description, locale)}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <FileUp size={16} className="text-accent" />
            <h3 className="font-bold">Resume Import</h3>
          </div>
          <input
            type="file"
            accept=".pdf,.md,.markdown,.txt"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            className="mb-4 block w-full rounded border border-ide-border bg-ide-bg p-3 text-sm text-ide-text-dim"
          />
          <button
            onClick={() => {
              if (!resumeFile) {
                setResult({ error: 'Please select a resume file first.' });
                return;
              }
              const formData = new FormData();
              formData.append('file', resumeFile);
              formData.append('dry_run', 'false');
              void sendForm(fetch(`${normalizedApiBase}/api/profile/import`, { method: 'POST', body: formData }), 'profile');
            }}
            disabled={busy === 'profile'}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === 'profile' ? 'Importing...' : 'Import Resume'}
          </button>
        </section>

        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <RefreshCw size={16} className="text-accent" />
            <h3 className="font-bold">Bundle Ops</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void sendForm(fetch(`${normalizedApiBase}/api/build`, { method: 'POST' }), 'build')}
              disabled={busy === 'build'}
              className="rounded border border-ide-border bg-ide-bg px-4 py-2 text-sm text-ide-text transition-colors hover:border-accent hover:text-accent"
            >
              Build Bundle
            </button>
            <button
              onClick={() => void sendForm(fetch(`${normalizedApiBase}/api/check`, { method: 'POST' }), 'check')}
              disabled={busy === 'check'}
              className="rounded border border-ide-border bg-ide-bg px-4 py-2 text-sm text-ide-text transition-colors hover:border-accent hover:text-accent"
            >
              Run Checks
            </button>
            <button
              onClick={() => void sendForm(fetch(`${normalizedApiBase}/api/preview/bundle`), 'preview')}
              disabled={busy === 'preview'}
              className="rounded border border-ide-border bg-ide-bg px-4 py-2 text-sm text-ide-text transition-colors hover:border-accent hover:text-accent"
            >
              Preview Bundle
            </button>
          </div>
          <p className="mt-4 text-xs text-ide-text-dim">
            Voice capture is available through the CLI path and only activates when optional local extras are installed.
          </p>
        </section>

        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <WandSparkles size={16} className="text-accent" />
            <h3 className="font-bold">Publish Note</h3>
          </div>
          <textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Write a short note or paste transcript..."
            className="mb-4 h-36 w-full rounded border border-ide-border bg-ide-bg p-3 text-sm text-ide-text outline-none"
          />
          <button
            onClick={() => void sendForm(postFormData('note', noteText), 'note')}
            disabled={busy === 'note'}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === 'note' ? 'Publishing...' : 'Publish Note'}
          </button>
        </section>

        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <FlaskConical size={16} className="text-accent" />
            <h3 className="font-bold">Publish Article</h3>
          </div>
          <textarea
            value={articleText}
            onChange={(event) => setArticleText(event.target.value)}
            placeholder="Write a long-form article draft..."
            className="mb-4 h-36 w-full rounded border border-ide-border bg-ide-bg p-3 text-sm text-ide-text outline-none"
          />
          <button
            onClick={() => void sendForm(postFormData('article', articleText), 'article')}
            disabled={busy === 'article'}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === 'article' ? 'Publishing...' : 'Publish Article'}
          </button>
        </section>
      </div>

      <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
        <h3 className="mb-4 font-bold text-ide-text">Studio Response</h3>
        <pre className="max-h-[360px] overflow-auto rounded border border-ide-border bg-ide-bg p-4 text-xs leading-6 text-ide-text-dim">
          {JSON.stringify(result ?? { status: 'idle' }, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default StudioView;
