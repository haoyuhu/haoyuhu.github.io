import React, { useEffect, useId, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import groovy from 'highlight.js/lib/languages/groovy';
import java from 'highlight.js/lib/languages/java';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import yaml from 'highlight.js/lib/languages/yaml';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  code: string;
}

interface MarkdownRendererProps {
  content: string;
}

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('java', java);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('python', python);
hljs.registerLanguage('yaml', yaml);

const detectDarkMode = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

const useDarkModeFlag = () => {
  const [isDark, setIsDark] = useState(detectDarkMode);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains('dark'));
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

const normalizeLanguage = (className?: string) => {
  const match = /language-([\w-]+)/.exec(className || '');
  const raw = (match?.[1] || '').toLowerCase();
  if (!raw) {
    return '';
  }

  const aliasMap: Record<string, string> = {
    shell: 'bash',
    sh: 'bash',
    zsh: 'bash',
    ts: 'typescript',
    js: 'javascript',
    py: 'python',
    cxx: 'cpp',
    yml: 'yaml',
    md: 'markdown',
    text: 'plaintext',
  };

  return aliasMap[raw] || raw;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const highlightCode = (value: string, className?: string) => {
  const language = normalizeLanguage(className);
  if (language && hljs.getLanguage(language)) {
    return {
      highlighted: hljs.highlight(value, { language, ignoreIllegals: true }).value,
      language,
    };
  }

  return {
    highlighted: escapeHtml(value),
    language: '',
  };
};

const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const id = useId().replace(/:/g, '-');
  const isDark = useDarkModeFlag();

  useEffect(() => {
    let active = true;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: isDark ? 'dark' : 'default',
        });
        const { svg: output } = await mermaid.render(`mermaid-${id}`, code);
        if (!active) {
          return;
        }
        setSvg(output);
        setError('');
      } catch (renderError) {
        if (!active) {
          return;
        }
        setSvg('');
        setError(renderError instanceof Error ? renderError.message : 'Failed to render Mermaid diagram.');
      }
    };

    void renderDiagram();
    return () => {
      active = false;
    };
  }, [code, id, isDark]);

  if (error) {
    return (
      <div className="mermaid-block">
        <div className="mermaid-error">{error}</div>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="mermaid-loading">Rendering diagram...</div>;
  }

  return <div className="mermaid-block" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const isDark = useDarkModeFlag();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        em: ({ children }) => <strong>{children}</strong>,
        i: ({ children }) => <strong>{children}</strong>,
        u: ({ children }) => <strong>{children}</strong>,
        pre: ({ children }) => <>{children}</>,
        code: ({ inline, className, children, ...props }: any) => {
          const value = String(children).replace(/\n$/, '');
          const language = normalizeLanguage(className);

          if (language === 'mermaid') {
            return <MermaidBlock code={value} />;
          }

          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          const { highlighted, language: highlightedLanguage } = highlightCode(value, className);

          return (
            <pre data-code-theme={isDark ? 'dark' : 'light'}>
              <code
                className={`hljs${highlightedLanguage ? ` language-${highlightedLanguage}` : ''}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          );
        },
        img: ({ src, alt }) => <img src={src || ''} alt={alt || ''} loading="lazy" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
