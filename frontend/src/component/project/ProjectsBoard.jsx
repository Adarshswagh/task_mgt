import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';

function ProjectsBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.includes('/projects/list') ? 'List' : 
                    location.pathname.includes('/projects/board') ? 'Board' : 
                    location.pathname.includes('/projects/calendar') ? 'Calendar' : 
                    location.pathname.includes('/projects/files') ? 'Files' : 'Board';

  const tabs = [
    { id: 'List', path: '/dashboard/projects/list' },
    { id: 'Board', path: '/dashboard/projects/board' },
    { id: 'Calendar', path: '/dashboard/projects/calendar' },
    { id: 'Files', path: '/dashboard/projects/files' },
  ];

  const columns = [
    { id: 'planning', title: 'Planning', projects: [] },
    { id: 'inProgress', title: 'In Progress', projects: [
      { id: 1, name: 'Website Redesign', type: 'Web Development', progress: 65 },
      { id: 3, name: 'Q1 Marketing Campaign', type: 'Marketing', progress: 40 },
    ]},
    { id: 'review', title: 'Review', projects: [] },
    { id: 'completed', title: 'Completed', projects: [
      { id: 4, name: 'Brand Identity Design', type: 'Design', progress: 100 },
    ]},
  ];

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <div className="sticky top-0 z-50 bg-gray-100 pt-2 pb-4 mb-2 -mx-6 px-6">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Project</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-[320px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 pt-4 h-[calc(90vh-180px)] flex flex-col">
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 text-center tracking-tight">{column.title}</h2>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-hide">
                    <div className="space-y-3">
                      {column.projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4">
                          <h3 className="font-semibold text-gray-900 text-sm mb-2">{project.name}</h3>
                          <div className="mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{project.type}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500">{project.progress}%</span>
                        </div>
                      ))}
                      {column.projects.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">No projects</div>
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

export default ProjectsBoard;

