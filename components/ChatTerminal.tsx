import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon, Send, Loader2 } from 'lucide-react';
import { PixelMascot } from '../constants';
import ReactMarkdown from 'react-markdown';

interface ChatTerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatTerminal: React.FC<ChatTerminalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBooting]);

  // Boot sequence & Help command
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsBooting(true);
      
      const bootSequence = async () => {
        const welcomeMsg: Message = { role: 'system', content: '' };
        setMessages([welcomeMsg]);
        
        const text = "Initialising Interactive Shell v2.4.0...\nLoading knowledge base...\nType 'askme --help' to get started.";
        
        for (let i = 0; i < text.length; i++) {
          await new Promise(r => setTimeout(r, 20));
          setMessages(prev => [{ ...prev[0], content: text.substring(0, i + 1) }]);
        }
        setIsBooting(false);
        
        // Auto-run help after boot
        handleCommand('askme --help', true);
      };
      
      bootSequence();
    }
    
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCommand = async (cmd: string, isAuto = false) => {
    if (!cmd.trim()) return;

    if (!isAuto) {
        setMessages(prev => [...prev, { role: 'user', content: `haoyu@portfolio:~$ ${cmd}` }]);
        setInput('');
    }

    // Parsing logic for visual feedback
    const args = cmd.trim().split(/\s+/);
    const mainCmd = args[0];
    
    if (mainCmd !== 'askme') {
        setMessages(prev => [...prev, { role: 'system', content: `bash: ${mainCmd}: command not found. Try 'askme'.` }]);
        return;
    }

    if (args.includes('--help') || args.includes('-h')) {
        const helpText = `
Usage: askme [OPTIONS] [QUERY]

Description:
  Interactive AI agent with access to Haoyu's full portfolio context.

Options:
  -v, --verbose     Show detailed reasoning and sourcing.
  -t, --target      Limit context scope. Values: [info, cv, project, article, garden]

Examples:
  askme "Who are you?"
  askme -t project "Tell me about the agent-orchestrator"
  askme -v -t cv "What is his experience with Kubernetes?"
`;
        setMessages(prev => [...prev, { role: 'system', content: helpText }]);
        return;
    }

    // Real API Call
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    // Parse options
    let target = 'global';
    let verbose = false;
    let queryParts = [];

    for (let i = 1; i < args.length; i++) {
        if (args[i] === '-v' || args[i] === '--verbose') {
            verbose = true;
        } else if (args[i] === '-t' || args[i] === '--target') {
            if (i + 1 < args.length) {
                target = args[i + 1];
                i++; // skip next arg
            }
        } else {
            queryParts.push(args[i]);
        }
    }

    const query = queryParts.join(' ').replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any

    if (!query) {
         setMessages(prev => {
            const newArr = [...prev];
            // Remove the empty assistant message
            newArr.pop(); 
            return [...newArr, { role: 'system', content: 'Please provide a question. Usage: askme [OPTIONS] "QUESTION"' }];
         });
         setIsLoading(false);
         return;
    }

    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, target, verbose })
        });

        if (!response.ok || !response.body) {
             throw new Error(response.statusText);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantResponse = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            assistantResponse += chunk;
            
            setMessages(prev => {
                const newArr = [...prev];
                const last = newArr[newArr.length - 1];
                if (last.role === 'assistant') {
                    last.content = assistantResponse;
                }
                return newArr;
            });
        }

    } catch (error) {
        setMessages(prev => {
             const newArr = [...prev];
             // Remove the empty assistant message or update it
             if (newArr[newArr.length-1].role === 'assistant' && !newArr[newArr.length-1].content) {
                 newArr.pop();
             }
             return [...newArr, { role: 'system', content: `Error: Connection failed. Is the backend running? (${error})` }];
        });
    } finally {
        setIsLoading(false);
        setMessages(prev => {
            const newArr = [...prev];
            if (newArr.length > 0 && newArr[newArr.length - 1].role === 'assistant') {
                newArr[newArr.length - 1].isStreaming = false;
            }
            return newArr;
        });
        setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleCommand(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[80vh] bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono text-sm border border-[#333]">
        
        {/* Terminal Header */}
        <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-[#333] shrink-0">
            <div className="flex items-center gap-2 text-[#cccccc]">
                <TerminalIcon size={14} />
                <span className="font-bold">haoyu-portfolio — askme</span>
            </div>
            <button onClick={onClose} className="text-[#858585] hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>

        {/* Terminal Body */}
        <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto custom-scrollbar text-[#cccccc] space-y-4"
        >
            <div className="flex items-center gap-4 mb-6 opacity-50">
                <PixelMascot className="w-12 h-12 text-[#D94D22]" />
                <div>
                    <div className="text-lg font-bold text-[#D94D22]">Portfolio CLI</div>
                    <div className="text-xs">Version 2.4.0 (stable)</div>
                </div>
            </div>

            {messages.map((msg, idx) => (
                <div key={idx} className={`leading-relaxed ${msg.role === 'user' ? 'font-bold text-white mt-6' : ''}`}>
                    {msg.role === 'user' ? (
                        <span>{msg.content}</span>
                    ) : (
                        <div className={`
                            ${msg.role === 'system' ? 'text-yellow-500 whitespace-pre-wrap' : 'text-[#d4d4d4]'}
                        `}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown 
                                    components={{
                                        code: ({node, ...props}) => <span className="bg-[#333] text-[#D94D22] px-1 rounded" {...props} />
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : msg.content}
                            {msg.isStreaming && <span className="inline-block w-2 h-4 bg-[#D94D22] ml-1 animate-pulse align-middle"></span>}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#1e1e1e] border-t border-[#333] flex items-center gap-2 shrink-0">
            <span className="text-[#D94D22] font-bold">➜</span>
            <span className="text-[#00ADD8] font-bold">~</span>
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isBooting ? "Booting..." : "Type 'askme' to chat..."}
                disabled={isBooting || isLoading}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#555]"
                autoComplete="off"
                spellCheck="false"
            />
            {isLoading && <Loader2 size={16} className="animate-spin text-[#D94D22]" />}
        </div>
      </div>
    </div>
  );
};

export default ChatTerminal;