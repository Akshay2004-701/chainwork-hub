
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
            {tasks.map((task, index) => (
              <TaskCard
                key={index}
                id={Number(task[0])}
                title={task[2]} // title is now at index 2
                description={task[3]} // description is now at index 3
                bounty={task[4]} // bounty moves to index 4
                deadline={Number(task[8])} // deadline moves to index 8
                isCompleted={task[5]} // isCompleted moves to index 5
                isCancelled={task[6]} // isCancelled moves to index 6
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTasks;
