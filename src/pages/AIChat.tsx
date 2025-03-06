
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Loader2, MessageSquare, FileText } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([]);
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

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">ChainWork AI Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="task-mode"
              checked={isTaskMode}
              onCheckedChange={setIsTaskMode}
            />
            <Label htmlFor="task-mode" className="cursor-pointer flex gap-2 items-center">
              {isTaskMode ? (
                <>
                  <FileText className="h-4 w-4" />
                  Task Mode
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
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

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
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
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <Markdown>{message.content}</Markdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isTaskMode && selectedTaskId 
              ? "Ask about the selected task..." 
              : "Type your message..."}
            className="min-h-[60px]"
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
            className="px-8"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
