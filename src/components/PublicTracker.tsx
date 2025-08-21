import React, { useState } from 'react';
import { Search, ArrowLeft, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getReports } from '../utils/storage';
import { Report } from '../types';

interface PublicTrackerProps {
  onBackToLogin: () => void;
}

const PublicTracker: React.FC<PublicTrackerProps> = ({ onBackToLogin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Report | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    // Simulate search delay
    setTimeout(() => {
      const reports = getReports();
      const report = reports.find(r => 
        r.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.noAgenda.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (report) {
        setSearchResult(report);
        setNotFound(false);
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600';
      case 'forwarded': return 'text-blue-600';
      case 'assigned': return 'text-yellow-600';
      case 'in-progress': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      case 'revision': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-5 h-5" />;
      case 'forwarded': return <Clock className="w-5 h-5" />;
      case 'assigned': return <Clock className="w-5 h-5" />;
      case 'in-progress': return <Clock className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'revision': return <AlertCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'forwarded': return 'Forwarded to Koordinator';
      case 'assigned': return 'Task Assigned to Staff';
      case 'in-progress': return 'Work in Progress';
      case 'completed': return 'Completed';
      case 'revision': return 'Needs Revision';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToLogin}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Tracker</h1>
            <p className="text-gray-600">Track your report status</p>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Track Your Report</h2>
            <p className="text-gray-600">Enter your report number or agenda number</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter No. Surat or No. Agenda"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Track Report'}
            </button>
          </form>
        </div>

        {/* Search Results */}
        {notFound && (
          <div className="bg-white rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600">
              No report found with the number "{searchQuery}". Please check the report number and try again.
            </p>
          </div>
        )}

        {searchResult && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Report: {searchResult.noSurat}</h3>
                  <p className="text-blue-100">{searchResult.hal}</p>
                </div>
                <div className={`flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg ${getStatusColor(searchResult.status)}`}>
                  {getStatusIcon(searchResult.status)}
                  <span className="font-medium text-white">{getStatusText(searchResult.status)}</span>
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Report Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>No. Agenda:</strong> {searchResult.noAgenda}</div>
                    <div><strong>Tanggal Surat:</strong> {new Date(searchResult.tanggalSurat).toLocaleDateString('id-ID')}</div>
                    <div><strong>Dari:</strong> {searchResult.dari}</div>
                    <div><strong>Kelompok Asal:</strong> {searchResult.kelompokAsalSurat}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Classification</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Sifat:</strong> 
                      <div className="flex flex-wrap gap-1 mt-1">
                        {searchResult.sifat.map((s, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Derajat:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {searchResult.derajat.map((d, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Timeline</h4>
                <div className="space-y-4">
                  {searchResult.timeline.map((entry, index) => (
                    <div key={entry.id} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                        index === 0 ? 'bg-blue-500' : 
                        index === searchResult.timeline.length - 1 ? getStatusColor(searchResult.status).replace('text-', 'bg-') :
                        'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                        </div>
                        <p className="text-sm text-gray-600">{entry.user}</p>
                        {entry.details && (
                          <p className="text-xs text-gray-500 mt-1">{entry.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTracker;