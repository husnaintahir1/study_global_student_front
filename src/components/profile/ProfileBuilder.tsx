import React, { useState, useEffect } from 'react';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { PersonalInfoStep } from './PersonalInfoStep';
import { AcademicBackgroundStep } from './AcademicBackgroundStep';
import { TestScoresStep } from './TestScoresStep';
import { PreferencesStep } from './PreferencesStep';
// import { FinancialDocumentationStep } from './FinancialDocumentationStep';
import { StudentProfile } from '@/types';
import { profileService } from '@/services/profile.service';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { FinancialInfoStep } from './FinancialInfoStep';
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
  const canComplete = completedSteps.size === steps.length;
  const stepProgress = Math.round((completedSteps.size / steps.length) * 100);

  return (
    <div className='max-w-5xl mx-auto'>
      {/* Overall Progress */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-sm font-medium text-gray-700'>
            Profile Completion
          </h3>
          <span className='text-sm font-medium text-gray-900'>
            {stepProgress}%
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-primary-600 h-2 rounded-full transition-all duration-500'
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepClick(index)}
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full font-medium transition-all',
                  currentStep === index
                    ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                    : completedSteps.has(index)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                )}
              >
                {completedSteps.has(index) ? (
                  <FiCheck className='h-5 w-5' />
                ) : (
                  index + 1
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 transition-colors',
                    completedSteps.has(index) ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className='mt-4 text-center'>
          <h2 className='text-xl font-bold text-gray-900'>
            {steps[currentStep].title}
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Step {currentStep + 1} of {steps.length}
            {savingStep && (
              <span className='ml-2 inline-flex items-center'>
                <FiLoader className='animate-spin h-4 w-4 mr-1' />
                Saving...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className='card'>
        <CurrentStepComponent
          data={profileData}
          onNext={handleStepComplete}
          onPrevious={handlePrevious}
          isLastStep={isLastStep}
          isSaving={savingStep}
        />
      </div>

      {/* Navigation Help */}
      <div className='mt-6 text-center text-sm text-gray-600'>
        <p>Your progress is automatically saved after each step.</p>
        <p>
          You can return to any section at any time to update your information.
        </p>
      </div>
    </div>
  );
};
