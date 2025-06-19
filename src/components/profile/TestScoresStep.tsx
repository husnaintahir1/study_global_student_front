import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiPlus, FiX, FiInfo } from 'react-icons/fi';

interface TestScoresStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { testScores: StudentProfile['testScores'] }) => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isSaving?: boolean;
}

type TestType = 'ielts' | 'toefl' | 'sat' | 'gre' | 'gmat' | 'neet';

export const TestScoresStep: React.FC<TestScoresStepProps> = ({
  data,
  onNext,
  onPrevious,
  isSaving,
}) => {
  const [selectedTests, setSelectedTests] = useState<TestType[]>(() => {
    const tests: TestType[] = [];
    if (data.testScores?.ieltsScores) tests.push('ielts');
    if (data.testScores?.toeflScore) tests.push('toefl');
    if (data.testScores?.satScore) tests.push('sat');
    if (data.testScores?.greScore) tests.push('gre');
    if (data.testScores?.gmatScore) tests.push('gmat');
    if (data.testScores?.neetScore) tests.push('neet');
    return tests;
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfile['testScores']>({
    defaultValues: data.testScores || {
      partTimeWork: false,
    },
  });

  const onSubmit = (formData: StudentProfile['testScores']) => {
    // Clean up data - only include selected tests
    const cleanedData: StudentProfile['testScores'] = {
      partTimeWork: formData.partTimeWork,
      backlogs: formData.backlogs,
      workExperience: formData.workExperience,
    };

    if (selectedTests.includes('ielts') && formData.ieltsScores) {
      cleanedData.ieltsScores = formData.ieltsScores;
    }
    if (selectedTests.includes('toefl') && formData.toeflScore) {
      cleanedData.toeflScore = formData.toeflScore;
    }
    if (selectedTests.includes('sat') && formData.satScore) {
      cleanedData.satScore = formData.satScore;
    }
    if (selectedTests.includes('gre') && formData.greScore) {
      cleanedData.greScore = formData.greScore;
    }
    if (selectedTests.includes('gmat') && formData.gmatScore) {
      cleanedData.gmatScore = formData.gmatScore;
    }
    if (selectedTests.includes('neet') && formData.neetScore) {
      cleanedData.neetScore = formData.neetScore;
    }

    onNext({ testScores: cleanedData });
  };

  const addTest = (test: TestType) => {
    if (!selectedTests.includes(test)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeTest = (test: TestType) => {
    setSelectedTests(selectedTests.filter((t) => t !== test));
  };

  const testOptions: { value: TestType; label: string; description: string }[] =
    [
      {
        value: 'ielts',
        label: 'IELTS',
        description: 'International English Language Testing System',
      },
      {
        value: 'toefl',
        label: 'TOEFL',
        description: 'Test of English as a Foreign Language',
      },
      { value: 'sat', label: 'SAT', description: 'Scholastic Assessment Test' },
      {
        value: 'gre',
        label: 'GRE',
        description: 'Graduate Record Examination',
      },
      {
        value: 'gmat',
        label: 'GMAT',
        description: 'Graduate Management Admission Test',
      },
      {
        value: 'neet',
        label: 'NEET',
        description: 'National Eligibility cum Entrance Test',
      },
    ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Test Selection */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          English Proficiency & Standardized Tests
        </h3>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
          <div className='flex'>
            <FiInfo className='h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0' />
            <p className='text-sm text-blue-800'>
              Add only the tests you have taken or plan to take. English
              proficiency tests (IELTS/TOEFL) are usually required for
              international applications.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {testOptions.map(
            (test) =>
              !selectedTests.includes(test.value) && (
                <button
                  key={test.value}
                  type='button'
                  onClick={() => addTest(test.value)}
                  className='flex items-start p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors'
                >
                  <FiPlus className='h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0' />
                  <div className='text-left'>
                    <p className='font-medium text-gray-900'>{test.label}</p>
                    <p className='text-sm text-gray-600'>{test.description}</p>
                  </div>
                </button>
              )
          )}
        </div>
      </div>

      {/* Test Scores */}
      <div className='space-y-6'>
        {selectedTests.includes('ielts') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>IELTS Score</h4>
              <button
                type='button'
                onClick={() => removeTest('ielts')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
              <div>
                <label className='label'>Listening</label>
                <input
                  {...register('ieltsScores.listening', {
                    valueAsNumber: true,
                    min: 0,
                    max: 9,
                  })}
                  type='number'
                  step='0.5'
                  min='0'
                  max='9'
                  className='input'
                  placeholder='0-9'
                />
              </div>
              <div>
                <label className='label'>Reading</label>
                <input
                  {...register('ieltsScores.reading', {
                    valueAsNumber: true,
                    min: 0,
                    max: 9,
                  })}
                  type='number'
                  step='0.5'
                  min='0'
                  max='9'
                  className='input'
                  placeholder='0-9'
                />
              </div>
              <div>
                <label className='label'>Writing</label>
                <input
                  {...register('ieltsScores.writing', {
                    valueAsNumber: true,
                    min: 0,
                    max: 9,
                  })}
                  type='number'
                  step='0.5'
                  min='0'
                  max='9'
                  className='input'
                  placeholder='0-9'
                />
              </div>
              <div>
                <label className='label'>Speaking</label>
                <input
                  {...register('ieltsScores.speaking', {
                    valueAsNumber: true,
                    min: 0,
                    max: 9,
                  })}
                  type='number'
                  step='0.5'
                  min='0'
                  max='9'
                  className='input'
                  placeholder='0-9'
                />
              </div>
              <div>
                <label className='label'>Overall Band</label>
                <input
                  {...register('ieltsScores.total', {
                    valueAsNumber: true,
                    min: 0,
                    max: 9,
                  })}
                  type='number'
                  step='0.5'
                  min='0'
                  max='9'
                  className='input'
                  placeholder='0-9'
                />
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('toefl') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>TOEFL Score</h4>
              <button
                type='button'
                onClick={() => removeTest('toefl')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>Total Score (iBT)</label>
                <input
                  {...register('toeflScore')}
                  type='text'
                  className='input'
                  placeholder='e.g., 100/120'
                />
              </div>
              <div>
                <p className='text-sm text-gray-600 mt-2'>
                  Enter your total TOEFL iBT score out of 120, or your PBT score
                  if applicable.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('sat') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>SAT Score</h4>
              <button
                type='button'
                onClick={() => removeTest('sat')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div>
              <label className='label'>Total Score</label>
              <input
                {...register('satScore', { valueAsNumber: true })}
                type='number'
                className='input max-w-xs'
                placeholder='400-1600'
                min='400'
                max='1600'
              />
              <p className='text-sm text-gray-600 mt-1'>
                Enter your total SAT score (400-1600)
              </p>
            </div>
          </div>
        )}

        {selectedTests.includes('gre') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>GRE Score</h4>
              <button
                type='button'
                onClick={() => removeTest('gre')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div>
              <label className='label'>
                Total Score (Verbal + Quantitative)
              </label>
              <input
                {...register('greScore', { valueAsNumber: true })}
                type='number'
                className='input max-w-xs'
                placeholder='260-340'
                min='260'
                max='340'
              />
              <p className='text-sm text-gray-600 mt-1'>
                Enter your combined Verbal and Quantitative score (260-340)
              </p>
            </div>
          </div>
        )}

        {selectedTests.includes('gmat') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>GMAT Score</h4>
              <button
                type='button'
                onClick={() => removeTest('gmat')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div>
              <label className='label'>Total Score</label>
              <input
                {...register('gmatScore', { valueAsNumber: true })}
                type='number'
                className='input max-w-xs'
                placeholder='200-800'
                min='200'
                max='800'
              />
              <p className='text-sm text-gray-600 mt-1'>
                Enter your total GMAT score (200-800)
              </p>
            </div>
          </div>
        )}

        {selectedTests.includes('neet') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>NEET Score</h4>
              <button
                type='button'
                onClick={() => removeTest('neet')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div>
              <label className='label'>Score</label>
              <input
                {...register('neetScore', { valueAsNumber: true })}
                type='number'
                className='input max-w-xs'
                placeholder='Enter NEET score'
              />
            </div>
          </div>
        )}
      </div>

      {/* Academic Performance */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Academic Performance
        </h3>
        <div className='space-y-4'>
          <div>
            <label htmlFor='backlogs' className='label'>
              Do you have any backlogs/failures/re-attempts?
            </label>
            <textarea
              {...register('backlogs')}
              id='backlogs'
              rows={2}
              className='input'
              placeholder='If yes, please provide details (e.g., 2 backlogs in 3rd semester, cleared in re-exam)'
            />
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Work Experience
        </h3>
        <div className='space-y-4'>
          <div>
            <label htmlFor='workExperience' className='label'>
              Professional Work Experience
            </label>
            <textarea
              {...register('workExperience')}
              id='workExperience'
              rows={3}
              className='input'
              placeholder='Briefly describe your work experience including company names, positions, and duration...'
            />
            <p className='text-sm text-gray-600 mt-1'>
              Include internships, full-time positions, or relevant professional
              experience
            </p>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              {...register('partTimeWork')}
              type='checkbox'
              id='partTimeWork'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='partTimeWork'
              className='text-sm font-medium text-gray-700'
            >
              I am interested in part-time work opportunities while studying
            </label>
          </div>
        </div>
      </div>

      <div className='flex justify-between'>
        <button type='button' onClick={onPrevious} className='btn btn-outline'>
          Previous
        </button>
        <button
          type='submit'
          disabled={isSubmitting || isSaving}
          className='btn btn-primary flex items-center'
        >
          {isSubmitting || isSaving ? (
            <LoadingSpinner size='sm' />
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </form>
  );
};
