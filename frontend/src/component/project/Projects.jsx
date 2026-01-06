import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';
import { getProjects, createProject, deleteProject } from '../../services/api';

function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to /list if on base /projects path
  useEffect(() => {
    if (location.pathname === '/dashboard/projects') {
      navigate('/dashboard/projects/list', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  const activeTab = location.pathname.includes('/projects/list') ? 'List' : 
                    location.pathname.includes('/projects/board') ? 'Board' : 
                    location.pathname.includes('/projects/calendar') ? 'Calendar' : 
                    location.pathname.includes('/projects/files') ? 'Files' : 'List';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Projects Data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    client_email: '',
    link: '',
    client_password: '',
  });
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isFilterOpen]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      if (response.status === 'success') {
        setProjects(response.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'List', path: '/dashboard/projects/list' },
    { id: 'Board', path: '/dashboard/projects/board' },
    { id: 'Calendar', path: '/dashboard/projects/calendar' },
    { id: 'Files', path: '/dashboard/projects/files' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDocuments(files);
  };

  const removeDocument = (index) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await createProject(formData, selectedDocuments);
      if (response.status === 'success') {
        setIsAddModalOpen(false);
        setFormData({
          client_name: '',
          project_name: '',
          client_email: '',
          link: '',
          client_password: '',
        });
        setSelectedDocuments([]);
        fetchProjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await deleteProject(projectId);
      if (response.status === 'success') {
        fetchProjects();
        setSelectedProject(null);
      }
    } catch (err) {
      alert('Failed to delete project. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'zip':
        return '📦';
      case 'doc':
        return '📝';
      default:
        return '📎';
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-gray-50/50">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-gray-100 pt-2 pb-4 mb-2 -mx-6 px-6">
          <div className="flex items-center justify-between relative flex-wrap gap-3">
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

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Add Project Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Project</span>
              </button>

              {/* Filters Dropdown */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Filters</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Projects List Content */}
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Loading projects...</p>
              </div>
            ) : (
              <>
                {/* Projects Grid */}
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                      >
                        {/* Project Header */}
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{project.project_name}</h3>
                          <p className="text-sm text-gray-600 mb-2">Client: <span className="font-medium">{project.client_name}</span></p>
                          <p className="text-xs text-gray-500">{project.client_email}</p>
                        </div>

                        {/* Documents Count */}
                        {project.documents && project.documents.length > 0 && (
                          <div className="flex items-center gap-2 mb-4 pt-4 border-t border-gray-100">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">{project.documents.length} document(s)</span>
                          </div>
                        )}

                        {/* Created Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium mb-2">No projects found</p>
                    <p className="text-gray-400 text-sm mb-4">Get started by creating your first project.</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add Project
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Project Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
                <h3 className="text-lg font-bold text-gray-800">Add New Project</h3>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormData({
                      client_name: '',
                      project_name: '',
                      client_email: '',
                      link: '',
                      client_password: '',
                    });
                    setSelectedDocuments([]);
                    setError('');
                  }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium" 
                      placeholder="Enter client name" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="project_name"
                      value={formData.project_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium" 
                      placeholder="Enter project name" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Client Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="client_email"
                      value={formData.client_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium" 
                      placeholder="client@example.com" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Link
                    </label>
                    <input 
                      type="url" 
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium" 
                      placeholder="https://example.com" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Client Password <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      name="client_password"
                      value={formData.client_password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium" 
                      placeholder="Enter password (min 6 characters)" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Documents (PDF, Images, Videos, ZIP, etc.)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input 
                        type="file" 
                        multiple
                        onChange={handleDocumentChange}
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        id="documents-input"
                      />
                      <label 
                        htmlFor="documents-input"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Click to upload files</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, Images, Videos, ZIP, DOC, etc. (Max 50MB per file)</span>
                      </label>
                    </div>

                    {/* Selected Files List */}
                    {selectedDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg">{getFileIcon(file.type.split('/')[0])}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 sticky bottom-0">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setFormData({
                        client_name: '',
                        project_name: '',
                        client_email: '',
                        link: '',
                        client_password: '',
                      });
                      setSelectedDocuments([]);
                      setError('');
                    }} 
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-5 flex justify-between items-start bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedProject.project_name}</h3>
                  <p className="text-sm text-gray-600">Client: <span className="font-medium">{selectedProject.client_name}</span></p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-6 py-6 space-y-6">
                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Client Name</h4>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.client_name}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Client Email</h4>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.client_email}</p>
                  </div>
                  {selectedProject.link && (
                    <div className="col-span-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Link</h4>
                      <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all">
                        {selectedProject.link}
                      </a>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Created Date</h4>
                    <p className="text-sm font-medium text-gray-900">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Documents */}
                {selectedProject.documents && selectedProject.documents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Documents ({selectedProject.documents.length})</h4>
                    <div className="space-y-2">
                      {selectedProject.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                              {doc.file_size && (
                                <p className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</p>
                              )}
                            </div>
                          </div>
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                <button 
                  onClick={() => handleDelete(selectedProject.id)}
                  className="text-sm text-red-500 font-bold hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Delete Project
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedProject(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Projects;
