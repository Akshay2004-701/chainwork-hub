
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Logo with Fade Effect */}
      <div className="absolute inset-0 w-full h-[60%] flex items-center justify-center z-0 pointer-events-none">
        <div className="w-full h-full flex justify-center items-center">
          <img 
            src="/cw-logo.png" 
            alt="ChainWork Background Logo" 
            className="w-auto h-full object-contain opacity-[0.03]"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/cw-logo.png" 
              alt="ChainWork Logo" 
              className="w-full max-w-[800px] mx-auto mb-6"
            />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              ChainWork
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The decentralized freelancing platform on Sonic Blaze that connects talented freelancers with ambitious projects.
              Experience secure, transparent, and efficient collaboration powered by blockchain technology.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create-task">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Post a Task
              </Button>
            </Link>
            <Link to="/available-tasks">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-2 border-teal-500 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Tasks
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Smart contracts ensure secure and automatic payments upon task completion
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Transparent</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All transactions and task histories are recorded on the Sonic Blaze blockchain
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">No Middleman</h3>
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
