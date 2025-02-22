
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContract } from "@/lib/contract";
import { api, Task as ApiTask } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/contract";

const MyTasks = () => {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTasks = async () => {
    try {
      const currentAccount = await window.ethereum.request({
        method: 'eth_accounts'
      });

      const allTasks = await api.getAllTasks();
      const userTasks = allTasks.filter(
        task => task.providerId.toLowerCase() === currentAccount[0]?.toLowerCase()
      );

      setTasks(userTasks);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
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
      // First approve on blockchain
      const contract = await getContract();
      const tx = await contract.approveSubmission(taskId, [freelancerAddress]);
      await tx.wait();
      
      // Then update in backend
      const submissions = await api.getSubmissionsByTaskId(taskId);
      const submission = submissions.find(s => s.freelancer.toLowerCase() === freelancerAddress.toLowerCase());
      
      if (submission) {
        await api.approveSubmission(submission.subId);
      }
      
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
      // First cancel on blockchain
      const contract = await getContract();
      const tx = await contract.cancelTask(taskId);
      await tx.wait();
      
      // Then update in backend
      await api.cancelTask(taskId);
      
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading tasks...</div>
      </div>
    );
  }

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
  task: ApiTask; 
  onApprove: (taskId: number, freelancer: string) => Promise<void>;
  onCancel: (taskId: number) => Promise<void>;
}) => {
  const isExpired = new Date() > new Date(task.deadline);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Task #{task.id}</CardTitle>
            <CardDescription className="mt-2">
              <div className="line-clamp-2">{task.description}</div>
              {task.category && (
                <div className="mt-2">
                  <Badge variant="outline">{task.category}</Badge>
                </div>
              )}
              {task.skills.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {task.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}
            </CardDescription>
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
              <span>{task.bounty} SONIC</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{formatDate(new Date(task.deadline).getTime() / 1000)}</span>
            </div>
          </div>

          {!task.isCompleted && !task.isCancelled && (
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
