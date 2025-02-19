
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getContract } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ethers } from "ethers";

const CreateTask = () => {
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !bounty || !date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = await getContract();
      const deadline = Math.floor(date.getTime() / 1000);
      const bountyInWei = ethers.parseEther(bounty);
      
      const tx = await contract.createTask(description, deadline, {
        value: bountyInWei,
      });
      
      await tx.wait();
      
      toast({
        title: "Task created successfully",
        description: "Your task has been posted to the blockchain",
      });
      
      navigate("/my-tasks");
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Task</CardTitle>
          <CardDescription>
            Create a new task and set a bounty for freelancers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your task requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bounty">Bounty (ETN)</Label>
              <Input
                id="bounty"
                type="number"
                step="0.01"
                placeholder="Enter bounty amount"
                value={bounty}
                onChange={(e) => setBounty(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTask;
