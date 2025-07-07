import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiCalendar,
  FiBookOpen,
  FiGlobe,
  FiUser,
  FiFileText,
  FiMessageSquare,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiStar,
  FiTarget,
} from 'react-icons/fi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export const ProposalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/student/proposals/${id}`);
      setProposal(response.proposal);
    } catch (error) {
      console.error('Failed to fetch proposal:', error);
      toast.error('Failed to load proposal details');
      navigate('/proposals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (feedback) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/student/proposals/${id}/approve`, {
        feedback: feedback.trim(),
      });
      toast.success('Proposal accepted successfully!');
      setShowAcceptModal(false);
      fetchProposal(); // Refresh data
    } catch (error) {
      console.error('Failed to accept proposal:', error);
      toast.error('Failed to accept proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (rejectionReason, feedback) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/student/proposals/${id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        feedback: feedback.trim(),
      });
      toast.success('Proposal rejected successfully');
      setShowRejectModal(false);
      fetchProposal(); // Refresh data
    } catch (error) {
      console.error('Failed to reject proposal:', error);
      toast.error('Failed to reject proposal');
    } finally {
      setIsSubmitting(false);
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
    };
    return configs[status] || configs.pending;
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <FiAlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Proposal not found
          </h2>
          <p className='text-gray-600 mb-6'>
            The proposal you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/proposals')}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(proposal.status);
  const expired = isExpired(proposal.expiresAt);
  const canTakeAction = proposal.status === 'pending' && !expired;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center gap-4 mb-4'>
            <button
              onClick={() => navigate('/proposals')}
              className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors'
            >
              <FiArrowLeft className='h-5 w-5 text-gray-600' />
            </button>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {proposal.title}
              </h1>
              <p className='text-gray-600'>Proposal Details</p>
            </div>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
                expired
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : statusConfig.color
              }`}
            >
              <statusConfig.icon className='h-4 w-4 mr-2' />
              {expired ? 'Expired' : statusConfig.text}
            </div>
          </div>

          {/* AI Recommendation Badge */}
          <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full border border-emerald-200 w-fit'>
            <FiZap className='h-4 w-4 text-emerald-600 animate-pulse' />
            <span className='text-sm font-medium text-emerald-700'>
              AI-Matched Proposal
            </span>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Description */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Proposal Overview
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                {proposal.description}
              </p>
            </div>

            {/* Program Details */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                Program Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <FiBookOpen className='h-5 w-5 text-blue-600 mt-1' />
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        Proposed Program
                      </h3>
                      <p className='text-gray-600'>
                        {proposal.proposedProgram}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <FiGlobe className='h-5 w-5 text-blue-600 mt-1' />
                    <div>
                      <h3 className='font-medium text-gray-900'>University</h3>
                      <p className='text-gray-600'>
                        {proposal.proposedUniversity}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <FiDollarSign className='h-5 w-5 text-green-600 mt-1' />
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        Estimated Cost
                      </h3>
                      <p className='text-2xl font-bold text-green-600'>
                        {formatCurrency(proposal.estimatedCost)}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <FiCalendar className='h-5 w-5 text-purple-600 mt-1' />
                    <div>
                      <h3 className='font-medium text-gray-900'>Timeline</h3>
                      <p className='text-gray-600'>{proposal.timeline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {proposal.details && Object.keys(proposal.details).length > 0 && (
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Additional Details
                </h2>
                <div className='space-y-3'>
                  {Object.entries(proposal.details).map(([key, value]) => (
                    <div key={key} className='flex justify-between'>
                      <span className='text-gray-600 capitalize'>
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className='text-gray-900 font-medium'>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection Reason (if rejected) */}
            {proposal.status === 'rejected' && proposal.rejectionReason && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-6'>
                <h2 className='text-lg font-semibold text-red-900 mb-4'>
                  Rejection Details
                </h2>
                <p className='text-red-800'>{proposal.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Expiry Warning */}
            {expired && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <FiAlertCircle className='h-5 w-5 text-red-600' />
                  <h3 className='font-medium text-red-900'>Proposal Expired</h3>
                </div>
                <p className='text-sm text-red-800'>
                  This proposal expired on {formatDate(proposal.expiresAt)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {canTakeAction && (
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h3 className='font-medium text-gray-900 mb-4'>Take Action</h3>
                <div className='space-y-3'>
                  <button
                    onClick={() => setShowAcceptModal(true)}
                    className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                  >
                    <FiCheckCircle className='h-4 w-4' />
                    Accept Proposal
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className='w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors'
                  >
                    <FiXCircle className='h-4 w-4' />
                    Reject Proposal
                  </button>
                </div>
                <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                  <p className='text-xs text-blue-800'>
                    <FiClock className='h-3 w-3 inline mr-1' />
                    Expires on {formatDate(proposal.expiresAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Proposal Timeline */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h3 className='font-medium text-gray-900 mb-4'>
                Proposal Timeline
              </h3>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Created:</span>
                  <span className='text-gray-900'>
                    {formatDate(proposal.createdAt)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Last Updated:</span>
                  <span className='text-gray-900'>
                    {formatDate(proposal.updatedAt)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Expires:</span>
                  <span
                    className={
                      expired ? 'text-red-600 font-medium' : 'text-gray-900'
                    }
                  >
                    {formatDate(proposal.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <FiZap className='h-5 w-5 text-blue-600 animate-pulse' />
                <h3 className='font-medium text-blue-900'>AI Insights</h3>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <FiAward className='h-4 w-4 text-blue-600' />
                  <span className='text-sm text-blue-800'>
                    95% Profile Match
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <FiTrendingUp className='h-4 w-4 text-blue-600' />
                  <span className='text-sm text-blue-800'>
                    High Success Rate
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <FiStar className='h-4 w-4 text-blue-600' />
                  <span className='text-sm text-blue-800'>
                    Recommended Choice
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <FiTarget className='h-4 w-4 text-blue-600' />
                  <span className='text-sm text-blue-800'>
                    Fits Career Goals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <AcceptModal
          onClose={() => setShowAcceptModal(false)}
          onAccept={handleAccept}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onReject={handleReject}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Accept Modal Component
const AcceptModal = ({ onClose, onAccept, isSubmitting }) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      onAccept(feedback);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
          onClick={onClose}
        />

        <div className='relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-green-100 rounded-full'>
              <FiCheckCircle className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Accept Proposal
              </h2>
              <p className='text-sm text-gray-600'>Confirm your acceptance</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <label
                htmlFor='feedback'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Feedback (Optional)
              </label>
              <textarea
                id='feedback'
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                placeholder='Share your thoughts about this proposal...'
              />
            </div>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onClose}
                disabled={isSubmitting}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting || !feedback.trim()}
                className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <LoadingSpinner size='sm' />
                ) : (
                  <>
                    <FiCheckCircle className='h-4 w-4' />
                    Accept
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reject Modal Component
const RejectModal = ({ onClose, onReject, isSubmitting }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const predefinedReasons = [
    "The proposed university doesn't match my preferences",
    'The estimated cost is beyond my budget',
    "The timeline doesn't work for me",
    'I prefer a different program',
    'The location is not suitable',
    'Other',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rejectionReason.trim()) {
      onReject(rejectionReason, feedback);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
          onClick={onClose}
        />

        <div className='relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-red-100 rounded-full'>
              <FiXCircle className='h-6 w-6 text-red-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Reject Proposal
              </h2>
              <p className='text-sm text-gray-600'>Please provide a reason</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Reason for Rejection <span className='text-red-500'>*</span>
              </label>
              <div className='space-y-2'>
                {predefinedReasons.map((reason) => (
                  <label key={reason} className='flex items-center'>
                    <input
                      type='radio'
                      name='rejectionReason'
                      value={reason}
                      checked={rejectionReason === reason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300'
                    />
                    <span className='ml-2 text-sm text-gray-700'>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className='mb-6'>
              <label
                htmlFor='rejectFeedback'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Additional Feedback (Optional)
              </label>
              <textarea
                id='rejectFeedback'
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                placeholder='Provide additional details...'
              />
            </div>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onClose}
                disabled={isSubmitting}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting || !rejectionReason.trim()}
                className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <LoadingSpinner size='sm' />
                ) : (
                  <>
                    <FiXCircle className='h-4 w-4' />
                    Reject
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
