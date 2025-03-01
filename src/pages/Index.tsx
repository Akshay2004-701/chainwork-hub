
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/9614a89b-11c9-46c0-a0bf-0416eeeecd16.png" 
              alt="ChainWork Logo" 
              className="w-48 h-48 mx-auto mb-2"
            />
            <p className="text-md text-emerald-600 dark:text-emerald-400 font-medium tracking-widest mb-2">
              TRUST MEETS TALENT
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The decentralized freelancing platform on Electroneum that connects talented freelancers with ambitious projects.
              Experience secure, transparent, and efficient collaboration powered by blockchain technology.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create-task">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                Post a Task
              </Button>
            </Link>
            <Link to="/available-tasks">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Tasks
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Smart contracts ensure secure and automatic payments upon task completion
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">Transparent</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All transactions and task histories are recorded on the blockchain
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">No Middleman</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Direct interaction between clients and freelancers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
