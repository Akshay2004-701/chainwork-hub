
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContract } from "@/lib/contract";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, AlertCircle } from "lucide-react";
import { formatDate, formatAmount } from "@/lib/contract";

interface Task {
  id: number;
  description: string;
  bounty: bigint;
  deadline: number;
  isCompleted: boolean;
  isCancelled: boolean;
  submissions: {
    freelancer: string;
    submissionLink: string;
    isApproved: boolean;
  }[];
}

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTasks = async () => {
    try {
      const contract = await getContract();
      const counter = await contract.getCounter();
      const taskPromises = [];
      const submissionPromises = [];

      for (let i = 1; i <= counter; i++) {
        taskPromises.push(contract.getTask(i));
        submissionPromises.push(contract.getSubmissions(i));
      }

      const tasksData = await Promise.all(taskPromises);
      const submissionsData = await Promise.all(submissionPromises);

      const currentAccount = await window.ethereum.request({
        method: 'eth_accounts'
      });

      const formattedTasks = tasksData
        .map((task, index) => ({
          id: Number(task[0]),
          description: task[2],
          bounty: task[3],
          deadline: Number(task[7]),
          isCompleted: task[4],
          isCancelled: task[5],
          submissions: submissionsData[index]
        }))
        .filter(task => task.id > 0 && currentAccount[0].toLowerCase() === task.provider?.toLowerCase());

      setTasks(formattedTasks);
    } catch (error: any) {
      toast({
        title: "Failed to load tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleApproveSubmission = async (taskId: number, freelancerAddress: string) => {
    try {
      const contract = await getContract();
      const tx = await contract.approveSubmission(taskId, [freelancerAddress]);
      await tx.wait();
      
      toast({
        title: "Submission approved",
        description: "The bounty has been transferred to the freelancer",
      });
      
      loadTasks();
    } catch (error: any) {
      toast({
        title: "Failed to approve submission",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelTask = async (taskId: number) => {
    try {
      const contract = await getContract();
      const tx = await contract.cancelTask(taskId);
      await tx.wait();
      
      toast({
        title: "Task cancelled",
        description: "The task has been cancelled and the bounty refunded",
      });
      
      loadTasks();
    } catch (error: any) {
      toast({
        title: "Failed to cancel task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="space-y-6">
          {tasks
            .filter(task => !task.isCompleted && !task.isCancelled)
            .map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                onApprove={handleApproveSubmission}
                onCancel={handleCancelTask}
              />
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {tasks
            .filter(task => task.isCompleted)
            .map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                onApprove={handleApproveSubmission}
                onCancel={handleCancelTask}
              />
            ))}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-6">
          {tasks
            .filter(task => task.isCancelled)
            .map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                onApprove={handleApproveSubmission}
                onCancel={handleCancelTask}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onApprove, 
  onCancel 
}: { 
  task: Task; 
  onApprove: (taskId: number, freelancer: string) => Promise<void>;
  onCancel: (taskId: number) => Promise<void>;
}) => {
  const isExpired = Date.now() > task.deadline * 1000;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Task #{task.id}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">{task.description}</CardDescription>
          </div>
          <Badge variant={task.isCompleted ? "default" : task.isCancelled ? "destructive" : "secondary"}>
            {task.isCompleted ? "Completed" : task.isCancelled ? "Cancelled" : isExpired ? "Expired" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>{formatAmount(task.bounty)} ETN</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{formatDate(task.deadline)}</span>
            </div>
          </div>

          {task.submissions.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium">Submissions ({task.submissions.length})</h4>
              {task.submissions.map((submission, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{submission.freelancer.slice(0, 6)}...{submission.freelancer.slice(-4)}</p>
                    <a href={submission.submissionLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      View Submission
                    </a>
                  </div>
                  {!task.isCompleted && !task.isCancelled && (
                    <Button onClick={() => onApprove(task.id, submission.freelancer)}>
                      Approve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>No submissions yet</span>
            </div>
          )}

          {!task.isCompleted && !task.isCancelled && task.submissions.length === 0 && (
            <Button 
              variant="destructive" 
              onClick={() => onCancel(task.id)}
              className="w-full"
            >
              Cancel Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyTasks;
