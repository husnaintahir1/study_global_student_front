import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  MapPin,
  FileText,
  Eye,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Award,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  applicationService, 
  Application,
  OfferLetter 
} from '../services/ApplicationProcessService';
import { 
  formatDate,
  formatDateTime,
  parseApiError 
} from '../utils/applicationUtils';

interface OfferWithApplication extends OfferLetter {
  applicationId: string;
  applicationTitle: string;
}

interface OfferStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

const OfferManagement: React.FC = () => {
  // State Management
  const [applications, setApplications] = useState<Application[]>([]);
  const [allOffers, setAllOffers] = useState<OfferWithApplication[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processingOfferId, setProcessingOfferId] = useState<number | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string>('all');

  // Load applications and offers
  const loadData = async () => {
    try {
      setError(null);
      const response = await applicationService.getMyApplications();
      setApplications(response.applications);

      // Extract all offers with application context
      const offersWithContext: OfferWithApplication[] = [];
      response.applications.forEach(app => {
        app.offerLetters.forEach(offer => {
          offersWithContext.push({
            ...offer,
            applicationId: app.id,
            applicationTitle: app.notes || `Application ${app.id.slice(-6)}`
          });
        });
      });

      setAllOffers(offersWithContext);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = allOffers;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Apply application filter
    if (selectedApplication !== 'all') {
      filtered = filtered.filter(offer => offer.applicationId === selectedApplication);
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.universityName.toLowerCase().includes(searchLower) ||
        offer.programName.toLowerCase().includes(searchLower) ||
        offer.applicationTitle.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOffers(filtered);
  }, [allOffers, statusFilter, selectedApplication, searchTerm]);

  // Calculate stats
  const calculateStats = (): OfferStats => {
    return {
      total: allOffers.length,
      pending: allOffers.filter(offer => offer.status === 'pending').length,
      accepted: allOffers.filter(offer => offer.status === 'accepted').length,
      rejected: allOffers.filter(offer => offer.status === 'rejected').length
    };
  };

  const stats = calculateStats();

  // Handle offer action
  const handleOfferAction = async (offer: OfferWithApplication, action: 'accept' | 'reject') => {
    setProcessingOfferId(offer.id);
    setError(null);

    try {
      await applicationService.manageOffers(offer.applicationId, {
        action,
        offerId: offer.id
      });

      // Refresh data
      await loadData();
      
      // Show success message (you can implement toast notifications)
      const actionText = action === 'accept' ? 'accepted' : 'rejected';
      alert(`Offer from ${offer.universityName} has been ${actionText} successfully!`);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setProcessingOfferId(null);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Get status styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Offer Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and manage offers from universities across all your applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-blue-700 mt-1">Total Offers</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-yellow-700 mt-1">Pending Response</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                <p className="text-sm text-green-700 mt-1">Accepted</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-red-700 mt-1">Rejected</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Filter Offers</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Application Filter */}
            <select
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            >
              <option value="all">All Applications</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.notes || `Application ${app.id.slice(-6)}`}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {filteredOffers.length} offers found
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Offers List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Offers</h2>
            <p className="text-gray-600">
              {filteredOffers.length === 0 
                ? 'No offers match your current filters'
                : `Showing ${filteredOffers.length} offers`
              }
            </p>
          </div>

          <div className="p-6">
            {filteredOffers.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {allOffers.length === 0 ? 'No Offers Yet' : 'No Offers Found'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {allOffers.length === 0 
                    ? 'Offers from universities will appear here once they start coming in. Keep track of your application progress!'
                    : 'Try adjusting your filters to see more offers.'
                  }
                </p>
                {allOffers.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/applications'}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    View Applications
                  </button>
                )}
              </div>
            ) : (
              /* Offers Grid */
              <div className="space-y-6">
                {filteredOffers.map((offer) => (
                  <div key={`${offer.applicationId}-${offer.id}`} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {offer.universityName}
                            </h3>
                            <h4 className="text-purple-600 font-medium mb-2">
                              {offer.programName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Application: {offer.applicationTitle}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyling(offer.status)}`}>
                            {getStatusIcon(offer.status)}
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </div>

                        {/* Offer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Received: {formatDate(offer.offerDate)}</span>
                          </div>
                          {offer.responseDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>Responded: {formatDate(offer.responseDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Conditions */}
                        {offer.conditions && offer.conditions.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Offer Conditions:</h5>
                            <ul className="space-y-1">
                              {offer.conditions.map((condition, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{condition}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {offer.status === 'pending' && (
                        <div className="flex items-center gap-3 ml-6">
                          <button
                            onClick={() => handleOfferAction(offer, 'reject')}
                            disabled={processingOfferId === offer.id}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {processingOfferId === offer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </button>
                          
                          <button
                            onClick={() => handleOfferAction(offer, 'accept')}
                            disabled={processingOfferId === offer.id}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {processingOfferId === offer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Accepting Offers</h4>
              <p>When you accept an offer, you're committing to that university. Make sure you understand all conditions before accepting.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Multiple Offers</h4>
              <p>You can accept multiple offers, but universities may require deposits. Consider your options carefully before making decisions.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Offer Conditions</h4>
              <p>Most offers come with conditions you must meet. Review these carefully and ensure you can fulfill them.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Response Deadlines</h4>
              <p>Universities typically give you time to respond to offers. Contact them if you need an extension on response deadlines.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferManagement;