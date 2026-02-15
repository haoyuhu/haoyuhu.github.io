import React, { useState, useRef } from 'react';
import { Share2, Wand2, Hash, Loader2, FileText, Mic, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BlogPost } from '../types';
import { summarizeInspiration } from '../services/geminiService';
import { toPng } from 'html-to-image';
import AudioPlayer from './AudioPlayer';

interface BlogCardProps {
  post: BlogPost;
  defaultExpanded?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, defaultExpanded = false }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Articles collapse by default unless specified, Notes expand by default
  const isArticle = post.postType === 'article';
  const [expanded, setExpanded] = useState(defaultExpanded || !isArticle);
  
  // Lazy rendering state: Only render heavy content (Markdown/Media) if it has been expanded at least once
  const [hasExpanded, setHasExpanded] = useState(expanded);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleExpandToggle = () => {
    if (!expanded) setHasExpanded(true);
    setExpanded(!expanded);
  };

  const handleSummarize = async () => {
    if (summary) return;
    setIsSummarizing(true);
    const result = await summarizeInspiration(post.content);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleShare = async () => {
    if (cardRef.current) {
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: '#ffffff' }); 
            const link = document.createElement('a');
            link.download = `inspiration-${post.id}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
  };

  const getIcon = () => {
    switch(post.mediaType) {
        case 'audio': return <Mic size={14} className="text-geek-orange" />;
        case 'image': return <ImageIcon size={14} className="text-geek-orange" />;
        default: return <FileText size={14} className="text-geek-orange" />;
    }
  };

  return (
    <div className="mb-6 relative group">
       {/* Timeline connector */}
      <div className="absolute left-[-21px] top-6 bottom-[-24px] w-px bg-ide-border hidden md:block group-last:hidden"></div>
      
      <div 
        ref={cardRef}
        className={`bg-ide-bg rounded-lg border border-ide-border transition-all duration-200 hover:border-geek-orange/50 overflow-hidden ${expanded ? 'shadow-md ring-1 ring-ide-border' : ''}`}
      >
        {/* Header Bar - Always Visible */}
        <div 
            className="flex items-center gap-3 p-3 bg-ide-sidebar/30 border-b border-ide-border cursor-pointer hover:bg-ide-sidebar/60 transition-colors"
            onClick={handleExpandToggle}
        >
             {/* Timeline dot replacement */}
             <div className="md:hidden w-2 h-2 rounded-full bg-geek-orange"></div>

            <div className={`flex-shrink-0 w-8 h-8 rounded bg-ide-bg flex items-center justify-center border border-ide-border shadow-sm ${expanded ? 'text-geek-orange border-geek-orange/30' : ''}`}>
               {getIcon()}
            </div>
            
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                     <h3 className={`font-mono font-bold truncate text-ide-text ${isArticle ? 'text-lg' : 'text-sm'}`}>
                        {post.title || post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '')}
                     </h3>
                     {isArticle && <span className="text-[9px] uppercase bg-ide-sidebar border border-ide-border px-1.5 py-0.5 rounded text-ide-text-dim font-mono tracking-wider">Article</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-ide-text-dim font-mono mt-0.5">
                    <span>{formatDate(post.date)}</span>
                    <span>•</span>
                    <span className="text-geek-orange opacity-80">type="{post.mediaType}"</span>
                </div>
            </div>

            {isArticle && (
                <button className="text-ide-text-dim hover:text-geek-orange transition-colors p-1">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            )}
        </div>

        {/* Expandable Content */}
        {expanded && (
            <div className="p-5 animate-in slide-in-from-top-1 duration-200">
                {/* Lazy Load Wrapper */}
                {hasExpanded ? (
                    <>
                         {/* Media Rendering */}
                        {post.mediaUrl && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-ide-border bg-black/5">
                                {post.mediaType === 'image' && (
                                    <img src={post.mediaUrl} alt="Attachment" className="w-full h-auto" loading="lazy" />
                                )}
                                {post.mediaType === 'audio' && (
                                    <div className="p-4 bg-ide-bg">
                                        <AudioPlayer src={post.mediaUrl} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Markdown Rendering */}
                        <div className="markdown-body font-mono text-sm leading-7">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>

                        {/* AI Summary */}
                        {summary && (
                            <div className="mt-4 bg-geek-orange/5 p-3 rounded border border-geek-orange/20 text-sm font-mono">
                                <div className="flex items-center gap-2 text-geek-orange font-bold text-xs uppercase mb-2">
                                    <Wand2 size={12} /> genai_summary.txt
                                </div>
                                <p className="text-ide-text">{summary}</p>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-dashed border-ide-border">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-[10px] text-ide-text-dim bg-ide-sidebar border border-ide-border px-2 py-1 rounded font-mono hover:border-geek-orange hover:text-geek-orange transition-colors cursor-default">
                                        <Hash size={10} /> {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleSummarize(); }}
                                    disabled={isSummarizing}
                                    className="p-2 text-ide-text-dim hover:text-geek-orange hover:bg-ide-sidebar rounded transition-colors"
                                    title="Summarize with AI"
                                >
                                    {isSummarizing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                                    className="p-2 text-ide-text-dim hover:text-geek-orange hover:bg-ide-sidebar rounded transition-colors"
                                    title="Export Image"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-geek-orange" size={24} />
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;