
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContractService } from "@/lib/contractService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, DollarSign, AlertCircle, CalendarIcon } from "lucide-react";
import { formatDate, formatAmount } from "@/lib/contract";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Task {
  id: number;
  taskProvider: string;
  title: string;
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
      const contract = await ContractService.getAllTasks();
      const submissionPromises = [];

      for (let i = 0; i < contract.length; i++) {
        const taskId = Number(contract[i][0]);
        submissionPromises.push(ContractService.getSubmissions(taskId));
      }

      const submissionsData = await Promise.all(submissionPromises);

      const currentAccount = await window.ethereum.request({
        method: 'eth_accounts'
      });

      const formattedTasks = contract
        .map((task, index) => ({
          id: Number(task[0]),
          taskProvider: task[1],
          title: task[2],
          description: task[3],
          bounty: task[4],
          isCompleted: task[5],
          isCancelled: task[6],
          selectedFreelancers: task[7],
          deadline: Number(task[8]),
          submissions: submissionsData[index]
        }))
        .filter(task => 
          task.id > 0 && 
          currentAccount[0].toLowerCase() === task.taskProvider.toLowerCase()
        );

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

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 h-48" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="active" className="space-y-6">
              {tasks
                .filter(task => !task.isCompleted && !task.isCancelled)
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onRefresh={loadTasks}
                  />
                ))}
              {tasks.filter(task => !task.isCompleted && !task.isCancelled).length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No active tasks found
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {tasks
                .filter(task => task.isCompleted)
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onRefresh={loadTasks}
                  />
                ))}
              {tasks.filter(task => task.isCompleted).length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No completed tasks found
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-6">
              {tasks
                .filter(task => task.isCancelled)
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onRefresh={loadTasks}
                  />
                ))}
              {tasks.filter(task => task.isCancelled).length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No cancelled tasks found
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onRefresh 
}: { 
  task: Task; 
  onRefresh: () => Promise<void>;
}) => {
  const { toast } = useToast();
  const [newDeadline, setNewDeadline] = useState<Date | undefined>(undefined);
  const [showExtendDeadline, setShowExtendDeadline] = useState(false);
  
  const isExpired = Date.now() > task.deadline * 1000;
  
  const handleApproveSubmission = async (taskId: number, freelancerAddress: string) => {
    try {
      await ContractService.approveSubmission(taskId, freelancerAddress);
      
      toast({
        title: "Submission approved",
        description: "The bounty has been transferred to the freelancer",
      });
      
      onRefresh();
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
      await ContractService.cancelTask(taskId);
      
      toast({
        title: "Task cancelled",
        description: "The task has been cancelled and the bounty refunded",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Failed to cancel task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExtendDeadline = async () => {
    if (!newDeadline) return;
    
    try {
      const deadlineTimestamp = Math.floor(newDeadline.getTime() / 1000);
      await ContractService.extendDeadline(task.id, deadlineTimestamp);
      
      toast({
        title: "Deadline extended",
        description: "The task deadline has been extended",
      });
      
      setShowExtendDeadline(false);
      setNewDeadline(undefined);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Failed to extend deadline",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClaimRefund = async () => {
    try {
      await ContractService.claimRefundAfterDeadline(task.id);
      
      toast({
        title: "Refund claimed",
        description: "The bounty has been refunded to your wallet",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Failed to claim refund",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{task.title || `Task #${task.id}`}</CardTitle>
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
                    <Button onClick={() => handleApproveSubmission(task.id, submission.freelancer)}>
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {!task.isCompleted && !task.isCancelled && (
          <>
            {showExtendDeadline ? (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDeadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDeadline ? format(newDeadline, "PPP") : "Select new deadline"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newDeadline}
                        onSelect={setNewDeadline}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleExtendDeadline} 
                    disabled={!newDeadline}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowExtendDeadline(false);
                      setNewDeadline(undefined);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setShowExtendDeadline(true)}
                  className="flex-1"
                >
                  Extend Deadline
                </Button>
                
                {task.submissions.length === 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleCancelTask(task.id)}
                    className="flex-1"
                  >
                    Cancel Task
                  </Button>
                )}
              </div>
            )}
            
            {isExpired && (
              <Button 
                variant="outline" 
                onClick={handleClaimRefund}
                className="w-full"
              >
                Claim Refund
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default MyTasks;
