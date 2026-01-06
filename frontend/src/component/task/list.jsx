import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';

function List() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/board' ? 'Board' : location.pathname === '/list' ? 'List' : location.pathname === '/calendar' ? 'Calendar' : location.pathname === '/files' ? 'Files' : 'List';

  const [expandedSections, setExpandedSections] = useState({
    inProgress: true,
    underReview: false,
    dueToday: false,
    completed: true,
  });

  const [openDropdown, setOpenDropdown] = useState(null); // Format: 'priority-taskId' or 'status-taskId'
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        const ref = dropdownRefs.current[openDropdown];
        if (ref && !ref.contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  const tabs = [
    { id: 'List', path: '/list' },
    { id: 'Board', path: '/board' },
    { id: 'Calendar', path: '/calendar' },
    { id: 'Files', path: '/files' },
  ];

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Started':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Under Review':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Mock task data matching the screenshot - converted to state
  const [taskSections, setTaskSections] = useState({
    inProgress: [
      {
        id: 1,
        title: 'Make a Graphic for website',
        dueDate: '27 Nov 2025',
        assignTo: { name: 'Atharv', avatar: 'A', color: 'bg-purple-500' },
        priority: 'High',
        status: 'Started',
        comments: 2,
        subtasks: 10,
        hasImage: true,
        isCompleted: false,
      },
      {
        id: 2,
        title: 'Update website content',
        dueDate: '27 Nov 2025',
        assignTo: { name: 'Kraftelite', avatar: 'K', color: 'bg-blue-500', isLogo: true },
        priority: 'Low',
        status: 'Under Review',
        comments: 1,
        subtasks: 2,
        hasImage: true,
        isCompleted: false,
      },
    ],
    underReview: [],
    dueToday: [],
    completed: [
      {
        id: 3,
        title: 'Make a Graphic for website',
        dueDate: '27 Nov 2025',
        assignTo: { name: 'Atharv', avatar: 'A', color: 'bg-purple-500' },
        priority: 'High',
        status: 'Completed',
        comments: 2,
        subtasks: 10,
        hasImage: true,
        isCompleted: true,
      },
      {
        id: 4,
        title: 'Update website content',
        dueDate: '27 Nov 2025',
        assignTo: { name: 'Kraftelite', avatar: 'K', color: 'bg-blue-500', isLogo: true },
        priority: 'Low',
        status: 'Completed',
        comments: 1,
        subtasks: 2,
        hasImage: true,
        isCompleted: true,
      },
    ],
  });

  // Priority and Status options
  const priorityOptions = ['High', 'Medium', 'Low'];
  const statusOptions = ['Started', 'Under Review', 'Completed', 'Pending'];

  // Update task priority
  const updateTaskPriority = (sectionKey, taskId, newPriority) => {
    setTaskSections((prev) => {
      const updated = { ...prev };
      const section = [...updated[sectionKey]];
      const taskIndex = section.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        section[taskIndex] = { ...section[taskIndex], priority: newPriority };
        updated[sectionKey] = section;
      }
      return updated;
    });
    setOpenDropdown(null);
  };

  // Update task status
  const updateTaskStatus = (sectionKey, taskId, newStatus) => {
    setTaskSections((prev) => {
      const updated = { ...prev };
      const section = [...updated[sectionKey]];
      const taskIndex = section.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        section[taskIndex] = { ...section[taskIndex], status: newStatus };
        updated[sectionKey] = section;
      }
      return updated;
    });
    setOpenDropdown(null);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sectionConfig = [
    { key: 'inProgress', title: 'In Progress', tasks: taskSections.inProgress },
    { key: 'underReview', title: 'Under Review', tasks: taskSections.underReview },
    { key: 'dueToday', title: 'Due Today', tasks: taskSections.dueToday },
    { key: 'completed', title: 'Completed', tasks: taskSections.completed },
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
            <div className="col-span-4">To Do Title</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2">Assign to</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Task Sections */}
          <div className="divide-y divide-gray-200">
            {sectionConfig.map((section) => (
              <div key={section.key} className="bg-white">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{section.title}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSections[section.key] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Task Rows */}
                {expandedSections[section.key] && (
                  <div className="divide-y divide-gray-100">
                    {section.tasks.length > 0 ? (
                      section.tasks.map((task) => (
                        <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                          {/* To Do Title Column */}
                          <div className="col-span-4 flex items-center gap-3">
                            {/* Checkbox */}
                            <button className="flex-shrink-0">
                              {task.isCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"></div>
                              )}
                            </button>
                            
                            {/* Task Title and Metadata */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 truncate">{task.title}</span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-xs text-gray-500 font-medium">{task.comments}</span>
                                  <span className="text-xs text-gray-500 font-medium">{task.subtasks}</span>
                                  {task.hasImage && (
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Due Date Column */}
                          <div className="col-span-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">{task.dueDate}</span>
                          </div>

                          {/* Assign to Column */}
                          <div className="col-span-2 flex items-center gap-2">
                            {task.assignTo.isLogo ? (
                              <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                {/* Geometric pattern - two overlapping squares */}
                                <div className="absolute inset-0">
                                  <div className="absolute top-0 left-0 w-3 h-3 border-2 border-white/80"></div>
                                  <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white/80"></div>
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/60 rotate-45"></div>
                                </div>
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full ${task.assignTo.color} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white text-xs font-semibold">{task.assignTo.avatar}</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-700 truncate">{task.assignTo.name}</span>
                          </div>

                          {/* Priority Column */}
                          <div className="col-span-2">
                            <div 
                              className="relative inline-block" 
                              ref={(el) => {
                                dropdownRefs.current[`priority-${task.id}`] = el;
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(openDropdown === `priority-${task.id}` ? null : `priority-${task.id}`);
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)} flex items-center gap-1 hover:opacity-80 transition-opacity`}
                              >
                                {task.priority}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {/* Priority Dropdown */}
                              {openDropdown === `priority-${task.id}` && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px] overflow-hidden">
                                  {priorityOptions.map((option) => (
                                    <button
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateTaskPriority(section.key, task.id, option);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:opacity-80 transition-opacity ${
                                        task.priority === option ? 'bg-gray-50' : ''
                                      }`}
                                    >
                                      <span className={`inline-block px-2 py-0.5 rounded-full border ${getPriorityColor(option)}`}>
                                        {option}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Column */}
                          <div className="col-span-2">
                            <div 
                              className="relative inline-block"
                              ref={(el) => {
                                dropdownRefs.current[`status-${task.id}`] = el;
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(openDropdown === `status-${task.id}` ? null : `status-${task.id}`);
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)} flex items-center gap-1 hover:opacity-80 transition-opacity`}
                              >
                                {task.status}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {/* Status Dropdown */}
                              {openDropdown === `status-${task.id}` && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden">
                                  {statusOptions.map((option) => (
                                    <button
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateTaskStatus(section.key, task.id, option);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:opacity-80 transition-opacity ${
                                        task.status === option ? 'bg-gray-50' : ''
                                      }`}
                                    >
                                      <span className={`inline-block px-2 py-0.5 rounded-full border ${getStatusColor(option)}`}>
                                        {option}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500 text-sm">
                        No tasks in this section
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default List;

