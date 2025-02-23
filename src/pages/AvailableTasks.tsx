
import { useState, useEffect } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { ContractService } from '@/lib/contractService';
import { useToast } from '@/hooks/use-toast';

const AvailableTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await ContractService.getAllTasks();
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                bounty={task.bounty}
                deadline={task.deadline}
                isCompleted={task.isCompleted}
                isCancelled={task.isCancelled}
                skills={task.skills}
                category={task.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTasks;
