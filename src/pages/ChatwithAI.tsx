import React, { useState, useRef, useEffect } from 'react';
import { Send, Code, Lightbulb, Bug, Terminal, Loader2 } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  toolId: string;
};

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
};

function ChatwithAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('code');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tools: Tool[] = [
    {
      id: 'code',
      name: 'Code Generation',
      description: 'Generate code snippets and get implementation help',
      icon: <Code className="w-5 h-5" />,
      prompt: "You are an expert programmer. Generate code based on the following request. Format your response using markdown with proper code blocks and headings: "
    },
    {
      id: 'debug',
      name: 'Debug Assistant',
      description: 'Help identify and fix code issues',
      icon: <Bug className="w-5 h-5" />,
      prompt: "You are a debugging expert. Analyze the following code issue and provide a solution. Format your response using markdown with proper sections for Problem Analysis, Solution, and Code Examples: "
    },
    {
      id: 'brainstorm',
      name: 'Project Ideation',
      description: 'Brainstorm ideas and get recommendations',
      icon: <Lightbulb className="w-5 h-5" />,
      prompt: "You are a creative project consultant. Help brainstorm ideas for the following request. Format your response in a beautiful way using markdown with proper headings, bullet points, and sections: "
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateContent = async (prompt: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error in generateContent:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const selectedToolObj = tools.find(t => t.id === selectedTool);
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      toolId: selectedTool
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `${selectedToolObj?.prompt}${input}`;
      const text = await generateContent(prompt);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: 'ai',
        timestamp: new Date(),
        toolId: selectedTool
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        toolId: selectedTool
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages based on selected tool
  const filteredMessages = messages.filter(message => message.toolId === selectedTool);

  const formatMarkdown = (content: string) => {
    // Basic markdown formatting
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('* ')) {
          return <li key={i} className="ml-4 mb-2">{line.slice(2)}</li>;
        }
        if (line.startsWith('```')) {
          return null; // Handle code blocks separately
        }
        return <p key={i} className="mb-2">{line}</p>;
      })
      .filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="bg-dark-light border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center space-x-3">
          <h1 className="text-2xl font-bold dark:text-white text-black">FreelanceAI Assistant</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-light rounded-lg border border-primary/20">
              <div className="p-4 border-b border-primary/20">
                <h2 className="text-lg font-medium text-green-500">AI Tools</h2>
              </div>
              <div className="p-4 space-y-2">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      selectedTool === tool.id
                        ? 'dark:bg-black bg-white text-black border border-primary/30 dark:text-white'
                        : 'hover:bg-dark-light/50 border border-transparent text-black dark:text-white'
                    }`}
                  >
                    {tool.icon}
                    <div>
                      <p className="font-medium text-black dark:text-green-500">{tool.name}</p>
                      <p className="text-sm text-black dark:text-white">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-dark-light rounded-lg border border-primary/20 h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.sender === 'user'
                          ? 'bg-green-500 dark:text-white text-black'
                          : 'bg-dark-light border border-primary/20'
                      }`}
                    >
                      <div className="prose prose-invert max-w-none text-black dark:text-white">
                        {formatMarkdown(message.content)}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMessages.length === 0 && (
                  <div className="text-center text-black mt-8">
                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50 text-black" />
                    <p className="text-lg font-medium text-black">Start a conversation</p>
                    <p className="text-sm">
                      Select a tool and ask your question to get started
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg bg-dark border border-primary/20 p-2 dark:border-[1px] dark:border-white dark:text-white dark:bg-black text-black placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2  bg-green-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className='bg-green-500'>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatwithAI;