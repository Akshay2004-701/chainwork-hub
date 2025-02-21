
import { useState, useEffect } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { taskApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AvailableTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await taskApi.getAllTasks();
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
        <h1 className="text-3xl font-bold mb-6">Available Tasks</h1>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                description={task.description}
                bounty={BigInt(task.bounty)}
                deadline={Math.floor(new Date(task.deadline).getTime() / 1000)}
                isCompleted={task.isCompleted}
                isCancelled={task.isCancelled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTasks;
