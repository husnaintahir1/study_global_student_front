import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  Send,
} from 'lucide-react';
import {
  Application,
  ApplicationStatus,
  ApplicationStage,
} from '../services/ApplicationProcessService';
import {
  STATUS_LABELS,
  STAGE_LABELS,
  STATUS_COLORS,
  STAGE_COLORS,
  calculateStageProgress,
  formatDate,
  getRelativeTime,
  canEditApplication,
  canSubmitApplication,
} from '../utils/applicationUtils';

interface ApplicationCardProps {
  application: Application;
  onView: (applicationId: string) => void;
  onEdit: (applicationId: string) => void;
  onSubmit: (applicationId: string) => void;
  eligibilityPercentage?: number;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onView,
  onEdit,
  onSubmit,
  eligibilityPercentage = 100,
}) => {
  const progress = calculateStageProgress(application.stage);
  const canEdit = canEditApplication(application.status);
  const { canSubmit, reason: submitReason } = canSubmitApplication(
    application.status,
    application.universitySelections,
    eligibilityPercentage
  );

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'draft':
        return <Edit3 className='h-4 w-4' />;
      case 'in_review':
        return <Clock className='h-4 w-4' />;
      case 'submitted':
        return <Send className='h-4 w-4' />;
      case 'offers_received':
        return <CheckCircle className='h-4 w-4' />;
      case 'accepted':
        return <CheckCircle className='h-4 w-4' />;
      case 'rejected':
        return <AlertCircle className='h-4 w-4' />;
      case 'visa_applied':
        return <Calendar className='h-4 w-4' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  return (
    <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {application.notes || 'Study Abroad Application'}
            </h3>

            {/* Status and Stage Badges */}
            <div className='flex items-center gap-3 mb-3'>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
                  STATUS_COLORS[application.status]
                }`}
              >
                {getStatusIcon(application.status)}
                {STATUS_LABELS[application.status]}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  STAGE_COLORS[application.stage]
                }`}
              >
                {STAGE_LABELS[application.stage]}
              </span>
            </div>

            {/* Progress Bar */}
            <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
              <div
                className='bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500'
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className='text-xs text-gray-600'>{progress}% Complete</p>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2 ml-4'>
            <button
              onClick={() => onView(application.id)}
              className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
              title='View Details'
            >
              <Eye className='h-4 w-4' />
            </button>

            {canEdit && (
              <button
                onClick={() => onEdit(application.id)}
                className='p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
                title='Edit Application'
              >
                <Edit3 className='h-4 w-4' />
              </button>
            )}

            {canSubmit && (
              <button
                onClick={() => onSubmit(application.id)}
                className='px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all'
                title='Submit Application'
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6 space-y-4'>
        {/* Key Information */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Users className='h-4 w-4 text-blue-500' />
            <span>
              {application.universitySelections.length} universities selected
            </span>
          </div>

          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <CheckCircle className='h-4 w-4 text-green-500' />
            <span>{application.offerLetters.length} offers received</span>
          </div>
        </div>

        {/* Universities List */}
        {application.universitySelections.length > 0 && (
          <div>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>
              Selected Universities:
            </h4>
            <div className='space-y-1'>
              {application.universitySelections
                .slice(0, 3)
                .map((university, index) => (
                  <div
                    key={university.universityId}
                    className='flex items-center gap-2 text-sm'
                  >
                    <MapPin className='h-3 w-3 text-gray-400 flex-shrink-0' />
                    <span className='text-gray-700 truncate'>
                      {university.universityName} - {university.programName}
                    </span>
                    <span className='text-xs text-gray-500'>
                      ({university.country})
                    </span>
                  </div>
                ))}
              {application.universitySelections.length > 3 && (
                <p className='text-xs text-gray-500 ml-5'>
                  +{application.universitySelections.length - 3} more
                  universities
                </p>
              )}
            </div>
          </div>
        )}

        {/* Offers Section */}
        {application.offerLetters.length > 0 && (
          <div>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>
              Recent Offers:
            </h4>
            <div className='space-y-1'>
              {application.offerLetters.slice(0, 2).map((offer) => (
                <div
                  key={offer.id}
                  className='flex items-center justify-between text-sm'
                >
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-3 w-3 text-green-500 flex-shrink-0' />
                    <span className='text-gray-700 truncate'>
                      {offer.universityName}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : offer.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>
              ))}
              {application.offerLetters.length > 2 && (
                <p className='text-xs text-gray-500 ml-5'>
                  +{application.offerLetters.length - 2} more offers
                </p>
              )}
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {!canSubmit && submitReason && application.status === 'draft' && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
            <div className='flex items-start gap-2'>
              <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-medium text-yellow-900'>
                  Cannot Submit
                </p>
                <p className='text-sm text-yellow-800'>{submitReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between pt-3 border-t border-gray-200/50'>
          <div className='text-xs text-gray-500'>
            Created {getRelativeTime(application.createdAt)}
          </div>

          {application.submissionDate && (
            <div className='text-xs text-gray-500'>
              Submitted {formatDate(application.submissionDate)}
            </div>
          )}

          {application.consultant && (
            <div className='text-xs text-blue-600'>
              Consultant: {application.consultant.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
