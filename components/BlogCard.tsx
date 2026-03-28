import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Image as ImageIcon, Mic, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import AudioPlayer from './AudioPlayer';
import MarkdownRenderer from './MarkdownRenderer';
import { LocaleCode, PostEntry } from '../types';
import { formatPostDate, getLocalizedText, localizePostTag } from '../lib/i18n';

interface BlogCardProps {
  post: PostEntry;
  locale: LocaleCode;
  defaultExpanded?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, locale, defaultExpanded = false }) => {
  const isArticle = post.kind === 'article';
  const [expanded, setExpanded] = useState(defaultExpanded || !isArticle);

  const getIcon = () => {
    if (post.media?.type === 'audio') {
      return <Mic size={14} className="text-accent" />;
    }
    if (post.media?.type === 'image') {
      return <ImageIcon size={14} className="text-accent" />;
    }
    return <FileText size={14} className="text-accent" />;
  };

  const exportAsImage = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const target = event.currentTarget.closest('[data-blog-card]');
    if (!target) {
      return;
    }
    const dataUrl = await toPng(target as HTMLElement, { cacheBust: true, backgroundColor: '#111827' });
    const link = document.createElement('a');
    link.download = `${post.slug}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative mb-6">
      <div
        data-blog-card
        className={`overflow-hidden rounded-lg border border-ide-border bg-ide-bg transition-all ${
          expanded ? 'ring-1 ring-ide-border' : ''
        }`}
      >
        <div
          className="flex cursor-pointer items-center gap-3 border-b border-ide-border bg-ide-panel/60 p-3 transition-colors hover:bg-ide-panel"
          onClick={() => setExpanded((current) => !current)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded border border-ide-border bg-ide-bg">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`truncate font-mono font-bold text-ide-text ${isArticle ? 'text-lg' : 'text-sm'}`}>
                {getLocalizedText(post.title, locale)}
              </h3>
              {isArticle && (
                <span className="rounded border border-ide-border bg-ide-bg px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ide-text-dim">
                  Article
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-ide-text-dim">
              <span>{formatPostDate(post.date, post.publishedAt, locale)}</span>
              <span>•</span>
              <span className="text-accent">{post.kind}</span>
            </div>
          </div>
          {isArticle && (
            <button className="rounded p-1 text-ide-text-dim transition-colors hover:text-accent" aria-label="Toggle article">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {expanded && (
          <div className="space-y-4 p-5">
            <div className="rounded border border-accent/20 bg-accent/5 p-3 text-sm leading-6 text-ide-text-dim">
              {getLocalizedText(post.summary, locale)}
            </div>

            {post.media?.url && post.media.type === 'audio' && <AudioPlayer src={post.media.url} />}
            {post.media?.url && post.media.type === 'image' && (
              <img src={post.media.url} alt={getLocalizedText(post.title, locale)} className="w-full rounded border border-ide-border" loading="lazy" />
            )}

            <div className="markdown-body text-sm leading-7">
              <MarkdownRenderer content={getLocalizedText(post.body, locale)} />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-dashed border-ide-border pt-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={`${post.slug}-${tag}`}
                    className="rounded border border-ide-border bg-ide-panel px-2 py-1 text-[10px] uppercase tracking-wide text-ide-text-dim"
                  >
                    #{localizePostTag(tag, locale)}
                  </span>
                ))}
              </div>

              <button
                onClick={exportAsImage}
                className="rounded p-2 text-ide-text-dim transition-colors hover:bg-ide-panel hover:text-accent"
                title="Export as image"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
