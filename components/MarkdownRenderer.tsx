import React, { useEffect, useId, useState } from 'react';
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

const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const id = useId().replace(/:/g, '-');

  useEffect(() => {
    let active = true;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
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
  }, [code, id]);

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

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
    components={{
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ),
      pre: ({ children }) => <>{children}</>,
      code: ({ inline, className, children, ...props }: any) => {
        const value = String(children).replace(/\n$/, '');
        const match = /language-([\w-]+)/.exec(className || '');

        if (match?.[1] === 'mermaid') {
          return <MermaidBlock code={value} />;
        }

        if (inline) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }

        return (
          <pre>
            <code className={className} {...props}>
              {value}
            </code>
          </pre>
        );
      },
      img: ({ src, alt }) => <img src={src || ''} alt={alt || ''} loading="lazy" />,
    }}
  >
    {content}
  </ReactMarkdown>
);

export default MarkdownRenderer;
