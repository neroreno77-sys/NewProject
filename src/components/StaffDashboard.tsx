import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { Report, Task } from '../types';
import { getReports, getTasks, saveTasks, saveReports, generateId, formatDate, getCurrentUser } from '../utils/storage';

const StaffDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const allTasks = getTasks();
    const allReports = getReports();
    
    // Filter tasks assigned to current user
    const myTasks = allTasks.filter(task => 
      task.assignedTo.includes(currentUser?.name || '')
    );
    
    setTasks(myTasks);
    setReports(allReports);
  };

  const handleStartTask = (task: Task) => {
    const allTasks = getTasks();
    const updatedTasks = allTasks.map(t =>
      t.id === task.id ? { ...t, status: 'in-progress' as const } : t
    );
    
    // Update report status
    const allReports = getReports();
    const updatedReports = allReports.map(report => {
      if (report.id === task.reportId) {
        return {
          ...report,
          status: 'in-progress' as const,
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Task Started',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: 'Staff started working on the task'
            }
          ]
        };
      }
      return report;
    });

    saveTasks(updatedTasks);
    saveReports(updatedReports);
    loadTasks();
  };

  const handleCompleteTask = (task: Task) => {
    const allTasks = getTasks();
    const updatedTasks = allTasks.map(t =>
      t.id === task.id 
        ? { 
            ...t, 
            status: 'completed' as const, 
            completedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString()
          } 
        : t
    );
    
    // Update report status
    const allReports = getReports();
    const updatedReports = allReports.map(report => {
      if (report.id === task.reportId) {
        return {
          ...report,
          status: 'completed' as const,
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Task Completed',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: 'Task completed and sent to Koordinator for review'
            }
          ]
        };
      }
      return report;
    });

    saveTasks(updatedTasks);
    saveReports(updatedReports);
    loadTasks();
  };

  const handleRevisionResponse = (task: Task) => {
    const allTasks = getTasks();
    const updatedTasks = allTasks.map(t =>
      t.id === task.id 
        ? { ...t, status: 'in-progress' as const, catatanRevisi: undefined } 
        : t
    );
    
    // Update report status
    const allReports = getReports();
    const updatedReports = allReports.map(report => {
      if (report.id === task.reportId) {
        return {
          ...report,
          status: 'in-progress' as const,
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Revision Addressed',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: 'Staff is addressing the revision comments'
            }
          ]
        };
      }
      return report;
    });

    saveTasks(updatedTasks);
    saveReports(updatedReports);
    loadTasks();
  };

  const getTaskReport = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;
    return reports.find(r => r.id === task.reportId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'revision': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Awaiting Review';
      case 'approved': return 'Approved';
      case 'revision': return 'Needs Revision';
      default: return status;
    }
  };

  const assignedTasks = tasks.filter(t => t.status === 'assigned');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => ['completed', 'approved'].includes(t.status));
  const revisionTasks = tasks.filter(t => t.status === 'revision');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Manage your assigned tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{assignedTasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Need Revision</p>
              <p className="text-2xl font-bold text-gray-900">{revisionTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Tasks - Priority Display */}
      {revisionTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Tasks Requiring Revision</h2>
          </div>
          <div className="space-y-4">
            {revisionTasks.map((task) => {
              const report = getTaskReport(task.id);
              if (!report) return null;

              return (
                <div key={task.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Report: {report.noSurat}</h3>
                      <p className="text-sm text-gray-600">{report.hal}</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Needs Revision
                    </span>
                  </div>
                  
                  {task.catatanRevisi && (
                    <div className="bg-red-50 p-3 rounded-lg mb-3">
                      <h4 className="text-sm font-medium text-red-900 mb-1">Revision Notes:</h4>
                      <p className="text-sm text-red-800">{task.catatanRevisi}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRevisionResponse(task)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Start Revision
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const report = getTaskReport(task.id);
            if (!report) return null;

            return (
              <div key={task.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">Report: {report.noSurat}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{report.hal}</p>
                    <p className="text-sm text-gray-500">
                      Assigned: {formatDate(new Date(task.assignedAt))}
                    </p>
                    {task.completedAt && (
                      <p className="text-sm text-gray-500">
                        Completed: {formatDate(new Date(task.completedAt))}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Assigned Tasks:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {task.todoList.map((todo, index) => (
                        <li key={index}>{todo}</li>
                      ))}
                    </ul>
                  </div>
                  {task.catatan && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{task.catatan}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowDetailModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                  
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send to Koordinator</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tasks assigned yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const report = getTaskReport(selectedTask.id);
              if (!report) return null;

              return (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                      <p className="text-gray-600">Report: {report.noSurat}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                      {getStatusText(selectedTask.status)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Report Details:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><strong>No. Surat:</strong> {report.noSurat}</div>
                          <div><strong>Tanggal Surat:</strong> {new Date(report.tanggalSurat).toLocaleDateString('id-ID')}</div>
                          <div className="col-span-2"><strong>Hal:</strong> {report.hal}</div>
                          <div><strong>Dari:</strong> {report.dari}</div>
                          <div><strong>No. Agenda:</strong> {report.noAgenda}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Assigned Tasks:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 bg-blue-50 p-4 rounded-lg">
                        {selectedTask.todoList.map((todo, index) => (
                          <li key={index}>{todo}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedTask.catatan && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes from Koordinator:</h4>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">{selectedTask.catatan}</p>
                      </div>
                    )}

                    {selectedTask.catatanRevisi && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Revision Notes:</h4>
                        <p className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">{selectedTask.catatanRevisi}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline:</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div><strong>Assigned:</strong> {formatDate(new Date(selectedTask.assignedAt))}</div>
                        {selectedTask.completedAt && (
                          <div><strong>Completed:</strong> {formatDate(new Date(selectedTask.completedAt))}</div>
                        )}
                        {selectedTask.submittedAt && (
                          <div><strong>Submitted:</strong> {formatDate(new Date(selectedTask.submittedAt))}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedTask(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;