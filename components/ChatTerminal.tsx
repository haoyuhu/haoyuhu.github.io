import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Terminal as TerminalIcon, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PixelMascot } from '../constants';
import { AssistantConfig, LocaleCode } from '../types';
import { getLocalizedText, normalizeApiBaseUrl } from '../lib/i18n';

interface ChatTerminalProps {
  assistant: AssistantConfig;
  locale: LocaleCode;
  apiBaseUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatTerminal: React.FC<ChatTerminalProps> = ({
  assistant,
  locale,
  apiBaseUrl,
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedApiBase = normalizeApiBaseUrl(apiBaseUrl);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, booting]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const bootMessages = assistant.bootSequence[locale] ?? assistant.bootSequence.en;
    if (messages.length === 0) {
      setMessages([{ role: 'system', content: bootMessages.join('\n') }]);
      setBooting(false);
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [assistant.bootSequence, isOpen, locale, messages.length]);

  const runCommand = async (command: string) => {
    if (!command.trim()) {
      return;
    }
    setMessages((current) => [...current, { role: 'user', content: `haoyu@portfolio:~$ ${command}` }]);
    setInput('');

    const args = command.trim().split(/\s+/);
    if (args[0] !== 'askme') {
      setMessages((current) => [...current, { role: 'system', content: `bash: ${args[0]}: command not found. Try askme.` }]);
      return;
    }

    if (args.includes('--help') || args.includes('-h')) {
      setMessages((current) => [...current, { role: 'system', content: getLocalizedText(assistant.helpText, locale) }]);
      return;
    }

    if (!normalizedApiBase) {
      setMessages((current) => [...current, { role: 'system', content: getLocalizedText(assistant.unavailableMessage, locale) }]);
      return;
    }

    let target = 'global';
    let verbose = false;
    const queryParts: string[] = [];
    for (let index = 1; index < args.length; index += 1) {
      const arg = args[index];
      if (arg === '-t' || arg === '--target') {
        target = args[index + 1] || 'global';
        index += 1;
      } else if (arg === '--verbose' || arg === '-v') {
        verbose = true;
      } else {
        queryParts.push(arg);
      }
    }

    const query = queryParts.join(' ').replace(/^["']|["']$/g, '');
    if (!query) {
      setMessages((current) => [
        ...current,
        { role: 'system', content: getLocalizedText(assistant.helpText, locale) },
      ]);
      return;
    }

    setLoading(true);
    setMessages((current) => [...current, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const response = await fetch(`${normalizedApiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, target, verbose }),
      });
      if (!response.ok || !response.body) {
        throw new Error(response.statusText);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        assistantResponse += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            last.content = assistantResponse;
          }
          return next;
        });
      }
    } catch (error) {
      setMessages((current) => [
        ...current.slice(0, -1),
        { role: 'system', content: `Connection failed: ${String(error)}` },
      ]);
    } finally {
      setLoading(false);
      setMessages((current) => {
        const next = [...current];
        const last = next[next.length - 1];
        if (last?.role === 'assistant') {
          last.isStreaming = false;
        }
        return next;
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-ide-border bg-ide-bg font-mono text-sm shadow-2xl">
        <div className="flex items-center justify-between border-b border-ide-border bg-ide-panel px-4 py-2">
          <div className="flex items-center gap-2 text-ide-text">
            <TerminalIcon size={14} />
            <span className="font-bold">{getLocalizedText(assistant.title, locale)}</span>
          </div>
          <button onClick={onClose} className="text-ide-text-dim transition-colors hover:text-ide-text">
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="mb-6 flex items-center gap-4 opacity-70">
            <PixelMascot className="h-12 w-12 text-accent" />
            <div>
              <div className="text-lg font-bold text-accent">{getLocalizedText(assistant.title, locale)}</div>
              <div className="text-xs text-ide-text-dim">Version {assistant.version}</div>
            </div>
          </div>

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'mt-6 font-bold text-white' : ''}>
              {message.role === 'assistant' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <div className={message.role === 'system' ? 'whitespace-pre-wrap text-yellow-400' : ''}>{message.content}</div>
              )}
              {message.isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-ide-border bg-ide-panel p-4">
          <span className="font-bold text-accent">➜</span>
          <span className="font-bold text-sky-400">~</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void runCommand(input);
              }
            }}
            placeholder={booting ? 'Booting...' : getLocalizedText(assistant.helpText, locale)}
            disabled={booting || loading}
            className="flex-1 bg-transparent text-white outline-none placeholder:text-ide-text-dim"
          />
          <button
            onClick={() => void runCommand(input)}
            disabled={booting || loading}
            className="rounded bg-accent px-3 py-2 text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTerminal;
