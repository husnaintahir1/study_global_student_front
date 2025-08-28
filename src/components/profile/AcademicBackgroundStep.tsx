import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiInfo, FiUpload, FiCheck, FiPlus, FiTrash } from 'react-icons/fi';
import { COUNTRIES } from '@/utils/constants';
import { documentService } from '@/services/document.service';
import toast from 'react-hot-toast';

interface AcademicBackgroundStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: {
    educationalBackground: StudentProfile['educationalBackground'];
  }) => void;
  onPrevious: () => void;
  isSaving?: boolean;
}

type EducationalBackground = StudentProfile['educationalBackground'];

interface ExtendedAcademicBackground extends EducationalBackground {
  matriculation?: {
    year: number;
    board: string;
    gradingSystem: 'percentage' | 'grades';
    scorePercentage?: number;
    grades?: { subject: string; grade: string }[];
    institute?: string;
    subjects?: string;
    documentId?: string;
  };
  intermediate?: {
    year: number;
    board: string;
    gradingSystem: 'percentage' | 'grades';
    scorePercentage?: number;
    grades?: { subject: string; grade: string }[];
    preEngineeringOrPreMedical: 'pre-engineering' | 'pre-medical' | 'other';
    institute?: string;
    subjects?: string;
    documentId?: string;
  };
  bachelorDegree?: {
    programName: string;
    specialization: string;
    institution: string;
    country: string;
    startDate: string;
    endDate: string;
    cgpaPercentage: string;
    totalCreditHours?: number;
    transcriptId?: string;
    degreeId?: string;
  };
  masterDegree?: {
    programName: string;
    specialization: string;
    institution: string;
    country: string;
    startDate: string;
    endDate: string;
    cgpaPercentage: string;
    thesisTitle?: string;
    transcriptId?: string;
    degreeId?: string;
  };
  diploma?: {
    programName: string;
    institution: string;
    year: number;
    documentId?: string;
  };
  workExperience?: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
    documentId?: string;
  }[];
}

export const AcademicBackgroundStep: React.FC<AcademicBackgroundStepProps> = ({
  data,
  onNext,
  onPrevious,
  isSaving,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(
    {}
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExtendedAcademicBackground>({
    defaultValues: {
      ...data.educationalBackground,
      workExperience: data.educationalBackground?.workExperience || [
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          responsibilities: '',
        },
      ],
      additionalCertification: false,
      hecEquivalenceStatus: { applied: false },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workExperience',
  });

  const studyLevel = watch('studyLevel');
  const additionalCertification = watch('additionalCertification');
  const hecApplied = watch('hecEquivalenceStatus.applied');
  const matricGradingSystem = watch('matriculation.gradingSystem');
  const interGradingSystem = watch('intermediate.gradingSystem');

  const handleFileUpload = async (
    file: File,
    fieldName: string,
    documentType: string
  ) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const response = await documentService.uploadDocument(
        file,
        documentType,
        undefined,
        (progress) => console.log(`${fieldName} upload progress:`, progress)
      );

      setUploadedFiles((prev) => ({
        ...prev,
        [fieldName]: response?.document?.id,
      }));

      const pathParts = fieldName.split('.');
      if (pathParts.length > 1) {
        setValue(
          `${pathParts[0]}.${pathParts[1]}Id` as any,
          response?.document?.id
        );
      } else {
        setValue(`${fieldName}Id` as any, response?.document?.id);
      }

      toast.success(`${fieldName} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${fieldName}`);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const onSubmit = (formData: ExtendedAcademicBackground) => {
    const cleanedData = { ...formData };

    if (studyLevel === 'bachelor') {
      delete cleanedData.bachelorDegree;
      delete cleanedData.masterDegree;
      delete cleanedData.workExperience;
    } else if (studyLevel === 'master') {
      delete cleanedData.matriculation;
      delete cleanedData.intermediate;
      delete cleanedData.masterDegree;
    } else if (studyLevel === 'phd') {
      delete cleanedData.matriculation;
      delete cleanedData.intermediate;
    }

    if (!additionalCertification) {
      delete cleanedData.diploma;
    }

    if (!hecApplied && cleanedData.hecEquivalenceStatus) {
      delete cleanedData.hecEquivalenceStatus.obtainedDate;
    }

    onNext({ educationalBackground: cleanedData });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const boards = [
    'Federal Board (FBISE)',
    'Punjab Board (BISE)',
    'Sindh Board (BISE)',
    'KPK Board (BISE)',
    'Balochistan Board (BISE)',
    'Cambridge International (CIE)',
    'Edexcel/Pearson',
    'Aga Khan Board',
    'Other',
  ];

  const programs = {
    bachelor: [
      'BSc Computer Science',
      'BSc Software Engineering',
      'BSc Information Technology',
      'BBA',
      'BS Accounting & Finance',
      'BE Electrical Engineering',
      'BE Mechanical Engineering',
      'BE Civil Engineering',
      'BE Chemical Engineering',
      'BS Mathematics',
      'BS Physics',
      'BS Chemistry',
      'BS Biology',
      'BS Biotechnology',
      'MBBS',
      'BDS',
      'B.Pharmacy',
      'BS Psychology',
      'BA English',
      'BA Economics',
      'LLB',
      'Other',
    ],
    master: [
      'MS Computer Science',
      'MS Software Engineering',
      'MS Data Science',
      'MS Artificial Intelligence',
      'MBA',
      'MS Electrical Engineering',
      'MS Mechanical Engineering',
      'MS Civil Engineering',
      'MS Mathematics',
      'MS Physics',
      'MS Chemistry',
      'MS Biology',
      'MA English',
      'MS Psychology',
      'MPhil',
      'LLM',
      'Other',
    ],
    diploma: [
      'DAE (Electrical)',
      'DAE (Mechanical)',
      'DAE (Civil)',
      'DAE (Electronics)',
      'DIT',
      'DBA',
      'D.Pharmacy',
      'Other',
    ],
  };

  const grades = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'U'];

  return (
    <div className='space-y-8'>
      <div className='bg-yellow-50/80 backdrop-blur-md border border-yellow-200/50 rounded-2xl p-6 shadow-xl'>
        <div className='flex items-start gap-3'>
          <FiInfo className='h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-yellow-900 mb-2'>
              Document Attestation Required
            </h4>
            <p className='text-sm text-yellow-800'>
              All educational documents (transcripts, degrees, certificates)
              must be attested by:
              <br />• HEC (Higher Education Commission) for degree level
              documents
              <br />• IBCC (Inter Board Committee of Chairmen) for intermediate
              and matriculation
              <br />• MOFA (Ministry of Foreign Affairs) for final attestation
            </p>
          </div>
        </div>
      </div>

      <div className='bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-6 border-b border-gray-200/50 rounded-2xl'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Study Level & Admission Year
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='studyLevel'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              What level are you applying for?{' '}
              <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('studyLevel', {
                validate: validators.required('Study level'),
              })}
              id='studyLevel'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.studyLevel ? 'border-red-300' : ''
              }`}
            >
              <option value=''>Select study level</option>
              <option value='bachelor'>Bachelor's Degree</option>
              <option value='master'>Master's Degree</option>
              <option value='phd'>PhD</option>
              <option value='diploma'>Diploma</option>
            </select>
            {errors.studyLevel && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.studyLevel.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='admissionYear'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Intended Admission Year <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('admissionYear', {
                validate: validators.required('Admission year'),
                valueAsNumber: true,
              })}
              id='admissionYear'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.admissionYear ? 'border-red-300' : ''
              }`}
            >
              <option value=''>Select year</option>
              {[currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.admissionYear && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.admissionYear.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {studyLevel === 'bachelor' && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            Matriculation/O-Levels
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='matricYear'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Completion Year <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('matriculation.year', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Matriculation year')
                      : undefined,
                  valueAsNumber: true,
                })}
                id='matricYear'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.matriculation?.year ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.matriculation?.year && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.matriculation.year.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='matricBoard'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Board/System <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('matriculation.board', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Board')
                      : undefined,
                })}
                id='matricBoard'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.matriculation?.board ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select board</option>
                {boards.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
              {errors.matriculation?.board && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.matriculation.board.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='matricGradingSystem'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Grading System <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('matriculation.gradingSystem', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Grading system')
                      : undefined,
                })}
                id='matricGradingSystem'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.matriculation?.gradingSystem ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select grading system</option>
                <option value='percentage'>Percentage</option>
                <option value='grades'>Grades (A*, A, B, etc.)</option>
              </select>
              {errors.matriculation?.gradingSystem && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.matriculation.gradingSystem.message}
                </p>
              )}
            </div>

            {matricGradingSystem === 'percentage' && (
              <div>
                <label
                  htmlFor='matricScore'
                  className='block text-sm font-medium text-gray-900 mb-2'
                >
                  Percentage <span className='text-red-600'>*</span>
                </label>
                <input
                  {...register('matriculation.scorePercentage', {
                    validate:
                      studyLevel === 'bachelor' &&
                      matricGradingSystem === 'percentage'
                        ? {
                            required: validators.required('Percentage'),
                            min: validators.min(0, 'Percentage'),
                            max: validators.max(100, 'Percentage'),
                          }
                        : undefined,
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  id='matricScore'
                  placeholder='e.g., 85.5'
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                    errors.matriculation?.scorePercentage
                      ? 'border-red-300'
                      : ''
                  }`}
                />
                {errors.matriculation?.scorePercentage && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.matriculation.scorePercentage.message}
                  </p>
                )}
              </div>
            )}

            {matricGradingSystem === 'grades' && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-900 mb-2'>
                  Grades <span className='text-red-600'>*</span>
                </label>
                <div className='space-y-3'>
                  {['subject1', 'subject2', 'subject3'].map((_, index) => (
                    <div key={index} className='flex gap-4'>
                      <input
                        {...register(`matriculation.grades.${index}.subject`, {
                          validate:
                            matricGradingSystem === 'grades'
                              ? validators.required('Subject')
                              : undefined,
                        })}
                        placeholder='Subject'
                        className={`flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                          errors.matriculation?.grades?.[index]?.subject
                            ? 'border-red-300'
                            : ''
                        }`}
                      />
                      <select
                        {...register(`matriculation.grades.${index}.grade`, {
                          validate:
                            matricGradingSystem === 'grades'
                              ? validators.required('Grade')
                              : undefined,
                        })}
                        className={`w-24 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                          errors.matriculation?.grades?.[index]?.grade
                            ? 'border-red-300'
                            : ''
                        }`}
                      >
                        <option value=''>Grade</option>
                        {grades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor='matricRoll'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Institute Name
              </label>
              <input
                {...register('matriculation.institute')}
                type='text'
                id='matricRoll'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='Enter institute name'
              />
            </div>

            <div className='md:col-span-2'>
              <label
                htmlFor='matricSubjects'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Major Subjects
              </label>
              <input
                {...register('matriculation.subjects')}
                type='text'
                id='matricSubjects'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='e.g., Physics, Chemistry, Mathematics, Biology'
              />
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='matricDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Matriculation Certificate/Transcript
                </label>
                <input
                  id='matricDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(
                        file,
                        'matriculation.document',
                        'transcript'
                      );
                  }}
                  className='hidden'
                />
                {uploadedFiles['matriculation.document'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['matriculation.document'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Upload your matriculation certificate or detailed marks sheet
                (PDF, JPG, PNG - Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {studyLevel === 'bachelor' && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            Intermediate/A-Levels
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='interYear'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Completion Year <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('intermediate.year', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Intermediate year')
                      : undefined,
                  valueAsNumber: true,
                })}
                id='interYear'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.intermediate?.year ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.intermediate?.year && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.intermediate.year.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='interBoard'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Board/System <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('intermediate.board', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Board')
                      : undefined,
                })}
                id='interBoard'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.intermediate?.board ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select board</option>
                {boards.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
              {errors.intermediate?.board && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.intermediate.board.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='interGradingSystem'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Grading System <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('intermediate.gradingSystem', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Grading system')
                      : undefined,
                })}
                id='interGradingSystem'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.intermediate?.gradingSystem ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select grading system</option>
                <option value='percentage'>Percentage</option>
                <option value='grades'>Grades (A*, A, B, etc.)</option>
              </select>
              {errors.intermediate?.gradingSystem && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.intermediate.gradingSystem.message}
                </p>
              )}
            </div>

            {interGradingSystem === 'percentage' && (
              <div>
                <label
                  htmlFor='interScore'
                  className='block text-sm font-medium text-gray-900 mb-2'
                >
                  Percentage <span className='text-red-600'>*</span>
                </label>
                <input
                  {...register('intermediate.scorePercentage', {
                    validate:
                      studyLevel === 'bachelor' &&
                      interGradingSystem === 'percentage'
                        ? {
                            required: validators.required('Percentage'),
                            min: validators.min(0, 'Percentage'),
                            max: validators.max(100, 'Percentage'),
                          }
                        : undefined,
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  id='interScore'
                  placeholder='e.g., 85.5'
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                    errors.intermediate?.scorePercentage ? 'border-red-300' : ''
                  }`}
                />
                {errors.intermediate?.scorePercentage && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.intermediate.scorePercentage.message}
                  </p>
                )}
              </div>
            )}

            {interGradingSystem === 'grades' && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-900 mb-2'>
                  Grades <span className='text-red-600'>*</span>
                </label>
                <div className='space-y-3'>
                  {['subject1', 'subject2', 'subject3'].map((_, index) => (
                    <div key={index} className='flex gap-4'>
                      <input
                        {...register(`intermediate.grades.${index}.subject`, {
                          validate:
                            interGradingSystem === 'grades'
                              ? validators.required('Subject')
                              : undefined,
                        })}
                        placeholder='Subject'
                        className={`flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                          errors.intermediate?.grades?.[index]?.subject
                            ? 'border-red-300'
                            : ''
                        }`}
                      />
                      <select
                        {...register(`intermediate.grades.${index}.grade`, {
                          validate:
                            interGradingSystem === 'grades'
                              ? validators.required('Grade')
                              : undefined,
                        })}
                        className={`w-24 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                          errors.intermediate?.grades?.[index]?.grade
                            ? 'border-red-300'
                            : ''
                        }`}
                      >
                        <option value=''>Grade</option>
                        {grades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor='interProgram'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Program <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('intermediate.preEngineeringOrPreMedical', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Program')
                      : undefined,
                })}
                id='interProgram'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.intermediate?.preEngineeringOrPreMedical
                    ? 'border-red-300'
                    : ''
                }`}
              >
                <option value=''>Select program</option>
                <option value='pre-engineering'>Pre-Engineering</option>
                <option value='pre-medical'>Pre-Medical</option>
                <option value='other'>Other (ICS, Commerce, Arts)</option>
              </select>
              {errors.intermediate?.preEngineeringOrPreMedical && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.intermediate.preEngineeringOrPreMedical.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='interRoll'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Roll Number
              </label>
              <input
                {...register('intermediate.institute')}
                type='text'
                id='interRoll'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='Enter roll number'
              />
            </div>

            <div>
              <label
                htmlFor='interSubjects'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Major Subjects
              </label>
              <input
                {...register('intermediate.subjects')}
                type='text'
                id='interSubjects'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='e.g., Physics, Chemistry, Mathematics'
              />
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='interDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Intermediate Certificate/Transcript
                </label>
                <input
                  id='interDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(
                        file,
                        'intermediate.document',
                        'transcript'
                      );
                  }}
                  className='hidden'
                />
                {uploadedFiles['intermediate.document'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['intermediate.document'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Upload your intermediate certificate or detailed marks sheet
                (PDF, JPG, PNG - Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {(studyLevel === 'master' || studyLevel === 'phd') && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            Bachelor's Degree
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='bachelorProgram'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Program Name <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('bachelorDegree.programName', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('Program name')
                      : undefined,
                })}
                id='bachelorProgram'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.bachelorDegree?.programName ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select program</option>
                {programs.bachelor.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              {errors.bachelorDegree?.programName && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.bachelorDegree.programName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='bachelorSpecialization'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Specialization/Major
              </label>
              <input
                {...register('bachelorDegree.specialization')}
                type='text'
                id='bachelorSpecialization'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='e.g., Artificial Intelligence'
              />
            </div>

            <div>
              <label
                htmlFor='bachelorInstitution'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Institution <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('bachelorDegree.institution', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('Institution')
                      : undefined,
                })}
                type='text'
                id='bachelorInstitution'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.bachelorDegree?.institution ? 'border-red-300' : ''
                }`}
              />
              {errors.bachelorDegree?.institution && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.bachelorDegree.institution.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='bachelorCountry'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Country <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('bachelorDegree.country', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('Country')
                      : undefined,
                })}
                id='bachelorCountry'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.bachelorDegree?.country ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select country</option>
                <option value='Pakistan'>Pakistan</option>
                {COUNTRIES.filter((c) => c !== 'Pakistan').map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.bachelorDegree?.country && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.bachelorDegree.country.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='bachelorStartDate'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Start Date <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('bachelorDegree.startDate', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('Start date')
                      : undefined,
                })}
                type='month'
                id='bachelorStartDate'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.bachelorDegree?.startDate ? 'border-red-300' : ''
                }`}
              />
              {errors.bachelorDegree?.startDate && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.bachelorDegree.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='bachelorEndDate'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                End Date <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('bachelorDegree.endDate', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('End date')
                      : undefined,
                })}
                type='month'
                id='bachelorEndDate'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.bachelorDegree?.endDate ? 'border-red-300' : ''
                }`}
              />
              {errors.bachelorDegree?.endDate && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.bachelorDegree.endDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='bachelorCGPA'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                CGPA/Percentage <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('bachelorDegree.cgpaPercentage', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('CGPA/Percentage')
                      : undefined,
                })}
                type='text'
                id='bachelorCGPA'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.bachelorDegree?.cgpaPercentage ? 'border-red-300' : ''
                }`}
                placeholder='e.g., 3.5/4.0 or 85%'
              />
              {errors.bachelorDegree?.cgpaPercentage && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.bachelorDegree.cgpaPercentage.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='bachelorCredits'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Total Credit Hours
              </label>
              <input
                {...register('bachelorDegree.totalCreditHours', {
                  valueAsNumber: true,
                })}
                type='number'
                id='bachelorCredits'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='e.g., 136'
              />
            </div>

            <div className='md:col-span-2 space-y-3'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='bachelorTranscript'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Bachelor's Transcript
                </label>
                <input
                  id='bachelorTranscript'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(
                        file,
                        'bachelorDegree.transcript',
                        'transcript'
                      );
                  }}
                  className='hidden'
                />
                {uploadedFiles['bachelorDegree.transcript'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['bachelorDegree.transcript'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>

              <div className='flex items-center gap-4'>
                <label
                  htmlFor='bachelorDegree'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Bachelor's Degree
                </label>
                <input
                  id='bachelorDegree'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(file, 'bachelorDegree.degree', 'degree');
                  }}
                  className='hidden'
                />
                {uploadedFiles['bachelorDegree.degree'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['bachelorDegree.degree'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {studyLevel === 'phd' && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            Master's Degree
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='masterProgram'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Program Name <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('masterDegree.programName', {
                  validate:
                    studyLevel === 'phd'
                      ? validators.required('Program name')
                      : undefined,
                })}
                id='masterProgram'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.masterDegree?.programName ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select program</option>
                {programs.master.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              {errors.masterDegree?.programName && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.masterDegree.programName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='masterSpecialization'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Specialization
              </label>
              <input
                {...register('masterDegree.specialization')}
                type='text'
                id='masterSpecialization'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='e.g., Artificial Intelligence'
              />
            </div>

            <div>
              <label
                htmlFor='masterInstitution'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Institution <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('masterDegree.institution', {
                  validate:
                    studyLevel === 'phd'
                      ? validators.required('Institution')
                      : undefined,
                })}
                type='text'
                id='masterInstitution'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.masterDegree?.institution ? 'border-red-300' : ''
                }`}
              />
              {errors.masterDegree?.institution && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.masterDegree.institution.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='masterCountry'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Country <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('masterDegree.country', {
                  validate:
                    studyLevel === 'phd'
                      ? validators.required('Country')
                      : undefined,
                })}
                id='masterCountry'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.masterDegree?.country ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select country</option>
                <option value='Pakistan'>Pakistan</option>
                {COUNTRIES.filter((c) => c !== 'Pakistan').map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.masterDegree?.country && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.masterDegree.country.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='masterStartDate'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Start Date <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('masterDegree.startDate', {
                  validate:
                    studyLevel === 'phd'
                      ? validators.required('Start date')
                      : undefined,
                })}
                type='month'
                id='masterStartDate'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.masterDegree?.startDate ? 'border-red-300' : ''
                }`}
              />
              {errors.masterDegree?.startDate && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.masterDegree.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='masterEndDate'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                End Date <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('masterDegree.endDate', {
                  validate:
                    studyLevel === 'phd'
                      ? validators.required('End date')
                      : undefined,
                })}
                type='month'
                id='masterEndDate'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.masterDegree?.endDate ? 'border-red-300' : ''
                }`}
              />
              {errors.masterDegree?.endDate && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.masterDegree.endDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='masterCGPA'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                CGPA/Percentage <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('masterDegree.cgpaPercentage', {
                  validate:
                    studyLevel === 'phd'
                      ? validators.required('CGPA/Percentage')
                      : undefined,
                })}
                type='text'
                id='masterCGPA'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.masterDegree?.cgpaPercentage ? 'border-red-300' : ''
                }`}
                placeholder='e.g., 3.5/4.0 or 85%'
              />
              {errors.masterDegree?.cgpaPercentage && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.masterDegree.cgpaPercentage.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='masterThesis'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Thesis Title
              </label>
              <input
                {...register('masterDegree.thesisTitle')}
                type='text'
                id='masterThesis'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                placeholder='Enter thesis title'
              />
            </div>

            <div className='md:col-span-2 space-y-3'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='masterTranscript'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Master's Transcript
                </label>
                <input
                  id='masterTranscript'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(
                        file,
                        'masterDegree.transcript',
                        'transcript'
                      );
                  }}
                  className='hidden'
                />
                {uploadedFiles['masterDegree.transcript'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['masterDegree.transcript'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>

              <div className='flex items-center gap-4'>
                <label
                  htmlFor='masterDegree'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Master's Degree
                </label>
                <input
                  id='masterDegree'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(file, 'masterDegree.degree', 'degree');
                  }}
                  className='hidden'
                />
                {uploadedFiles['masterDegree.degree'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['masterDegree.degree'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Upload your master's transcript and degree (PDF, JPG, PNG - Max
                10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {studyLevel === 'master' && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            Work Experience
          </h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-6 mb-4 shadow-xl'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor={`workExperience.${index}.company`}
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Company Name <span className='text-red-600'>*</span>
                  </label>
                  <input
                    {...register(`workExperience.${index}.company`, {
                      validate:
                        studyLevel === 'master'
                          ? validators.required('Company name')
                          : undefined,
                    })}
                    id={`workExperience.${index}.company`}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                      errors.workExperience?.[index]?.company
                        ? 'border-red-300'
                        : ''
                    }`}
                    placeholder='e.g., Tech Solutions Ltd.'
                  />
                  {errors.workExperience?.[index]?.company && (
                    <p className='text-xs text-red-600 mt-1'>
                      {errors.workExperience[index].company.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`workExperience.${index}.position`}
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Position <span className='text-red-600'>*</span>
                  </label>
                  <input
                    {...register(`workExperience.${index}.position`, {
                      validate:
                        studyLevel === 'master'
                          ? validators.required('Position')
                          : undefined,
                    })}
                    id={`workExperience.${index}.position`}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                      errors.workExperience?.[index]?.position
                        ? 'border-red-300'
                        : ''
                    }`}
                    placeholder='e.g., Software Engineer'
                  />
                  {errors.workExperience?.[index]?.position && (
                    <p className='text-xs text-red-600 mt-1'>
                      {errors.workExperience[index].position.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`workExperience.${index}.startDate`}
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Start Date <span className='text-red-600'>*</span>
                  </label>
                  <input
                    {...register(`workExperience.${index}.startDate`, {
                      validate:
                        studyLevel === 'master'
                          ? validators.required('Start date')
                          : undefined,
                    })}
                    type='month'
                    id={`workExperience.${index}.startDate`}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                      errors.workExperience?.[index]?.startDate
                        ? 'border-red-300'
                        : ''
                    }`}
                  />
                  {errors.workExperience?.[index]?.startDate && (
                    <p className='text-xs text-red-600 mt-1'>
                      {errors.workExperience[index].startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`workExperience.${index}.endDate`}
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    End Date
                  </label>
                  <input
                    {...register(`workExperience.${index}.endDate`)}
                    type='month'
                    id={`workExperience.${index}.endDate`}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label
                    htmlFor={`workExperience.${index}.responsibilities`}
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Responsibilities
                  </label>
                  <textarea
                    {...register(`workExperience.${index}.responsibilities`)}
                    id={`workExperience.${index}.responsibilities`}
                    rows={3}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none'
                    placeholder='Describe your key responsibilities...'
                  />
                </div>

                <div className='md:col-span-2'>
                  <div className='flex items-center gap-4'>
                    <label
                      htmlFor={`workExperience.${index}.document`}
                      className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                    >
                      <FiUpload className='mr-1 h-5 w-5' />
                      Upload Experience Certificate
                    </label>
                    <input
                      id={`workExperience.${index}.document`}
                      type='file'
                      accept='.pdf,.jpg,.jpeg,.png'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          handleFileUpload(
                            file,
                            `workExperience.${index}.document`,
                            'experience_letter'
                          );
                      }}
                      className='hidden'
                    />
                    {uploadedFiles[`workExperience.${index}.document`] && (
                      <div className='p-2 bg-green-100 rounded-lg'>
                        <FiCheck className='h-5 w-5 text-green-600' />
                      </div>
                    )}
                    {uploadingFiles[`workExperience.${index}.document`] && (
                      <LoadingSpinner size='sm' />
                    )}
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Upload experience certificate (PDF, JPG, PNG - Max 10MB)
                  </p>
                </div>
              </div>

              {fields.length > 1 && (
                <button
                  type='button'
                  onClick={() => remove(index)}
                  className='mt-4 px-6 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors'
                >
                  <FiTrash className='mr-1 inline' />
                  Remove Experience
                </button>
              )}
            </div>
          ))}

          <button
            type='button'
            onClick={() =>
              append({
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                responsibilities: '',
              })
            }
            className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors mt-4 flex items-center'
          >
            <FiPlus className='mr-2 h-5 w-5' />
            Add Another Experience
          </button>
        </div>
      )}

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Additional Certifications
        </h3>
        <div className='flex items-center mb-4'>
          <input
            {...register('additionalCertification')}
            type='checkbox'
            id='additionalCertification'
            className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
          />
          <label
            htmlFor='additionalCertification'
            className='ml-2 block text-sm font-medium text-gray-900'
          >
            Do you have any additional certifications or diplomas?
          </label>
        </div>

        {additionalCertification && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='diplomaProgram'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Program Name <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('diploma.programName', {
                  validate: additionalCertification
                    ? validators.required('Program name')
                    : undefined,
                })}
                id='diplomaProgram'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.diploma?.programName ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select program</option>
                {programs.diploma.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              {errors.diploma?.programName && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.diploma.programName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='diplomaInstitution'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Institution <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('diploma.institution', {
                  validate: additionalCertification
                    ? validators.required('Institution')
                    : undefined,
                })}
                type='text'
                id='diplomaInstitution'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.diploma?.institution ? 'border-red-300' : ''
                }`}
              />
              {errors.diploma?.institution && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.diploma.institution.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='diplomaYear'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Completion Year <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('diploma.year', {
                  validate: additionalCertification
                    ? validators.required('Completion year')
                    : undefined,
                  valueAsNumber: true,
                })}
                id='diplomaYear'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.diploma?.year ? 'border-red-300' : ''
                }`}
              >
                <option value=''>Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.diploma?.year && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.diploma.year.message}
                </p>
              )}
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='diplomaDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Diploma/Certificate
                </label>
                <input
                  id='diplomaDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(file, 'diploma.document', 'certificate');
                  }}
                  className='hidden'
                />
                {uploadedFiles['diploma.document'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['diploma.document'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Upload your diploma/certificate (PDF, JPG, PNG - Max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          HEC Equivalence (For Foreign Degrees)
        </h3>
        <div className='flex items-center mb-4'>
          <input
            {...register('hecEquivalenceStatus.applied')}
            type='checkbox'
            id='hecApplied'
            className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
          />
          <label
            htmlFor='hecApplied'
            className='ml-2 block text-sm font-medium text-gray-900'
          >
            Have you applied for HEC equivalence for any foreign degree?
          </label>
        </div>

        {hecApplied && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='hecObtainedDate'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Equivalence Obtained Date{' '}
                <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('hecEquivalenceStatus.obtainedDate', {
                  validate: hecApplied
                    ? validators.required('Equivalence obtained date')
                    : undefined,
                })}
                type='month'
                id='hecObtainedDate'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.hecEquivalenceStatus?.obtainedDate
                    ? 'border-red-300'
                    : ''
                }`}
              />
              {errors.hecEquivalenceStatus?.obtainedDate && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.hecEquivalenceStatus.obtainedDate.message}
                </p>
              )}
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='hecDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload HEC Equivalence Certificate
                </label>
                <input
                  id='hecDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(
                        file,
                        'hecEquivalenceStatus.document',
                        'other'
                      );
                  }}
                  className='hidden'
                />
                {uploadedFiles['hecEquivalenceStatus.document'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['hecEquivalenceStatus.document'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Upload your HEC equivalence certificate (PDF, JPG, PNG - Max
                10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <label
          htmlFor='educationalGap'
          className='block text-sm font-medium text-gray-900 mb-2'
        >
          Educational Gap (if any)
        </label>
        <textarea
          {...register('educationalGap')}
          id='educationalGap'
          rows={3}
          className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none'
          placeholder='Please explain any gaps in your education (e.g., medical reasons, work experience, family circumstances)...'
        />
        <p className='text-sm text-gray-600 mt-1 max-w-2xl'>
          If you have any gap years in your education, please provide a detailed
          explanation.
        </p>
      </div>

      <div className='bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-6 shadow-xl'>
        <h4 className='text-lg font-medium text-gray-900 mb-2'>
          Important Notes:
        </h4>
        <ul className='text-sm text-gray-600 space-y-1 list-disc list-inside'>
          <li>All documents must be clear and legible</li>
          <li>Transcripts should show all semesters/years</li>
          <li>
            Documents in languages other than English must include certified
            translations
          </li>
          <li>
            You can upload documents now or later in the documents section
          </li>
        </ul>
      </div>

      <div className='flex justify-between mt-8'>
        <button
          type='button'
          onClick={onPrevious}
          className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors'
          disabled={isSubmitting || isSaving}
        >
          Previous
        </button>
        <button
          type='submit'
          className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105'
          disabled={isSubmitting || isSaving}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting || isSaving ? <LoadingSpinner size='sm' /> : 'Next'}
        </button>
      </div>
    </div>
  );
};
