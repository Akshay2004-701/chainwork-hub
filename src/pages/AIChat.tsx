import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Loader2, MessageSquare, FileText, ArrowRight, Trash2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractService } from '@/lib/contractService';
import { formatAmount } from '@/lib/contract';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  bounty: bigint;
  deadline: number;
}

const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

const API_KEY = import.meta.env.VITE_AI_API_KEY;

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages from localStorage if available
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isTaskMode) {
      loadTasks();
    }
  }, [isTaskMode]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const tasksData = await ContractService.getAllTasks();
      // Filter out completed or cancelled tasks
      const availableTasks = tasksData
        .filter(task => !task[5] && !task[6]) // not completed and not cancelled
        .map(task => ({
          id: Number(task[0]),
          title: task[2],
          description: task[3],
          bounty: task[4],
          deadline: Number(task[8])
        }));
      
      setTasks(availableTasks);
    } catch (error: any) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const createTaskPrompt = async (taskId: number, userQuery: string) => {
    try {
      const task = await ContractService.getTask(taskId);
      
      const taskTitle = task[2];
      const taskDescription = task[3];
      const taskBounty = formatAmount(task[4]);
      const taskDeadline = new Date(Number(task[8]) * 1000).toLocaleDateString();
      
      return `
You are assisting with a blockchain-based freelance task:

TASK DETAILS:
Title: ${taskTitle}
Description: ${taskDescription}
Bounty: ${taskBounty} ETN
Deadline: ${taskDeadline}

User's question about this task: ${userQuery}

Please provide a detailed, helpful response regarding this specific task. Consider technical requirements, implementation details, clarifications about the task description, or suggestions for completing the work effectively.
      `;
    } catch (error) {
      throw new Error('Failed to create task prompt');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let promptToSend = input;
    let taskInfo = '';
    
    // If in task mode, create a task-specific prompt
    if (isTaskMode && selectedTaskId) {
      const taskId = parseInt(selectedTaskId);
      try {
        promptToSend = await createTaskPrompt(taskId, input);
        const selectedTask = tasks.find(t => t.id === taskId);
        if (selectedTask) {
          taskInfo = ` (About task: ${selectedTask.title})`;
        }
      } catch (error: any) {
        toast({
          title: "Error creating task prompt",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage = { role: 'user' as const, content: input + taskInfo };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptToSend
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="h-screen flex flex-col bg-[#F6F6F7] dark:bg-gray-900 relative">
      <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#9b87f5]" />
          <h1 className="text-xl font-semibold text-[#403E43] dark:text-gray-200">ChainWork AI Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="task-mode"
              checked={isTaskMode}
              onCheckedChange={setIsTaskMode}
              className="data-[state=checked]:bg-[#9b87f5] dark:data-[state=unchecked]:bg-gray-600 dark:bg-gray-600"
            />
            <Label htmlFor="task-mode" className="cursor-pointer flex gap-2 items-center text-[#403E43] dark:text-gray-200">
              {isTaskMode ? (
                <>
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  Task Mode
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 text-[#9b87f5]" />
                  General Mode
                </>
              )}
            </Label>
          </div>
          
          {isTaskMode && (
            <div className="w-64">
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
                disabled={isLoadingTasks}
              >
                <SelectTrigger className="border-[#9b87f5]/30 focus:ring-[#9b87f5]/30 dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {tasks.length === 0 ? (
                    <SelectItem value="no-tasks" disabled>
                      No active tasks available
                    </SelectItem>
                  ) : (
                    tasks.map(task => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6 pb-[100px]" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-240px)] text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-[#9b87f5]/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[#9b87f5]" />
              </div>
              <p className="text-lg font-medium text-[#403E43] dark:text-gray-200">
                {isTaskMode 
                  ? "Select a task and ask questions specific to that task!" 
                  : "Hello! I'm your AI assistant. Ask me anything about tasks, freelancing, or blockchain technology!"}
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {message.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#9b87f5]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#9b87f5] flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div
                  className={`rounded-2xl p-4 max-w-[90%] ${
                    message.role === 'user'
                      ? 'bg-[#9b87f5] text-white'
                      : 'bg-[#F1F0FB] dark:bg-gray-800 text-[#403E43] dark:text-gray-200'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose dark:prose-invert prose-p:my-2 prose-headings:my-4 prose-pre:my-2 prose-ol:my-2 prose-ul:my-2 prose-li:my-0.5 max-w-none">
                      <Markdown
                        options={{
                          overrides: {
                            h1: {
                              props: {
                                className: 'text-2xl font-bold mt-6 mb-4',
                              },
                            },
                            h2: {
                              props: {
                                className: 'text-xl font-bold mt-5 mb-3',
                              },
                            },
                            h3: {
                              props: {
                                className: 'text-lg font-bold mt-4 mb-2',
                              },
                            },
                            p: {
                              props: {
                                className: 'my-3 leading-relaxed',
                              },
                            },
                            ul: {
                              props: {
                                className: 'my-3 pl-6 list-disc',
                              },
                            },
                            ol: {
                              props: {
                                className: 'my-3 pl-6 list-decimal',
                              },
                            },
                            li: {
                              props: {
                                className: 'my-1',
                              },
                            },
                            pre: {
                              props: {
                                className: 'bg-gray-800 text-gray-100 rounded-md p-3 my-3 overflow-x-auto dark:bg-gray-900',
                              },
                            },
                            code: {
                              props: {
                                className: 'bg-gray-200 dark:bg-gray-800 px-1 rounded',
                              },
                            },
                          },
                        }}
                      >
                        {message.content}
                      </Markdown>
                    </div>
                  ) : (
                    <p className="text-white">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#9b87f5]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-[#9b87f5]" />
                </div>
                <div className="rounded-2xl p-4 bg-[#F1F0FB] dark:bg-gray-800 text-[#403E43] dark:text-gray-200 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#9b87f5]" />
                  <span className="ml-2">Analyzing data, please wait...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white dark:bg-gray-900 dark:border-gray-800 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTaskMode && selectedTaskId 
                ? "Ask about the selected task..." 
                : "Ask, write or search for anything..."}
              className="min-h-[60px] pr-14 resize-none rounded-2xl border-[#9b87f5]/30 focus-visible:ring-[#9b87f5]/30 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || (isTaskMode && !selectedTaskId)} 
              className="absolute right-2 bottom-2 p-2 h-auto rounded-full bg-[#9b87f5] hover:bg-[#8b77e5]"
              size="icon"
            >
              {isLoading ? 
                <Loader2 className="w-5 h-5 animate-spin" /> : 
                <ArrowRight className="w-5 h-5" />
              }
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
