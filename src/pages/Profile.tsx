import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractService } from "@/lib/contractService";
import { formatAmount } from "@/lib/contract";
import { TaskCard } from "@/components/TaskCard";

interface Task {
  id: number;
  taskProvider: string;
  title?: string;
  description: string;
  bounty: bigint;
  deadline: number;
  isCompleted: boolean;
  isCancelled: boolean;
  selectedFreelancers: string[];
}

const Profile = () => {
  const [address, setAddress] = useState<string>("");
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [completedSubmissions, setCompletedSubmissions] = useState<Task[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<bigint>(BigInt(0));
  const [tasksPosted, setTasksPosted] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          await loadTasks(accounts[0]);
        }
      }
    };

    loadProfile();
  }, []);

  const extractTitle = (description: string) => {
    const firstLineMatch = description.match(/^(.+?)(\n|$)/);
    if (firstLineMatch && firstLineMatch[1].length < 100) {
      return firstLineMatch[1];
    }
    return null;
  };

  const loadTasks = async (userAddress: string) => {
    try {
      const tasksData = await ContractService.getAllTasks();
      
      const formattedTasks = tasksData
        .map(task => {
          const description = task[2];
          const title = description.includes("Title:") 
            ? description.split("Title:")[1].split("\n")[0].trim()
            : extractTitle(description);
            
          return {
            id: Number(task[0]),
            taskProvider: task[1],
            title: title,
            description: description,
            bounty: task[3],
            isCompleted: task[4],
            isCancelled: task[5],
            selectedFreelancers: task[6],
            deadline: Number(task[7])
          };
        })
        .filter(task => task.id > 0);

      const posted = formattedTasks.filter(
        task => task.taskProvider.toLowerCase() === userAddress.toLowerCase()
      );
      setPostedTasks(posted);
      setTasksPosted(posted.length);

      const completed = formattedTasks.filter(
        task => task.selectedFreelancers.some(
          freelancer => freelancer.toLowerCase() === userAddress.toLowerCase()
        )
      );
      setCompletedSubmissions(completed);

      const earnings = completed.reduce(
        (acc, task) => acc + (task.bounty / BigInt(task.selectedFreelancers.length)),
        BigInt(0)
      );
      setTotalEarnings(earnings);

      const successRateCalc = posted.length > 0 
        ? (posted.filter(task => task.isCompleted).length / posted.length) * 100
        : 0;
      setSuccessRate(successRateCalc);

    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect your wallet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
                <p className="text-2xl font-bold">{formatAmount(totalEarnings)} ETN</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Tasks Posted</h3>
                <p className="text-2xl font-bold">{tasksPosted}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Success Rate</h3>
                <p className="text-2xl font-bold">{successRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posted" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posted">Posted Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed Work</TabsTrigger>
          </TabsList>

          <TabsContent value="posted" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  bounty={task.bounty}
                  deadline={task.deadline}
                  isCompleted={task.isCompleted}
                  isCancelled={task.isCancelled}
                />
              ))}
              {postedTasks.length === 0 && (
                <div className="col-span-3 text-center py-10 text-gray-500">
                  No tasks posted yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedSubmissions.map(task => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  bounty={task.bounty}
                  deadline={task.deadline}
                  isCompleted={task.isCompleted}
                  isCancelled={task.isCancelled}
                />
              ))}
              {completedSubmissions.length === 0 && (
                <div className="col-span-3 text-center py-10 text-gray-500">
                  No tasks completed yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
