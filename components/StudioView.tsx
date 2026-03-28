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
  const studioCopy = bundle.site.studio;
  const studioActionCopy = bundle.site.copy.studio ?? {};
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [noteText, setNoteText] = useState('');
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState<StudioResult>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
            <h3 className="font-bold">
              {getLocalizedText(studioActionCopy.resumeImportHeading ?? { 'zh-CN': '简历导入', en: 'Resume Import' }, locale)}
            </h3>
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
                setResult({
                  error: getLocalizedText(
                    studioActionCopy.selectResumeFirst ?? { 'zh-CN': '请先选择简历文件。', en: 'Please select a resume file first.' },
                    locale,
                  ),
                });
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
            {busy === 'profile'
              ? getLocalizedText(studioActionCopy.importing ?? { 'zh-CN': '导入中...', en: 'Importing...' }, locale)
              : getLocalizedText(studioActionCopy.importResume ?? { 'zh-CN': '导入简历', en: 'Import Resume' }, locale)}
          </button>
        </section>

        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <RefreshCw size={16} className="text-accent" />
            <h3 className="font-bold">
              {getLocalizedText(studioActionCopy.bundleOpsHeading ?? { 'zh-CN': 'Bundle 操作', en: 'Bundle Ops' }, locale)}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void sendForm(fetch(`${normalizedApiBase}/api/build`, { method: 'POST' }), 'build')}
              disabled={busy === 'build'}
              className="rounded border border-ide-border bg-ide-bg px-4 py-2 text-sm text-ide-text transition-colors hover:border-accent hover:text-accent"
            >
              {getLocalizedText(studioActionCopy.buildBundle ?? { 'zh-CN': '构建 Bundle', en: 'Build Bundle' }, locale)}
            </button>
            <button
              onClick={() => void sendForm(fetch(`${normalizedApiBase}/api/check`, { method: 'POST' }), 'check')}
              disabled={busy === 'check'}
              className="rounded border border-ide-border bg-ide-bg px-4 py-2 text-sm text-ide-text transition-colors hover:border-accent hover:text-accent"
            >
              {getLocalizedText(studioActionCopy.runChecks ?? { 'zh-CN': '运行校验', en: 'Run Checks' }, locale)}
            </button>
            <button
              onClick={() => void sendForm(fetch(`${normalizedApiBase}/api/preview/bundle`), 'preview')}
              disabled={busy === 'preview'}
              className="rounded border border-ide-border bg-ide-bg px-4 py-2 text-sm text-ide-text transition-colors hover:border-accent hover:text-accent"
            >
              {getLocalizedText(studioActionCopy.previewBundle ?? { 'zh-CN': '预览 Bundle', en: 'Preview Bundle' }, locale)}
            </button>
          </div>
          <p className="mt-4 text-xs text-ide-text-dim">
            {getLocalizedText(
              studioActionCopy.voiceHint ?? {
                'zh-CN': '语音录制仅在 CLI 路径中可用，并依赖本地可选扩展。',
                en: 'Voice capture is available through the CLI path and only activates when optional local extras are installed.',
              },
              locale,
            )}
          </p>
        </section>

        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <WandSparkles size={16} className="text-accent" />
            <h3 className="font-bold">
              {getLocalizedText(studioActionCopy.publishNoteHeading ?? { 'zh-CN': '发布短文', en: 'Publish Note' }, locale)}
            </h3>
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
            {busy === 'note'
              ? getLocalizedText(studioActionCopy.publishing ?? { 'zh-CN': '发布中...', en: 'Publishing...' }, locale)
              : getLocalizedText(studioActionCopy.publishNote ?? { 'zh-CN': '发布短文', en: 'Publish Note' }, locale)}
          </button>
        </section>

        <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
          <div className="mb-4 flex items-center gap-2 text-ide-text">
            <FlaskConical size={16} className="text-accent" />
            <h3 className="font-bold">
              {getLocalizedText(studioActionCopy.publishArticleHeading ?? { 'zh-CN': '发布文章', en: 'Publish Article' }, locale)}
            </h3>
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
            {busy === 'article'
              ? getLocalizedText(studioActionCopy.publishing ?? { 'zh-CN': '发布中...', en: 'Publishing...' }, locale)
              : getLocalizedText(studioActionCopy.publishArticle ?? { 'zh-CN': '发布文章', en: 'Publish Article' }, locale)}
          </button>
        </section>
      </div>

      <section className="rounded-xl border border-ide-border bg-ide-panel p-5">
        <h3 className="mb-4 font-bold text-ide-text">
          {getLocalizedText(studioActionCopy.studioResponse ?? { 'zh-CN': '创作台响应', en: 'Studio Response' }, locale)}
        </h3>
        <pre className="max-h-[360px] overflow-auto rounded border border-ide-border bg-ide-bg p-4 text-xs leading-6 text-ide-text-dim">
          {JSON.stringify(result ?? { status: 'idle' }, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default StudioView;
