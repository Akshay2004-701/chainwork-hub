
import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { TaskCard } from '@/components/TaskCard';
import { getContract } from '@/lib/contract';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const contract = await getContract();
        const counter = await contract.getCounter();
        const taskPromises = [];

        for (let i = 1; i <= counter; i++) {
          taskPromises.push(contract.getTask(i));
        }

        const tasksData = await Promise.all(taskPromises);
        setTasks(tasksData);
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

    loadTasks();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              ChainWork
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Decentralized freelancing platform on Electroneum
            </p>
          </div>
          <WalletConnect />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Available Tasks</h2>
          <Link to="/create-task">
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-500">
              <Plus className="w-4 h-4 mr-2" />
              Post a Task
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
              <TaskCard
                key={index}
                id={Number(task[0])}
                description={task[2]}
                bounty={task[3]}
                deadline={Number(task[7])}
                isCompleted={task[4]}
                isCancelled={task[5]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
