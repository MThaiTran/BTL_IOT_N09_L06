import React from 'react';
import { USE_MOCK_DATA } from '../config';
import { Database } from 'lucide-react';

// Component to show indicator when using mock data
function MockDataIndicator() {
  if (!USE_MOCK_DATA) return null;

  return (
    // <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg z-50">
    //   <Database size={16} className="text-yellow-600 dark:text-yellow-400" />
    //   {/* <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
    //     Mock Data Mode
    //   </span> */}
    // </div>
    <div></div>
  );
}

export default MockDataIndicator;

