import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiPlus, FiX, FiInfo, FiUpload, FiCheck } from 'react-icons/fi';
import { documentService } from '@/services/document.service';
import toast from 'react-hot-toast';
import { validators } from '@/utils/validators';

interface TestScoresStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { testScores: StudentProfile['testScores'] }) => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isSaving?: boolean;
}

type TestType =
  | 'ielts'
  | 'toefl'
  | 'sat'
  | 'act'
  | 'gre'
  | 'gmat'
  | 'neet'
  | 'pte'
  | 'duolingo'
  | 'mcat';

type ExtendedTestScores = StudentProfile['testScores'] & {
  ieltsScores?: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
    testDate: string;
    documentId?: string;
  };
  toeflScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
  satScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
  actScore?: {
    composite: number;
    testDate: string;
    documentId?: string;
  };
  greScore?: {
    verbal: number;
    quantitative: number;
    analytical: number;
    testDate: string;
    documentId?: string;
  };
  gmatScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
  neetScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
  pteScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
  duolingoScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
  mcatScore?: {
    total: number;
    testDate: string;
    documentId?: string;
  };
};

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
    if (data.testScores?.actScore) tests.push('act');
    if (data.testScores?.greScore) tests.push('gre');
    if (data.testScores?.gmatScore) tests.push('gmat');
    if (data.testScores?.neetScore) tests.push('neet');
    if (data.testScores?.pteScore) tests.push('pte');
    if (data.testScores?.duolingoScore) tests.push('duolingo');
    if (data.testScores?.mcatScore) tests.push('mcat');
    return tests;
  });

  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(
    {}
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExtendedTestScores>({
    defaultValues: data.testScores || {
      partTimeWork: false,
    },
  });

  const handleFileUpload = async (file: File, testType: TestType) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [testType]: true }));

    try {
      const response = await documentService.uploadDocument(
        file,
        'test_score',
        undefined,
        (progress) => console.log(`${testType} upload progress:`, progress)
      );

      setUploadedFiles((prev) => ({
        ...prev,
        [testType]: response?.document?.id,
      }));
      setValue(`${testType}Score.documentId` as any, response?.document?.id);

      toast.success(
        `${testType.toUpperCase()} certificate uploaded successfully`
      );
    } catch (error) {
      toast.error(`Failed to upload ${testType.toUpperCase()} certificate`);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [testType]: false }));
    }
  };

  const onSubmit = (formData: ExtendedTestScores) => {
    const cleanedData: StudentProfile['testScores'] = {
      partTimeWork: formData.partTimeWork,
      backlogs: formData.backlogs,
      workExperience: formData.workExperience,
    };

    selectedTests.forEach((test) => {
      if (formData[`${test}Score`]) {
        cleanedData[`${test}Score`] = formData[`${test}Score`];
      }
    });

    onNext({ testScores: cleanedData });
  };

  const addTest = (test: TestType) => {
    if (!selectedTests.includes(test)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeTest = (test: TestType) => {
    setSelectedTests(selectedTests.filter((t) => t !== test));
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[test];
      return newFiles;
    });
  };

  const testOptions: {
    value: TestType;
    label: string;
    description: string;
    validity: string;
    scoreRange: string;
  }[] = [
    {
      value: 'ielts',
      label: 'IELTS',
      description: 'International English Language Testing System',
      validity: '2 years',
      scoreRange: '0-9 (per section and overall)',
    },
    {
      value: 'toefl',
      label: 'TOEFL iBT',
      description: 'Test of English as a Foreign Language',
      validity: '2 years',
      scoreRange: '0-120',
    },
    {
      value: 'sat',
      label: 'SAT',
      description: 'Scholastic Assessment Test',
      validity: '5 years',
      scoreRange: '400-1600',
    },
    {
      value: 'act',
      label: 'ACT',
      description: 'American College Testing',
      validity: '5 years',
      scoreRange: '1-36',
    },
    {
      value: 'gre',
      label: 'GRE',
      description: 'Graduate Record Examination',
      validity: '5 years',
      scoreRange: '130-170 (per section), 0-6 (analytical)',
    },
    {
      value: 'gmat',
      label: 'GMAT',
      description: 'Graduate Management Admission Test',
      validity: '5 years',
      scoreRange: '200-800',
    },
    {
      value: 'neet',
      label: 'NEET',
      description: 'National Eligibility cum Entrance Test',
      validity: '3 years (for some institutions)',
      scoreRange: '0-720',
    },
    {
      value: 'pte',
      label: 'PTE Academic',
      description: 'Pearson Test of English Academic',
      validity: '2 years',
      scoreRange: '10-90',
    },
    {
      value: 'duolingo',
      label: 'Duolingo English Test',
      description: 'Online English proficiency test',
      validity: '2 years',
      scoreRange: '10-160',
    },
    {
      value: 'mcat',
      label: 'MCAT',
      description: 'Medical College Admission Test',
      validity: '3 years',
      scoreRange: '472-528',
    },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          English Proficiency & Standardized Tests
        </h3>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
          <div className='flex'>
            <FiInfo className='h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0' />
            <p className='text-sm text-blue-800'>
              Add only the tests you have taken or plan to take. English
              proficiency tests are usually required for international
              applications. Upload official score reports for each test.
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
                    <p className='text-xs text-gray-500'>
                      Validity: {test.validity}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Score Range: {test.scoreRange}
                    </p>
                  </div>
                </button>
              )
          )}
        </div>
      </div>

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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <div>
                  <label className='label'>
                    Listening <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('ieltsScores.listening', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Listening score'),
                        range: validators.range(0, 9, 'Listening score'),
                      },
                    })}
                    type='number'
                    step='0.5'
                    className={`input ${
                      errors.ieltsScores?.listening ? 'input-error' : ''
                    }`}
                    placeholder='0-9'
                  />
                  {errors.ieltsScores?.listening && (
                    <p className='error-text'>
                      {errors.ieltsScores.listening.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Reading <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('ieltsScores.reading', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Reading score'),
                        range: validators.range(0, 9, 'Reading score'),
                      },
                    })}
                    type='number'
                    step='0.5'
                    className={`input ${
                      errors.ieltsScores?.reading ? 'input-error' : ''
                    }`}
                    placeholder='0-9'
                  />
                  {errors.ieltsScores?.reading && (
                    <p className='error-text'>
                      {errors.ieltsScores.reading.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Writing <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('ieltsScores.writing', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Writing score'),
                        range: validators.range(0, 9, 'Writing score'),
                      },
                    })}
                    type='number'
                    step='0.5'
                    className={`input ${
                      errors.ieltsScores?.writing ? 'input-error' : ''
                    }`}
                    placeholder='0-9'
                  />
                  {errors.ieltsScores?.writing && (
                    <p className='error-text'>
                      {errors.ieltsScores.writing.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Speaking <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('ieltsScores.speaking', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Speaking score'),
                        range: validators.range(0, 9, 'Speaking score'),
                      },
                    })}
                    type='number'
                    step='0.5'
                    className={`input ${
                      errors.ieltsScores?.speaking ? 'input-error' : ''
                    }`}
                    placeholder='0-9'
                  />
                  {errors.ieltsScores?.speaking && (
                    <p className='error-text'>
                      {errors.ieltsScores.speaking.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Overall Band <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('ieltsScores.total', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Overall band score'),
                        range: validators.range(0, 9, 'Overall band score'),
                      },
                    })}
                    type='number'
                    step='0.5'
                    className={`input ${
                      errors.ieltsScores?.total ? 'input-error' : ''
                    }`}
                    placeholder='0-9'
                  />
                  {errors.ieltsScores?.total && (
                    <p className='error-text'>
                      {errors.ieltsScores.total.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Test Date <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('ieltsScores.testDate', {
                      validate: validators.required('Test date'),
                    })}
                    type='date'
                    className={`input ${
                      errors.ieltsScores?.testDate ? 'input-error' : ''
                    }`}
                  />
                  {errors.ieltsScores?.testDate && (
                    <p className='error-text'>
                      {errors.ieltsScores.testDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='ieltsDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload IELTS Score Report
                  </label>
                  <input
                    id='ieltsDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'ielts');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['ielts'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['ielts'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official IELTS score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 2 years.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('toefl') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>TOEFL iBT Score</h4>
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
                <label className='label'>
                  Total Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('toeflScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('TOEFL score'),
                      range: validators.range(0, 120, 'TOEFL score'),
                    },
                  })}
                  type='number'
                  className={`input ${
                    errors.toeflScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='0-120'
                />
                {errors.toeflScore?.total && (
                  <p className='error-text'>
                    {errors.toeflScore.total.message}
                  </p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('toeflScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.toeflScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.toeflScore?.testDate && (
                  <p className='error-text'>
                    {errors.toeflScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='toeflDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload TOEFL Score Report
                  </label>
                  <input
                    id='toeflDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'toefl');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['toefl'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['toefl'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official TOEFL score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 2 years.
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Total Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('satScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('SAT score'),
                      range: validators.range(400, 1600, 'SAT score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.satScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='400-1600'
                />
                {errors.satScore?.total && (
                  <p className='error-text'>{errors.satScore.total.message}</p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('satScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.satScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.satScore?.testDate && (
                  <p className='error-text'>
                    {errors.satScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='satDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload SAT Score Report
                  </label>
                  <input
                    id='satDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'sat');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['sat'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['sat'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official SAT score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 5 years.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('act') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>ACT Score</h4>
              <button
                type='button'
                onClick={() => removeTest('act')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Composite Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('actScore.composite', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('ACT score'),
                      range: validators.range(1, 36, 'ACT score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.actScore?.composite ? 'input-error' : ''
                  }`}
                  placeholder='1-36'
                />
                {errors.actScore?.composite && (
                  <p className='error-text'>
                    {errors.actScore.composite.message}
                  </p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('actScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.actScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.actScore?.testDate && (
                  <p className='error-text'>
                    {errors.actScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='actDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload ACT Score Report
                  </label>
                  <input
                    id='actDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'act');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['act'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['act'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official ACT score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 5 years.
                </p>
              </div>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='label'>
                    Verbal <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('greScore.verbal', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Verbal score'),
                        range: validators.range(130, 170, 'Verbal score'),
                      },
                    })}
                    type='number'
                    className={`input ${
                      errors.greScore?.verbal ? 'input-error' : ''
                    }`}
                    placeholder='130-170'
                  />
                  {errors.greScore?.verbal && (
                    <p className='error-text'>
                      {errors.greScore.verbal.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Quantitative <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('greScore.quantitative', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required('Quantitative score'),
                        range: validators.range(130, 170, 'Quantitative score'),
                      },
                    })}
                    type='number'
                    className={`input ${
                      errors.greScore?.quantitative ? 'input-error' : ''
                    }`}
                    placeholder='130-170'
                  />
                  {errors.greScore?.quantitative && (
                    <p className='error-text'>
                      {errors.greScore.quantitative.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Analytical Writing <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('greScore.analytical', {
                      valueAsNumber: true,
                      validate: {
                        required: validators.required(
                          'Analytical Writing score'
                        ),
                        range: validators.range(
                          0,
                          6,
                          'Analytical Writing score'
                        ),
                      },
                    })}
                    type='number'
                    step='0.5'
                    className={`input ${
                      errors.greScore?.analytical ? 'input-error' : ''
                    }`}
                    placeholder='0-6'
                  />
                  {errors.greScore?.analytical && (
                    <p className='error-text'>
                      {errors.greScore.analytical.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='label'>
                    Test Date <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('greScore.testDate', {
                      validate: validators.required('Test date'),
                    })}
                    type='date'
                    className={`input ${
                      errors.greScore?.testDate ? 'input-error' : ''
                    }`}
                  />
                  {errors.greScore?.testDate && (
                    <p className='error-text'>
                      {errors.greScore.testDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='greDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload GRE Score Report
                  </label>
                  <input
                    id='greDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'gre');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['gre'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['gre'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official GRE score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 5 years.
                </p>
              </div>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Total Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('gmatScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('GMAT score'),
                      range: validators.range(200, 800, 'GMAT score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.gmatScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='200-800'
                />
                {errors.gmatScore?.total && (
                  <p className='error-text'>{errors.gmatScore.total.message}</p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('gmatScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.gmatScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.gmatScore?.testDate && (
                  <p className='error-text'>
                    {errors.gmatScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='gmatDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload GMAT Score Report
                  </label>
                  <input
                    id='gmatDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'gmat');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['gmat'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['gmat'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official GMAT score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 5 years.
                </p>
              </div>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('neetScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('NEET score'),
                      range: validators.range(0, 720, 'NEET score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.neetScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='0-720'
                />
                {errors.neetScore?.total && (
                  <p className='error-text'>{errors.neetScore.total.message}</p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('neetScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.neetScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.neetScore?.testDate && (
                  <p className='error-text'>
                    {errors.neetScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='neetDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload NEET Score Report
                  </label>
                  <input
                    id='neetDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'neet');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['neet'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['neet'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official NEET score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 3 years (some institutions).
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('pte') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>PTE Academic Score</h4>
              <button
                type='button'
                onClick={() => removeTest('pte')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Total Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('pteScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('PTE score'),
                      range: validators.range(10, 90, 'PTE score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.pteScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='10-90'
                />
                {errors.pteScore?.total && (
                  <p className='error-text'>{errors.pteScore.total.message}</p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('pteScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.pteScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.pteScore?.testDate && (
                  <p className='error-text'>
                    {errors.pteScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='pteDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload PTE Score Report
                  </label>
                  <input
                    id='pteDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'pte');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['pte'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['pte'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official PTE score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 2 years.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('duolingo') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>
                Duolingo English Test Score
              </h4>
              <button
                type='button'
                onClick={() => removeTest('duolingo')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Total Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('duolingoScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('Duolingo score'),
                      range: validators.range(10, 160, 'Duolingo score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.duolingoScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='10-160'
                />
                {errors.duolingoScore?.total && (
                  <p className='error-text'>
                    {errors.duolingoScore.total.message}
                  </p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('duolingoScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.duolingoScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.duolingoScore?.testDate && (
                  <p className='error-text'>
                    {errors.duolingoScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='duolingoDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload Duolingo Score Report
                  </label>
                  <input
                    id='duolingoDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'duolingo');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['duolingo'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['duolingo'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official Duolingo score report (PDF, JPG, PNG - Max
                  10MB). Valid for 2 years.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTests.includes('mcat') && (
          <div className='card bg-gray-50'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium text-gray-900'>MCAT Score</h4>
              <button
                type='button'
                onClick={() => removeTest('mcat')}
                className='text-gray-400 hover:text-red-600'
              >
                <FiX className='h-5 w-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>
                  Total Score <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('mcatScore.total', {
                    valueAsNumber: true,
                    validate: {
                      required: validators.required('MCAT score'),
                      range: validators.range(472, 528, 'MCAT score'),
                    },
                  })}
                  type='number'
                  className={`input max-w-xs ${
                    errors.mcatScore?.total ? 'input-error' : ''
                  }`}
                  placeholder='472-528'
                />
                {errors.mcatScore?.total && (
                  <p className='error-text'>{errors.mcatScore.total.message}</p>
                )}
                <label className='label mt-4'>
                  Test Date <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('mcatScore.testDate', {
                    validate: validators.required('Test date'),
                  })}
                  type='date'
                  className={`input ${
                    errors.mcatScore?.testDate ? 'input-error' : ''
                  }`}
                />
                {errors.mcatScore?.testDate && (
                  <p className='error-text'>
                    {errors.mcatScore.testDate.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='mcatDoc'
                    className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1' />
                    Upload MCAT Score Report
                  </label>
                  <input
                    id='mcatDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'mcat');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['mcat'] && (
                    <FiCheck className='text-green-600' />
                  )}
                  {uploadingFiles['mcat'] && <LoadingSpinner size='sm' />}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload official MCAT score report (PDF, JPG, PNG - Max 10MB).
                  Valid for 3 years.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* <div>
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
      </div> */}

      {/* <div>
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
      </div> */}

      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <h4 className='text-sm font-medium text-gray-900 mb-2'>
          Important Notes:
        </h4>
        <ul className='text-sm text-gray-700 space-y-1 list-disc list-inside'>
          <li>Ensure all test scores are from official test reports</li>
          <li>
            Check validity periods as some institutions may not accept expired
            scores
          </li>
          <li>
            Uploaded documents must be clear and legible (PDF, JPG, PNG - Max
            10MB)
          </li>
          <li>
            Documents in languages other than English must include certified
            translations
          </li>
        </ul>
      </div>

      <div className='flex justify-between'>
        <button type='button' onClick={onPrevious} className='btn btn-outline'>
          Previous
        </button>
        <button
          type='button'
          onClick={handleSubmit(onSubmit)}
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
    </div>
  );
};
