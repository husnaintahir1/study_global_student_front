import React, { useState, useEffect } from 'react';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { PersonalInfoStep } from './PersonalInfoStep';
import { AcademicBackgroundStep } from './AcademicBackgroundStep';
import { TestScoresStep } from './TestScoresStep';
import { PreferencesStep } from './PreferencesStep';
import { FinancialInfoStep } from './FinancialInfoStep';
import { StudentProfile } from '@/types';
import { profileService } from '@/services/profile.service';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProfileBuilderProps {
  initialData?: Partial<StudentProfile>;
  onComplete?: () => void;
}

const steps = [
  {
    id: 'personal-details',
    title: 'Personal Details',
    component: PersonalInfoStep,
    key: 'personalInfo',
  },
  {
    id: 'academic-background',
    title: 'Academic Background',
    component: AcademicBackgroundStep,
    key: 'educationalBackground',
  },
  {
    id: 'test-scores',
    title: 'Test Scores',
    component: TestScoresStep,
    key: 'testScores',
  },
  {
    id: 'preferences',
    title: 'Study Preferences',
    component: PreferencesStep,
    key: 'studyPreferences',
  },
  {
    id: 'financial-documentation',
    title: 'Financial & Documentation',
    component: FinancialInfoStep,
    key: 'financialDocumentation',
  },
];

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({
  initialData = {},
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] =
    useState<Partial<StudentProfile>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [savingStep, setSavingStep] = useState(false);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    // Check which steps are already completed based on initial data
    const completed = new Set<number>();
    if (initialData.profileCompletionStatus) {
      steps.forEach((step, index) => {
        if (
          initialData.profileCompletionStatus?.[
            step.key as keyof typeof initialData.profileCompletionStatus
          ]
        ) {
          completed.add(index);
        }
      });
    }
    setCompletedSteps(completed);
  }, [initialData]);

  const CurrentStepComponent = steps[currentStep].component;

  const saveStepData = async (stepKey: string, stepData: any) => {
    setSavingStep(true);
    try {
      const updatedProfile = user?.isProfileCreated
        ? await profileService.updateProfile(stepData)
        : await profileService.createProfile(stepData);
      updateUser({
        ...user,
        isProfileCreated: true,
      });
      setProfileData(updatedProfile);
      toast.success('Progress saved');
      return true;
    } catch (error) {
      toast.error('Failed to save progress. Please try again.');
      return false;
    } finally {
      setSavingStep(false);
    }
  };

  const handleStepComplete = async (stepData: any) => {
    // Update local state immediately
    const updatedData = { ...profileData, ...stepData };
    setProfileData(updatedData);

    // Save to backend
    const stepKey = steps[currentStep].key;
    const saved = await saveStepData(stepKey, stepData);

    if (saved) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (onComplete) {
        console.log('oncomplete');
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow navigation to any step, but warn if current step is incomplete
    if (!completedSteps.has(currentStep) && index !== currentStep) {
      if (
        !confirm('Current step is incomplete. Do you want to navigate away?')
      ) {
        return;
      }
    }
    setCurrentStep(index);
  };

  const isLastStep = currentStep === steps.length - 1;
  const stepProgress = Math.round((completedSteps.size / steps.length) * 100);

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Overall Progress */}
      {/* <div className='mb-8'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Profile Completion
          </h3>
          <span className='text-lg font-semibold text-blue-600'>
            {stepProgress}%
          </span>
        </div>
        <div className='w-full bg-gray-200/50 backdrop-blur-sm rounded-full h-3'>
          <div
            className='bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500'
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div> */}

      {/* Progress Steps */}
      <div className='mb-10 bg-gradient-to-r mt-10 from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className='flex flex-col items-center'>
                <button
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg transition-all duration-300',
                    currentStep === index
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ring-4 ring-blue-200/50'
                      : completedSteps.has(index)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  )}
                >
                  {completedSteps.has(index) ? (
                    <FiCheck className='h-6 w-6' />
                  ) : (
                    index + 1
                  )}
                </button>
                <span className='mt-2 text-xs font-medium text-gray-600 text-center'>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 transition-colors duration-300',
                    completedSteps.has(index) ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className='mt-6 text-center'>
          <h2 className='text-2xl font-bold text-gray-900'>
            {steps[currentStep].title}
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Step {currentStep + 1} of {steps.length}
            {savingStep && (
              <span className='ml-2 inline-flex items-center'>
                <FiLoader className='animate-spin h-5 w-5 text-blue-600 mr-1' />
                Saving...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300'>
        <CurrentStepComponent
          data={profileData}
          onNext={handleStepComplete}
          onPrevious={handlePrevious}
          isLastStep={isLastStep}
          isSaving={savingStep}
        />
      </div>

      {/* Navigation Help */}
      <div className='mt-8 text-center text-sm text-gray-600 bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-xl p-4'>
        <p>Your progress is automatically saved after each step.</p>
        <p>
          You can return to any section at any time to update your information.
        </p>
      </div>
    </div>
  );
};
