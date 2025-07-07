import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiBookOpen,
  FiGlobe,
  FiFilter,
  FiSearch,
  FiAlertCircle,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export const ProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/student/proposals');
      setProposals(response.proposals || []);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FiClock,
        text: 'Pending Review',
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FiCheckCircle,
        text: 'Approved',
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FiXCircle,
        text: 'Rejected',
      },
      expired: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FiAlertCircle,
        text: 'Expired',
      },
    };
    return configs[status] || configs.pending;
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesFilter = filter === 'all' || proposal.status === filter;
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposedProgram
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proposal.proposedUniversity
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStats = () => {
    const total = proposals.length;
    const pending = proposals.filter(
      (p) => p.status === 'pending' && !isExpired(p.expiresAt)
    ).length;
    const approved = proposals.filter((p) => p.status === 'approved').length;
    const rejected = proposals.filter((p) => p.status === 'rejected').length;
    const expired = proposals.filter((p) => isExpired(p.expiresAt)).length;

    return { total, pending, approved, rejected, expired };
  };

  const stats = getStats();

  const StatCard = ({ icon: Icon, label, value, color, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all ${
        isActive
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className='h-5 w-5' />
        </div>
        <div className='text-left'>
          <p className='text-sm text-gray-600'>{label}</p>
          <p className='text-xl font-bold text-gray-900'>{value}</p>
        </div>
      </div>
    </button>
  );

  const ProposalCard = ({ proposal }) => {
    const statusConfig = getStatusConfig(proposal.status);
    const expired = isExpired(proposal.expiresAt);
    const Icon = statusConfig.icon;

    return (
      <div className='bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-1'>
                {proposal.title}
              </h3>
              <div
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  expired
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : statusConfig.color
                }`}
              >
                <Icon className='h-3 w-3 mr-1' />
                {expired ? 'Expired' : statusConfig.text}
              </div>
            </div>
            <p className='text-gray-600 text-sm line-clamp-2 mb-3'>
              {proposal.description}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='flex items-center gap-2'>
            <FiBookOpen className='h-4 w-4 text-gray-400' />
            <div>
              <p className='text-xs text-gray-500'>Program</p>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {proposal.proposedProgram}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <FiGlobe className='h-4 w-4 text-gray-400' />
            <div>
              <p className='text-xs text-gray-500'>University</p>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {proposal.proposedUniversity}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <FiDollarSign className='h-4 w-4 text-gray-400' />
            <div>
              <p className='text-xs text-gray-500'>Estimated Cost</p>
              <p className='text-sm font-medium text-gray-900'>
                {formatCurrency(proposal.estimatedCost)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <FiCalendar className='h-4 w-4 text-gray-400' />
            <div>
              <p className='text-xs text-gray-500'>Timeline</p>
              <p className='text-sm font-medium text-gray-900'>
                {proposal.timeline}
              </p>
            </div>
          </div>
        </div>

        {expired && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center gap-2'>
              <FiAlertCircle className='h-4 w-4 text-red-600' />
              <p className='text-sm text-red-800'>
                This proposal expired on {formatDate(proposal.expiresAt)}
              </p>
            </div>
          </div>
        )}

        <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
          <div className='flex items-center gap-4 text-xs text-gray-500'>
            <span>Created {formatDate(proposal.createdAt)}</span>
            {!expired && <span>Expires {formatDate(proposal.expiresAt)}</span>}
          </div>
          <button
            onClick={() => navigate(`/proposals/${proposal.id}`)}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <FiEye className='h-4 w-4' />
            View Details
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <FiFileText className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Proposals
                  </h1>
                  <p className='text-gray-600'>
                    Review and manage consultant proposals
                  </p>
                </div>
              </div>
            </div>

            {/* AI Badge */}
            <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full border border-emerald-200'>
              <FiZap className='h-4 w-4 text-emerald-600 animate-pulse' />
              <span className='text-sm font-medium text-emerald-700'>
                AI-Powered Matching
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-8'>
          <StatCard
            icon={FiFileText}
            label='Total Proposals'
            value={stats.total}
            color='bg-blue-100 text-blue-600'
            onClick={() => setFilter('all')}
            isActive={filter === 'all'}
          />
          <StatCard
            icon={FiClock}
            label='Pending'
            value={stats.pending}
            color='bg-yellow-100 text-yellow-600'
            onClick={() => setFilter('pending')}
            isActive={filter === 'pending'}
          />
          <StatCard
            icon={FiCheckCircle}
            label='Approved'
            value={stats.approved}
            color='bg-green-100 text-green-600'
            onClick={() => setFilter('approved')}
            isActive={filter === 'approved'}
          />
          <StatCard
            icon={FiXCircle}
            label='Rejected'
            value={stats.rejected}
            color='bg-red-100 text-red-600'
            onClick={() => setFilter('rejected')}
            isActive={filter === 'rejected'}
          />
          <StatCard
            icon={FiAlertCircle}
            label='Expired'
            value={stats.expired}
            color='bg-gray-100 text-gray-600'
            onClick={() => setFilter('expired')}
            isActive={filter === 'expired'}
          />
        </div>

        {/* Search and Filters */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 mb-8'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search proposals by title, program, or university...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <FiFileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              {proposals.length === 0
                ? 'No proposals yet'
                : 'No proposals found'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {proposals.length === 0
                ? 'Consultants will send you proposals based on your profile.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {proposals.length === 0 && (
              <button
                onClick={() => navigate('/profile')}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Complete Your Profile
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {filteredProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
