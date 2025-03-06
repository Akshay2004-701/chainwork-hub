
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ContractService } from "@/lib/contractService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, DollarSign, AlertCircle, Send, CalendarIcon } from "lucide-react";
import { formatDate, formatAmount } from "@/lib/contract";

interface Task {
  id: number;
  taskProvider: string;
  title: string;
  description: string;
  bounty: bigint;
  deadline: number;
  isCompleted: boolean;
  isCancelled: boolean;
  selectedFreelancers: string[];
  submissions: {
    freelancer: string;
    submissionLink: string;
    isApproved: boolean;
  }[];
}

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [isProvider, setIsProvider] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDeadline, setNewDeadline] = useState<Date | undefined>(undefined);
  const [showExtendDeadline, setShowExtendDeadline] = useState(false);
  const { toast } = useToast();

  const loadTask = async () => {
    try {
      if (!id) return;
      
      const taskId = parseInt(id);
      const taskData = await ContractService.getTask(taskId);
      const submissionsData = await ContractService.getSubmissions(taskId);
      
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      const currentAccount = accounts[0];
      setUserAddress(currentAccount);
      setIsProvider(currentAccount.toLowerCase() === taskData[1].toLowerCase());

      // Update setTask call with the correct property names matching the interface
      setTask({
        id: Number(taskData[0]),
        taskProvider: taskData[1],
        title: taskData[2],
        description: taskData[3],
        bounty: taskData[4],
        isCompleted: taskData[5],
        isCancelled: taskData[6],
        selectedFreelancers: taskData[7],
        deadline: Number(taskData[8]),
        submissions: submissionsData
      });
    } catch (error: any) {
      toast({
        title: "Failed to load task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionLink || !id) {
      toast({
        title: "Missing submission link",
        description: "Please provide a submission link",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await ContractService.submitWork(parseInt(id), submissionLink);
      
      toast({
        title: "Work submitted successfully",
        description: "Your submission has been recorded",
      });
      
      setSubmissionLink("");
      loadTask();
    } catch (error: any) {
      toast({
        title: "Failed to submit work",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (freelancerAddress: string) => {
    if (!id) return;
    
    try {
      await ContractService.approveSubmission(parseInt(id), freelancerAddress);
      
      toast({
        title: "Submission approved",
        description: "The bounty has been transferred to the freelancer",
      });
      
      loadTask();
    } catch (error: any) {
      toast({
        title: "Failed to approve submission",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    
    try {
      await ContractService.cancelTask(parseInt(id));
      
      toast({
        title: "Task cancelled",
        description: "The task has been cancelled and the bounty refunded",
      });
      
      loadTask();
    } catch (error: any) {
      toast({
        title: "Failed to cancel task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExtendDeadline = async () => {
    if (!id || !newDeadline) return;
    
    try {
      const deadlineTimestamp = Math.floor(newDeadline.getTime() / 1000);
      await ContractService.extendDeadline(parseInt(id), deadlineTimestamp);
      
      toast({
        title: "Deadline extended",
        description: "The task deadline has been extended",
      });
      
      setShowExtendDeadline(false);
      setNewDeadline(undefined);
      loadTask();
    } catch (error: any) {
      toast({
        title: "Failed to extend deadline",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClaimRefund = async () => {
    if (!id) return;
    
    try {
      await ContractService.claimRefundAfterDeadline(parseInt(id));
      
      toast({
        title: "Refund claimed",
        description: "The bounty has been refunded to your wallet",
      });
      
      loadTask();
    } catch (error: any) {
      toast({
        title: "Failed to claim refund",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!task) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Loading task details...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = Date.now() > task.deadline * 1000;
  const hasSubmitted = task.submissions.some(
    s => s.freelancer.toLowerCase() === userAddress.toLowerCase()
  );

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{task.title || `Task #${task.id}`}</CardTitle>
              <CardDescription className="mt-2">{task.description}</CardDescription>
            </div>
            <Badge variant={task.isCompleted ? "default" : task.isCancelled ? "destructive" : "secondary"}>
              {task.isCompleted ? "Completed" : task.isCancelled ? "Cancelled" : isExpired ? "Expired" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {!task.isCompleted && !task.isCancelled && !isProvider && !hasSubmitted && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-lg">Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="submissionLink">Submission Link</Label>
                    <Input
                      id="submissionLink"
                      placeholder="Enter your submission link"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Work"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {task.submissions.length > 0 && (
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
                  {isProvider && !task.isCompleted && !task.isCancelled && (
                    <Button onClick={() => handleApprove(submission.freelancer)}>
                      Approve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isProvider && !task.isCompleted && !task.isCancelled && (
            <div className="space-y-4">
              {showExtendDeadline ? (
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">Extend Deadline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>New Deadline</Label>
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
                        Extend Deadline
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
                  </CardContent>
                </Card>
              ) : (
                <div className="flex gap-2">
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
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel Task
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {isProvider && isExpired && !task.isCompleted && !task.isCancelled && (
            <Button 
              variant="outline" 
              onClick={handleClaimRefund}
              className="w-full"
            >
              Claim Refund
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetails;
