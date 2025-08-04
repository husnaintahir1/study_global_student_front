import React, { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiUser,
//   FiGraduationCap,
  FiFileText,
  FiSend,
  FiAward,
  FiMapPin,
  FiCalendar,
  FiTarget,
  FiTrendingUp,
  FiInfo,
  FiExternalLink,
  FiBookOpen,
  FiDollarSign,
  FiGlobe,
  FiRefreshCw,
} from 'react-icons/fi';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'blocked';
  completedAt?: string;
  estimatedDuration?: string;
  actions?: Array<{
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  tips?: string[];
  documents?: string[];
}

interface ApplicationProgressProps {
  applicationId: string;
  currentStage: string;
  status: string;
  onStageAction?: (stage: string, action: string) => void;
}

const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  applicationId,
  currentStage,
  status,
  onStageAction,
}) => {
  const [progressData, setProgressData] = useState<ProgressStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  useEffect(() => {
    generateProgressSteps();
  }, [currentStage, status]);

  const generateProgressSteps = () => {
    const stages = [
      'profile_review',
      'university_selection',
      'document_preparation',
      'submission',
      'offer_management',
      'visa_application',
      'completed',
    ];

    const currentIndex = stages.indexOf(currentStage);

    const steps: ProgressStep[] = [
      {
        id: 'profile_review',
        title: 'Profile Review',
        description: 'Complete and verify your student profile information',
        status:
          currentIndex > 0
            ? 'completed'
            : currentIndex === 0
            ? 'current'
            : 'upcoming',
        completedAt: currentIndex > 0 ? '2024-01-15' : undefined,
        estimatedDuration: '2-3 days',
        actions: [
          {
            title: 'Complete Personal Information',
            description: 'Fill in all required personal details',
            completed: currentIndex > 0,
            priority: 'high',
          },
          {
            title: 'Upload Required Documents',
            description: 'Submit passport, transcripts, and test scores',
            completed: currentIndex > 0,
            priority: 'high',
          },
          {
            title: 'Profile Verification',
            description: 'Wait for consultant to verify your information',
            completed: currentIndex > 0,
            priority: 'medium',
          },
        ],
        tips: [
          'Ensure all information is accurate and up-to-date',
          'Have all documents ready in PDF format',
          'Double-check spelling of names and addresses',
        ],
        documents: [
          'Passport',
          'Academic Transcripts',
          'Test Scores',
          'CV/Resume',
        ],
      },
      {
        id: 'university_selection',
        title: 'University Selection',
        description: 'Choose universities and programs that match your goals',
        status:
          currentIndex > 1
            ? 'completed'
            : currentIndex === 1
            ? 'current'
            : 'upcoming',
        completedAt: currentIndex > 1 ? '2024-01-20' : undefined,
        estimatedDuration: '1-2 weeks',
        actions: [
          {
            title: 'Research Universities',
            description: 'Explore available universities and programs',
            completed: currentIndex > 1,
            priority: 'high',
          },
          {
            title: 'Select Programs',
            description: 'Choose up to 5 university programs',
            completed: currentIndex > 1,
            priority: 'high',
          },
          {
            title: 'Consultant Review',
            description: 'Get approval from your consultant',
            completed: currentIndex > 1,
            priority: 'medium',
          },
        ],
        tips: [
          'Consider university rankings and program reputation',
          'Check admission requirements carefully',
          'Consider location, costs, and lifestyle factors',
          'Have backup options in different countries',
        ],
      },
      {
        id: 'document_preparation',
        title: 'Document Preparation',
        description: 'Prepare and organize all application documents',
        status:
          currentIndex > 2
            ? 'completed'
            : currentIndex === 2
            ? 'current'
            : 'upcoming',
        completedAt: currentIndex > 2 ? '2024-01-25' : undefined,
        estimatedDuration: '1-3 weeks',
        actions: [
          {
            title: 'Statement of Purpose',
            description: 'Write compelling personal statements',
            completed: currentIndex > 2,
            priority: 'high',
            dueDate: '2024-02-01',
          },
          {
            title: 'Letters of Recommendation',
            description: 'Obtain recommendation letters',
            completed: currentIndex > 2,
            priority: 'high',
            dueDate: '2024-02-05',
          },
          {
            title: 'Financial Documents',
            description: 'Prepare bank statements and sponsorship letters',
            completed: currentIndex > 2,
            priority: 'medium',
          },
          {
            title: 'Document Translation',
            description: 'Translate documents if required',
            completed: currentIndex > 2,
            priority: 'low',
          },
        ],
        tips: [
          'Start early - some documents take time to obtain',
          'Get documents notarized if required',
          'Keep digital and physical copies',
          "Check each university's specific requirements",
        ],
        documents: [
          'Statement of Purpose',
          'Recommendation Letters',
          'Financial Statements',
          'Portfolio (if required)',
        ],
      },
      {
        id: 'submission',
        title: 'Application Submission',
        description: 'Submit applications to your selected universities',
        status:
          currentIndex > 3
            ? 'completed'
            : currentIndex === 3
            ? 'current'
            : 'upcoming',
        completedAt: currentIndex > 3 ? '2024-02-10' : undefined,
        estimatedDuration: '1 week',
        actions: [
          {
            title: 'Online Applications',
            description: 'Submit applications through university portals',
            completed: currentIndex > 3,
            priority: 'high',
            dueDate: '2024-02-15',
          },
          {
            title: 'Application Fees',
            description: 'Pay required application fees',
            completed: currentIndex > 3,
            priority: 'high',
          },
          {
            title: 'Document Upload',
            description: 'Upload all supporting documents',
            completed: currentIndex > 3,
            priority: 'high',
          },
          {
            title: 'Submission Confirmation',
            description: 'Receive confirmation from universities',
            completed: currentIndex > 3,
            priority: 'medium',
          },
        ],
        tips: [
          "Submit before deadlines - don't wait until the last day",
          'Keep confirmation emails and reference numbers',
          'Check application status regularly',
          "Follow up if you don't receive confirmations",
        ],
      },
      {
        id: 'offer_management',
        title: 'Offer Management',
        description: 'Review and respond to university offers',
        status:
          currentIndex > 4
            ? 'completed'
            : currentIndex === 4
            ? 'current'
            : 'upcoming',
        completedAt: currentIndex > 4 ? '2024-03-15' : undefined,
        estimatedDuration: '2-8 weeks',
        actions: [
          {
            title: 'Wait for Offers',
            description: 'Universities will send offer letters',
            completed: currentIndex > 4,
            priority: 'low',
          },
          {
            title: 'Compare Offers',
            description: 'Evaluate offers based on your criteria',
            completed: currentIndex > 4,
            priority: 'high',
          },
          {
            title: 'Accept Offer',
            description: 'Accept your preferred university offer',
            completed: currentIndex > 4,
            priority: 'high',
            dueDate: '2024-04-01',
          },
          {
            title: 'Pay Deposit',
            description: 'Secure your place with deposit payment',
            completed: currentIndex > 4,
            priority: 'high',
          },
        ],
        tips: [
          "Don't accept the first offer immediately",
          'Consider all factors: academics, location, costs',
          'Negotiate scholarships if possible',
          'Respond to offers within deadlines',
        ],
      },
      {
        id: 'visa_application',
        title: 'Visa Application',
        description: 'Apply for student visa and prepare for departure',
        status:
          currentIndex > 5
            ? 'completed'
            : currentIndex === 5
            ? 'current'
            : 'upcoming',
        completedAt: currentIndex > 5 ? '2024-05-20' : undefined,
        estimatedDuration: '4-12 weeks',
        actions: [
          {
            title: 'Visa Documentation',
            description: 'Gather all required visa documents',
            completed: currentIndex > 5,
            priority: 'high',
            dueDate: '2024-05-01',
          },
          {
            title: 'Visa Interview',
            description: 'Attend visa interview if required',
            completed: currentIndex > 5,
            priority: 'high',
          },
          {
            title: 'Accommodation',
            description: 'Arrange housing and accommodation',
            completed: currentIndex > 5,
            priority: 'medium',
          },
          {
            title: 'Travel Preparation',
            description: 'Book flights and prepare for departure',
            completed: currentIndex > 5,
            priority: 'medium',
          },
        ],
        tips: [
          'Apply for visa as soon as you accept an offer',
          'Prepare for visa interview thoroughly',
          'Arrange accommodation early',
          'Check health insurance requirements',
        ],
        documents: [
          'Visa Application Form',
          'Financial Proof',
          'Medical Certificates',
          'Police Clearance',
        ],
      },
      {
        id: 'completed',
        title: 'Journey Complete',
        description: 'Ready to start your study abroad adventure!',
        status: currentIndex >= 6 ? 'completed' : 'upcoming',
        completedAt: currentIndex >= 6 ? '2024-06-30' : undefined,
        actions: [
          {
            title: 'Final Preparations',
            description: 'Complete all pre-departure tasks',
            completed: currentIndex >= 6,
            priority: 'medium',
          },
          {
            title: 'Begin Studies',
            description: 'Start your academic journey',
            completed: false,
            priority: 'high',
          },
        ],
        tips: [
          'Stay in touch with your consultant',
          'Connect with other students',
          'Enjoy your study abroad experience!',
        ],
      },
    ];

    setProgressData(steps);
    setLoading(false);
  };

  const getStatusIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className='h-5 w-5 text-green-600' />;
      case 'current':
        return <FiClock className='h-5 w-5 text-blue-600' />;
      case 'blocked':
        return <FiAlertCircle className='h-5 w-5 text-red-600' />;
      default:
        return <FiClock className='h-5 w-5 text-gray-400' />;
    }
  };

  const getStatusColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'current':
        return 'bg-blue-100 border-blue-300';
      case 'blocked':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
          Application Progress
        </h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Track your study abroad application journey step by step
        </p>
      </div>

      {/* Progress Overview */}
      <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                Journey Overview
              </h2>
              <p className='text-gray-600'>Your path to studying abroad</p>
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-blue-600'>
                {Math.round(
                  (progressData.filter((step) => step.status === 'completed')
                    .length /
                    progressData.length) *
                    100
                )}
                %
              </p>
              <p className='text-sm text-blue-700'>Complete</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className='p-6'>
          <div className='relative'>
            {progressData.map((step, index) => (
              <div key={step.id} className='relative pb-8 last:pb-0'>
                {/* Timeline Line */}
                {index < progressData.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-20 ${
                      step.status === 'completed'
                        ? 'bg-green-300'
                        : 'bg-gray-300'
                    }`}
                  />
                )}

                {/* Step Content */}
                <div
                  className={`relative bg-white border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer ${getStatusColor(
                    step.status
                  )} ${
                    activeStep === step.id
                      ? 'ring-2 ring-blue-200'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() =>
                    setActiveStep(activeStep === step.id ? null : step.id)
                  }
                >
                  <div className='flex items-start gap-4'>
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-green-100 border-green-300'
                          : step.status === 'current'
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {getStatusIcon(step.status)}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {step.title}
                        </h3>
                        <div className='flex items-center gap-2'>
                          {step.estimatedDuration && (
                            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                              {step.estimatedDuration}
                            </span>
                          )}
                          {step.status === 'completed' && step.completedAt && (
                            <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                              Completed{' '}
                              {new Date(step.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className='text-gray-600 mb-4'>{step.description}</p>

                      {/* Current Step Progress */}
                      {step.status === 'current' && step.actions && (
                        <div className='mb-4'>
                          <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
                            <span>Progress</span>
                            <span>
                              {
                                step.actions.filter(
                                  (action) => action.completed
                                ).length
                              }
                              /{step.actions.length} tasks
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500'
                              style={{
                                width: `${
                                  (step.actions.filter(
                                    (action) => action.completed
                                  ).length /
                                    step.actions.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Expandable Details */}
                      {activeStep === step.id && (
                        <div className='mt-6 space-y-6 border-t border-gray-200 pt-6'>
                          {/* Actions */}
                          {step.actions && (
                            <div>
                              <h4 className='text-sm font-medium text-gray-900 mb-3 flex items-center gap-2'>
                                <FiTarget className='h-4 w-4' />
                                Action Items
                              </h4>
                              <div className='space-y-3'>
                                {step.actions.map((action, actionIndex) => (
                                  <div
                                    key={actionIndex}
                                    className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                        action.completed
                                          ? 'bg-green-100 border-green-300'
                                          : 'bg-white border-gray-300'
                                      }`}
                                    >
                                      {action.completed && (
                                        <FiCheckCircle className='h-3 w-3 text-green-600' />
                                      )}
                                    </div>
                                    <div className='flex-1'>
                                      <div className='flex items-center justify-between mb-1'>
                                        <h5 className='text-sm font-medium text-gray-900'>
                                          {action.title}
                                        </h5>
                                        <div className='flex items-center gap-2'>
                                          <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                                              action.priority
                                            )}`}
                                          >
                                            {action.priority}
                                          </span>
                                          {action.dueDate && (
                                            <span className='text-xs text-gray-500 flex items-center gap-1'>
                                              <FiCalendar className='h-3 w-3' />
                                              {new Date(
                                                action.dueDate
                                              ).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <p className='text-sm text-gray-600'>
                                        {action.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tips */}
                          {step.tips && (
                            <div>
                              <h4 className='text-sm font-medium text-gray-900 mb-3 flex items-center gap-2'>
                                <FiInfo className='h-4 w-4' />
                                Helpful Tips
                              </h4>
                              <ul className='space-y-2'>
                                {step.tips.map((tip, tipIndex) => (
                                  <li
                                    key={tipIndex}
                                    className='text-sm text-gray-600 flex items-start gap-2'
                                  >
                                    <span className='text-blue-500 mt-1.5 text-xs'>
                                      •
                                    </span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Required Documents */}
                          {step.documents && (
                            <div>
                              <h4 className='text-sm font-medium text-gray-900 mb-3 flex items-center gap-2'>
                                <FiFileText className='h-4 w-4' />
                                Required Documents
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {step.documents.map((doc, docIndex) => (
                                  <span
                                    key={docIndex}
                                    className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-200'
                                  >
                                    <FiFileText className='h-3 w-3' />
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200/50'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
            What's Next?
          </h2>
          <p className='text-gray-600'>Your immediate action items</p>
        </div>

        <div className='p-6'>
          {(() => {
            const currentStep = progressData.find(
              (step) => step.status === 'current'
            );
            const nextActions =
              currentStep?.actions?.filter((action) => !action.completed) || [];

            if (nextActions.length === 0) {
              return (
                <div className='text-center py-8'>
                  <div className='p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
                    <FiCheckCircle className='h-8 w-8 text-green-600' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    All caught up!
                  </h3>
                  <p className='text-gray-600'>
                    You're on track with your application process.
                  </p>
                </div>
              );
            }

            return (
              <div className='space-y-4'>
                {nextActions.slice(0, 3).map((action, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200'
                  >
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <FiArrowRight className='h-5 w-5 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900'>
                        {action.title}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {action.description}
                      </p>
                    </div>
                    {action.dueDate && (
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>Due</p>
                        <p className='text-xs text-gray-600'>
                          {new Date(action.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ApplicationProgress;
