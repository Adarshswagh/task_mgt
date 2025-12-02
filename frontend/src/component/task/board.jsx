import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';

function Board() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/board' ? 'Board' : location.pathname === '/list' ? 'List' : location.pathname === '/calendar' ? 'Calendar' : location.pathname === '/files' ? 'Files' : 'Board';

  const tasks = {
    recentlyAssigned: [
      { 
        id: 1, 
        title: 'Make a Graphic for website', 
        dueDate: 'This Month', 
        dueDateType: 'month',
        hasImage: true,
        comments: 3,
        avatar: 'P'
      },
      { 
        id: 2, 
        title: 'Make a Graphic for website', 
        dueDate: 'This Month', 
        dueDateType: 'month',
        hasImage: true,
        comments: 1,
        avatar: 'A'
      },
    ],
    dueToday: [
      { 
        id: 3, 
        title: 'Make a Graphic for website', 
        dueDate: '30 OCT', 
        dueDateType: 'date',
        hasImage: true,
        comments: 2,
        avatar: 'S'
      },
    ],
    inProgress: [],
    completed: [
      { 
        id: 4, 
        title: 'Make a Graphic for website', 
        dueDate: 'This Month', 
        dueDateType: 'month',
        hasImage: true,
        comments: 5,
        avatar: 'M',
        isCompleted: true
      },
      { 
        id: 5, 
        title: 'Make a Graphic for website', 
        dueDate: 'This Month', 
        dueDateType: 'month',
        hasImage: true,
        comments: 0,
        avatar: 'J',
        isCompleted: true
      },
    ],
  };

  const columns = [
    { id: 'recentlyAssigned', title: 'Recently Assigned', tasks: tasks.recentlyAssigned },
    { id: 'dueToday', title: 'Due Today', tasks: tasks.dueToday },
    { id: 'inProgress', title: 'In Progress', tasks: tasks.inProgress },
    { id: 'completed', title: 'Completed', tasks: tasks.completed },
  ];

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
        <div className="sticky top-0 z-50 bg-gray-100 pt-2 pb-4 mb-2 -mx-6 px-6">
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

        {/* Board Columns */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-[320px]"
            >
              {/* Status Box Container */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 pt-4 h-[calc(90vh-180px)] flex flex-col">
                {/* Column Header */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 text-center tracking-tight">{column.title}</h2>
                </div>

                {/* Scrollable Task Cards Container */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable area for cards - hidden scrollbar */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-hide">
                    <div className="space-y-3">
                      {/* Add Task Now Button - Only at top for In Progress if empty */}
                      {column.id === 'inProgress' && column.tasks.length === 0 && (
                        <button className="w-full py-5 text-sm text-gray-500 hover:text-gray-700 rounded-3xl border-2 border-dashed border-gray-300 transition-all flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-medium">Add Task Now</span>
                        </button>
                      )}

                      {column.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          {/* Image Placeholder */}
                          {task.hasImage && (
                            <div className="w-full h-36 bg-white relative overflow-hidden">
                              <div 
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: `repeating-linear-gradient(45deg, #e5e7eb 0px, #e5e7eb 10px, #f9fafb 10px, #f9fafb 20px)`,
                                }}
                              />
                            </div>
                          )}

                          {/* Task Content */}
                          <div className="p-3.5">
                            {/* Task Title */}
                            <h3 className="font-semibold text-gray-900 text-sm mb-2.5 leading-tight">{task.title}</h3>

                            {/* Due Date Badge */}
                            <div className="mb-3">
                              <span className="text-xs text-gray-500 mr-2">Due Date:</span>
                              <span
                                className={`px-2.5 py-1 text-xs font-medium rounded-full inline-block ${
                                  task.dueDateType === 'month'
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {task.dueDate}
                              </span>
                            </div>

                            {/* Completed Button for Completed Tasks */}
                            {task.isCompleted && (
                              <button className="w-full mb-3 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                                Completed
                              </button>
                            )}

                            {/* Footer with Comments and Avatar */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-xs text-gray-500 font-medium">{task.comments}</span>
                              </div>
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm ring-2 ring-white">
                                <span className="text-white text-xs font-semibold">{task.avatar}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Task Now Button - Appears after last card */}
                      {column.tasks.length > 0 && (
                        <button className="w-full py-5 text-sm text-gray-500 hover:text-gray-700 rounded-3xl border-2 border-dashed border-gray-300 transition-all flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-medium">Add Task Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Board;
