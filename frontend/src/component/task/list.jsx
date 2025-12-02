import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';

function List() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/board' ? 'Board' : location.pathname === '/list' ? 'List' : location.pathname === '/calendar' ? 'Calendar' : location.pathname === '/files' ? 'Files' : 'List';

  const tabs = [
    { id: 'List', path: '/list' },
    { id: 'Board', path: '/board' },
    { id: 'Calendar', path: '/calendar' },
    { id: 'Files', path: '/files' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* Top Navigation Bar with Tabs and Actions */}
        <div className="sticky top-0 z-50 bg-gray-100 pt-2 pb-4 mb-6 -mx-6 px-6">
          <div className="flex items-center justify-between">
            {/* Left Side - Tabs */}
            <div className="flex items-center gap-3 bg-white rounded-full p-1 px-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-[#88ACFF] border-2'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tab.id}
                </button>
              ))}
            </div>

            {/* Right Side - Project Name, Add Task, Filters */}
            <div className="flex items-center gap-3">
              {/* Zeko Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Zeko</span>
                </button>
              </div>

              {/* Add Task Button */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Task</span>
              </button>

              {/* Filters Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Filters</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">List View</h2>
          <p className="text-gray-600">List view content will be displayed here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default List;

