import React, { useState, useEffect } from 'react';
import { Plus, Send, FileText, Upload, Calendar, Users } from 'lucide-react';
import { Report, User } from '../types';
import { getReports, saveReports, generateId, formatDate, getCurrentUser, getUsers, KOORDINATOR_LIST } from '../utils/storage';

const TUDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedKoordinators, setSelectedKoordinators] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    noSurat: '',
    hal: '',
    dari: '',
    tanggalSurat: '',
    tanggalAgenda: '',
    noAgenda: '',
    kelompokAsalSurat: '',
    agendaSestama: '',
    sifat: [] as string[],
    derajat: [] as string[]
  });

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const allReports = getReports();
    const userReports = allReports.filter(report => 
      report.createdBy === currentUser?.id || report.status === 'draft'
    );
    setReports(userReports);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReport: Report = {
      id: generateId(),
      ...formData,
      files: [],
      status: 'draft',
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      forwardedTo: [],
      timeline: [{
        id: generateId(),
        action: 'Report Created',
        user: currentUser?.name || '',
        timestamp: new Date().toISOString(),
        details: `Report ${formData.noSurat} created`
      }]
    };

    const allReports = getReports();
    const updatedReports = [...allReports, newReport];
    saveReports(updatedReports);
    loadReports();
    
    setFormData({
      noSurat: '',
      hal: '',
      dari: '',
      tanggalSurat: '',
      tanggalAgenda: '',
      noAgenda: '',
      kelompokAsalSurat: '',
      agendaSestama: '',
      sifat: [],
      derajat: []
    });
    setShowCreateForm(false);
  };

  const handleForward = () => {
    if (!selectedReport || selectedKoordinators.length === 0) return;

    const allReports = getReports();
    const updatedReports = allReports.map(report => {
      if (report.id === selectedReport.id) {
        return {
          ...report,
          status: 'forwarded' as const,
          forwardedTo: selectedKoordinators,
          timeline: [
            ...report.timeline,
            {
              id: generateId(),
              action: 'Forwarded to Koordinator',
              user: currentUser?.name || '',
              timestamp: new Date().toISOString(),
              details: `Forwarded to: ${selectedKoordinators.join(', ')}`
            }
          ]
        };
      }
      return report;
    });

    saveReports(updatedReports);
    loadReports();
    setShowForwardModal(false);
    setSelectedReport(null);
    setSelectedKoordinators([]);
  };

  const handleSifatChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sifat: prev.sifat.includes(value)
        ? prev.sifat.filter(s => s !== value)
        : [...prev.sifat, value]
    }));
  };

  const handleDerajatChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      derajat: prev.derajat.includes(value)
        ? prev.derajat.filter(d => d !== value)
        : [...prev.derajat, value]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'forwarded': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'revision': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'forwarded': return 'Forwarded';
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'revision': return 'Needs Revision';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TU Dashboard</h1>
          <p className="text-gray-600">Create and manage reports</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Report</span>
        </button>
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Lembar Disposisi</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sifat and Derajat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sifat</label>
                <div className="space-y-2">
                  {['Biasa', 'Penting', 'Rahasia'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sifat.includes(option)}
                        onChange={() => handleSifatChange(option)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Derajat</label>
                <div className="space-y-2">
                  {['Biasa', 'Segera', 'Kilat'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.derajat.includes(option)}
                        onChange={() => handleDerajatChange(option)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Agenda</label>
                <input
                  type="text"
                  value={formData.noAgenda}
                  onChange={(e) => setFormData({ ...formData, noAgenda: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tgl. Agenda</label>
                <input
                  type="date"
                  value={formData.tanggalAgenda}
                  onChange={(e) => setFormData({ ...formData, tanggalAgenda: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok Asal Surat</label>
                <input
                  type="text"
                  value={formData.kelompokAsalSurat}
                  onChange={(e) => setFormData({ ...formData, kelompokAsalSurat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agenda Sestama</label>
                <input
                  type="text"
                  value={formData.agendaSestama}
                  onChange={(e) => setFormData({ ...formData, agendaSestama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Surat</label>
                <input
                  type="text"
                  value={formData.noSurat}
                  onChange={(e) => setFormData({ ...formData, noSurat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Surat</label>
                <input
                  type="date"
                  value={formData.tanggalSurat}
                  onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hal</label>
                <textarea
                  value={formData.hal}
                  onChange={(e) => setFormData({ ...formData, hal: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dari</label>
                <input
                  type="text"
                  value={formData.dari}
                  onChange={(e) => setFormData({ ...formData, dari: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JPG, PNG, PDF files up to 10MB</p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Report
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Surat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.noSurat}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{report.hal}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(new Date(report.createdAt))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.status === 'draft' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowForwardModal(true);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Forward</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No reports created yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forward Modal */}
      {showForwardModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Forward Report: {selectedReport.noSurat}
            </h3>
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Select Koordinator:</label>
              {KOORDINATOR_LIST.map(koordinator => (
                <label key={koordinator} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedKoordinators.includes(koordinator)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKoordinators(prev => [...prev, koordinator]);
                      } else {
                        setSelectedKoordinators(prev => prev.filter(k => k !== koordinator));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">{koordinator}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleForward}
                disabled={selectedKoordinators.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Forward
              </button>
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedReport(null);
                  setSelectedKoordinators([]);
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

export default TUDashboard;