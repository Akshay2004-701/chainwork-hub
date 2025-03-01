import { Button } from '@/components/ui/button';
import { Calendar, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-end gap-2">
          <Link to="/available-tasks">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
              Find Tasks
            </Button>
          </Link>
          <Link to="/create-task">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
              Post a Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-10 pb-20 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12">
          <div className="flex items-center mb-8">
            <img 
              src="/lovable-uploads/6af6c2f6-4279-4b87-9bec-02c23fb37c1d.png" 
              alt="ChainWork Logo" 
              className="w-16 h-16 mr-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ChainWork</h1>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Think, plan, and track
            <span className="block text-gray-500 dark:text-gray-400">all in one place</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The decentralized freelancing platform on Electroneum that connects talented freelancers 
            with ambitious projects. Experience secure, transparent, and efficient collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/create-task">
              <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white">
                Get free demo
              </Button>
            </Link>
            <Link to="/available-tasks">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Tasks
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
          <div className="absolute -left-6 top-0 w-56 h-60 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg shadow-lg transform -rotate-6">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Take notes on key task details, deadlines, and collaborate with your team with ease.
            </p>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center shadow-md">
              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="absolute right-4 top-12 w-64 h-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminders</span>
            </div>
            <div className="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Submit a Meeting</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">2pm</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  1 hour left
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="absolute left-12 bottom-0 w-64 h-48 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Today's tasks</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">New tasks for completion</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-xs">4</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">Design UI/UX</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-xs">6</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute right-0 bottom-12 w-48 h-32 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">100+ integrations</p>
            <div className="flex gap-2 mt-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                <span className="text-red-500 dark:text-red-300 text-xs font-bold">G</span>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <span className="text-blue-500 dark:text-blue-300 text-xs font-bold">M</span>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                <span className="text-green-500 dark:text-green-300 text-xs font-bold">E</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Blockchain-powered freelancing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Smart contracts ensure secure and automatic payments upon task completion
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Transparent</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All transactions and task histories are recorded on the blockchain
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No Middleman</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Direct interaction between clients and freelancers with no intermediary fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
