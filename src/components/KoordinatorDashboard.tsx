import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, MessageSquare, Send } from 'lucide-react';
import { Report, Task, User } from '../types';
import { getReports, getTasks, saveTasks, saveReports, generateId, formatDate, getCurrentUser, STAFF_LIST, TODO_LIST_ITEMS } from '../utils/storage';

const KoordinatorDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [catatan, setCatatan] = useState('');
  const [catatanRevisi, setCatatanRevisi] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allReports = getReports();
    const allTasks = getTasks();
    
    // Filter reports forwarded to this koordinator
    const koordinatorReports = allReports.filter(report => 
      report.forwardedTo.includes(currentUser?.name || '')
    );
    
    // Filter tasks assigned by this koordinator
    const koordinatorTasks = allTasks.filter(task => 
      task.assignedBy === currentUser?.id
    );
    
    setReports(koordinatorReports);
    setTasks(koordinatorTasks);
  };

  const handleAssignTask = () => {
    if (!selectedReport || selectedStaff.length === 0 || selectedTodos.length === 0) return;

    const newTask: Task = {
      id: generateId(),
      reportId: selectedReport.id,
      assignedTo: selectedStaff,
      assignedBy: currentUser?.id || '',
      todoList: selectedTodos,
      catatan,
      status: 'assigned',
      assignedAt: new Date().toISOString()
    };

    // Update report status
    const allReports = getReports();
    const updatedReports = allReports.map(report => {
      if (report.id === selectedReport.id) {
        return {
          ...report,
          status: 'assigned' as const,
          currentAssignee: selectedStaff.join(', '),
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Task Assigned',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: `Assigned to: ${selectedStaff.join(', ')}`
            }
          ]
        };
      }
      return report;
    });

    // Save task and update report
    const allTasks = getTasks();
    const updatedTasks = [...allTasks, newTask];
    saveTasks(updatedTasks);
    saveReports(updatedReports);
    
    // Reset form and reload data
    setSelectedReport(null);
    setShowAssignModal(false);
    setSelectedStaff([]);
    setSelectedTodos([]);
    setCatatan('');
    loadData();
  };

  const handleApprove = (task: Task) => {
    const allTasks = getTasks();
    const allReports = getReports();
    
    // Update task status
    const updatedTasks = allTasks.map(t => 
      t.id === task.id ? { ...t, status: 'approved' as const } : t
    );
    
    // Update report status
    const updatedReports = allReports.map(report => {
      if (report.id === task.reportId) {
        return {
          ...report,
          status: 'completed' as const,
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Task Approved',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: 'Task completed and approved'
            }
          ]
        };
      }
      return report;
    });

    saveTasks(updatedTasks);
    saveReports(updatedReports);
    loadData();
  };

  const handleRevision = () => {
    if (!selectedTask || !catatanRevisi.trim()) return;

    const allTasks = getTasks();
    const allReports = getReports();
    
    // Update task with revision notes
    const updatedTasks = allTasks.map(t => 
      t.id === selectedTask.id 
        ? { ...t, status: 'revision' as const, catatanRevisi } 
        : t
    );
    
    // Update report status
    const updatedReports = allReports.map(report => {
      if (report.id === selectedTask.reportId) {
        return {
          ...report,
          status: 'revision' as const,
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Task Needs Revision',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: `Revision requested: ${catatanRevisi}`
            }
          ]
        };
      }
      return report;
    });

    saveTasks(updatedTasks);
    saveReports(updatedReports);
    
    setShowRevisionModal(false);
    setSelectedTask(null);
    setCatatanRevisi('');
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forwarded': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'revision': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'forwarded': return 'Forwarded';
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'approved': return 'Approved';
      case 'revision': return 'Needs Revision';
      default: return status;
    }
  };

  const pendingReports = reports.filter(r => r.status === 'forwarded');
  const assignedTasks = tasks.filter(t => ['assigned', 'in-progress'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Koordinator Dashboard</h1>
          <p className="text-gray-600">Assign tasks and review completed work</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">{pendingReports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{assignedTasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Surat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.noSurat}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{report.hal}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.dari}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.tanggalSurat).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Assign Task</span>
                    </button>
                  </td>
                </tr>
              ))}
              {pendingReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending reports</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Tasks for Review */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tasks Awaiting Review</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {completedTasks.map((task) => {
              const report = reports.find(r => r.id === task.reportId);
              if (!report) return null;
              
              return (
                <div key={task.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Report: {report.noSurat}</h3>
                      <p className="text-gray-600">{report.hal}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Assigned to: {task.assignedTo.join(', ')}
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      Ready for Review
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Assigned Tasks:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {task.todoList.map((todo, index) => (
                          <li key={index}>{todo}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{task.catatan}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(task)}
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowRevisionModal(true);
                      }}
                      className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Revise</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Task - Report: {selectedReport.noSurat}
            </h3>
            
            <div className="space-y-6">
              {/* Staff Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Staff:</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {STAFF_LIST.map(staff => (
                    <label key={staff} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStaff.includes(staff)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStaff(prev => [...prev, staff]);
                          } else {
                            setSelectedStaff(prev => prev.filter(s => s !== staff));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">{staff}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* To-Do List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">To-Do List:</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {TODO_LIST_ITEMS.map(todo => (
                    <label key={todo} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTodos.includes(todo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTodos(prev => [...prev, todo]);
                          } else {
                            setSelectedTodos(prev => prev.filter(t => t !== todo));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">{todo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan:</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter additional notes or instructions..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAssignTask}
                disabled={selectedStaff.length === 0 || selectedTodos.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Assign Task
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedReport(null);
                  setSelectedStaff([]);
                  setSelectedTodos([]);
                  setCatatan('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Revision</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Revisi:</label>
                <textarea
                  value={catatanRevisi}
                  onChange={(e) => setCatatanRevisi(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter revision notes..."
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleRevision}
                disabled={!catatanRevisi.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Revision
              </button>
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setSelectedTask(null);
                  setCatatanRevisi('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KoordinatorDashboard;