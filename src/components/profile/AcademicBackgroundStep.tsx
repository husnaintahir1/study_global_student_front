import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiInfo } from 'react-icons/fi';
import { COUNTRIES } from '@/utils/constants';

interface AcademicBackgroundStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: {
    educationalBackground: StudentProfile['educationalBackground'];
  }) => void;
  onPrevious: () => void;
  isSaving?: boolean;
}

export const AcademicBackgroundStep: React.FC<AcademicBackgroundStepProps> = ({
  data,
  onNext,
  onPrevious,
  isSaving,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfile['educationalBackground']>({
    defaultValues: data.educationalBackground || {
      additionalCertification: false,
    },
  });

  const studyLevel = watch('studyLevel');
  const additionalCertification = watch('additionalCertification');
  const hecApplied = watch('hecEquivalenceStatus.applied');

  const onSubmit = (formData: StudentProfile['educationalBackground']) => {
    // Clean up data based on study level
    const cleanedData = { ...formData };

    // Remove irrelevant fields based on study level
    if (studyLevel === 'bachelor') {
      delete cleanedData.bachelorDegree;
    } else if (studyLevel === 'master' || studyLevel === 'phd') {
      delete cleanedData.matriculation;
      delete cleanedData.intermediate;
    }

    // Remove diploma if no additional certification
    if (!additionalCertification) {
      delete cleanedData.diploma;
    }

    // Remove HEC date if not applied
    if (!hecApplied) {
      if (cleanedData.hecEquivalenceStatus) {
        delete cleanedData.hecEquivalenceStatus.obtainedDate;
      }
    }

    onNext({ educationalBackground: cleanedData });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const boards = [
    'Federal Board',
    'Punjab Board',
    'Sindh Board',
    'KPK Board',
    'Balochistan Board',
    'Cambridge',
    'Edexcel',
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
      'BS Mathematics',
      'BS Physics',
      'BS Chemistry',
      'BS Biology',
      'MBBS',
      'BDS',
      'B.Pharmacy',
      'BS Psychology',
      'BA English',
      'Other',
    ],
    master: [
      'MS Computer Science',
      'MS Software Engineering',
      'MS Data Science',
      'MBA',
      'MS Electrical Engineering',
      'MS Mechanical Engineering',
      'MS Mathematics',
      'MS Physics',
      'MA English',
      'MS Psychology',
      'Other',
    ],
    diploma: [
      'DAE (Electrical)',
      'DAE (Mechanical)',
      'DAE (Civil)',
      'DIT',
      'DBA',
      'Other',
    ],
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Study Level Selection */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Study Level & Admission Year
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='studyLevel' className='label'>
              What level are you applying for?{' '}
              <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('studyLevel', {
                validate: validators.required('Study level'),
              })}
              id='studyLevel'
              className={`input ${errors.studyLevel ? 'input-error' : ''}`}
            >
              <option value=''>Select study level</option>
              <option value='bachelor'>Bachelor's Degree</option>
              <option value='master'>Master's Degree</option>
              <option value='phd'>PhD</option>
              <option value='diploma'>Diploma</option>
            </select>
            {errors.studyLevel && (
              <p className='error-text'>{errors.studyLevel.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='admissionYear' className='label'>
              Intended Admission Year <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('admissionYear', {
                validate: validators.required('Admission year'),
                valueAsNumber: true,
              })}
              id='admissionYear'
              className={`input ${errors.admissionYear ? 'input-error' : ''}`}
            >
              <option value=''>Select year</option>
              {[currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.admissionYear && (
              <p className='error-text'>{errors.admissionYear.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Matriculation - Only for Bachelor's */}
      {studyLevel === 'bachelor' && (
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Matriculation/O-Levels
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label htmlFor='matricYear' className='label'>
                Completion Year <span className='text-red-500'>*</span>
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
                className={`input ${
                  errors.matriculation?.year ? 'input-error' : ''
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
                <p className='error-text'>
                  {errors.matriculation.year.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='matricBoard' className='label'>
                Board/System <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('matriculation.board', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Board')
                      : undefined,
                })}
                id='matricBoard'
                className={`input ${
                  errors.matriculation?.board ? 'input-error' : ''
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
                <p className='error-text'>
                  {errors.matriculation.board.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='matricScore' className='label'>
                Score/Percentage <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('matriculation.scorePercentage', {
                  validate:
                    studyLevel === 'bachelor'
                      ? {
                          required: validators.required('Score'),
                          min: validators.min(0, 'Score'),
                          max: validators.max(100, 'Score'),
                        }
                      : undefined,
                  valueAsNumber: true,
                })}
                type='number'
                step='0.01'
                id='matricScore'
                placeholder='e.g., 85.5'
                className={`input ${
                  errors.matriculation?.scorePercentage ? 'input-error' : ''
                }`}
              />
              {errors.matriculation?.scorePercentage && (
                <p className='error-text'>
                  {errors.matriculation.scorePercentage.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Intermediate - Only for Bachelor's */}
      {studyLevel === 'bachelor' && (
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Intermediate/A-Levels
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='interYear' className='label'>
                Completion Year <span className='text-red-500'>*</span>
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
                className={`input ${
                  errors.intermediate?.year ? 'input-error' : ''
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
                <p className='error-text'>{errors.intermediate.year.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='interBoard' className='label'>
                Board/System <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('intermediate.board', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Board')
                      : undefined,
                })}
                id='interBoard'
                className={`input ${
                  errors.intermediate?.board ? 'input-error' : ''
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
                <p className='error-text'>
                  {errors.intermediate.board.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='interScore' className='label'>
                Score/Percentage <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('intermediate.scorePercentage', {
                  validate:
                    studyLevel === 'bachelor'
                      ? {
                          required: validators.required('Score'),
                          min: validators.min(0, 'Score'),
                          max: validators.max(100, 'Score'),
                        }
                      : undefined,
                  valueAsNumber: true,
                })}
                type='number'
                step='0.01'
                id='interScore'
                placeholder='e.g., 85.5'
                className={`input ${
                  errors.intermediate?.scorePercentage ? 'input-error' : ''
                }`}
              />
              {errors.intermediate?.scorePercentage && (
                <p className='error-text'>
                  {errors.intermediate.scorePercentage.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='interProgram' className='label'>
                Program <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('intermediate.preEngineeringOrPreMedical', {
                  validate:
                    studyLevel === 'bachelor'
                      ? validators.required('Program')
                      : undefined,
                })}
                id='interProgram'
                className={`input ${
                  errors.intermediate?.preEngineeringOrPreMedical
                    ? 'input-error'
                    : ''
                }`}
              >
                <option value=''>Select program</option>
                <option value='pre-engineering'>Pre-Engineering</option>
                <option value='pre-medical'>Pre-Medical</option>
                <option value='other'>Other (ICS, Commerce, Arts)</option>
              </select>
              {errors.intermediate?.preEngineeringOrPreMedical && (
                <p className='error-text'>
                  {errors.intermediate.preEngineeringOrPreMedical.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bachelor's Degree - For Master's and PhD */}
      {(studyLevel === 'master' || studyLevel === 'phd') && (
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Bachelor's Degree
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='bachelorProgram' className='label'>
                Program Name <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('bachelorDegree.programName', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('Program name')
                      : undefined,
                })}
                id='bachelorProgram'
                className={`input ${
                  errors.bachelorDegree?.programName ? 'input-error' : ''
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
                <p className='error-text'>
                  {errors.bachelorDegree.programName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='bachelorSpecialization' className='label'>
                Specialization/Major
              </label>
              <input
                {...register('bachelorDegree.specialization')}
                type='text'
                id='bachelorSpecialization'
                className='input'
                placeholder='e.g., Artificial Intelligence'
              />
            </div>

            <div>
              <label htmlFor='bachelorInstitution' className='label'>
                Institution <span className='text-red-500'>*</span>
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
                className={`input ${
                  errors.bachelorDegree?.institution ? 'input-error' : ''
                }`}
              />
              {errors.bachelorDegree?.institution && (
                <p className='error-text'>
                  {errors.bachelorDegree.institution.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='bachelorCountry' className='label'>
                Country <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('bachelorDegree.country', {
                  validate:
                    studyLevel === 'master' || studyLevel === 'phd'
                      ? validators.required('Country')
                      : undefined,
                })}
                id='bachelorCountry'
                className={`input ${
                  errors.bachelorDegree?.country ? 'input-error' : ''
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
                <p className='error-text'>
                  {errors.bachelorDegree.country.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='bachelorStartDate' className='label'>
                Start Date <span className='text-red-500'>*</span>
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
                className={`input ${
                  errors.bachelorDegree?.startDate ? 'input-error' : ''
                }`}
              />
              {errors.bachelorDegree?.startDate && (
                <p className='error-text'>
                  {errors.bachelorDegree.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='bachelorEndDate' className='label'>
                End Date <span className='text-red-500'>*</span>
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
                className={`input ${
                  errors.bachelorDegree?.endDate ? 'input-error' : ''
                }`}
              />
              {errors.bachelorDegree?.endDate && (
                <p className='error-text'>
                  {errors.bachelorDegree.endDate.message}
                </p>
              )}
            </div>

            <div className='md:col-span-2'>
              <label htmlFor='bachelorCGPA' className='label'>
                CGPA/Percentage <span className='text-red-500'>*</span>
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
                className={`input ${
                  errors.bachelorDegree?.cgpaPercentage ? 'input-error' : ''
                }`}
                placeholder='e.g., 3.5/4.0 or 85%'
              />
              {errors.bachelorDegree?.cgpaPercentage && (
                <p className='error-text'>
                  {errors.bachelorDegree.cgpaPercentage.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Certification */}
      <div>
        <div className='flex items-center space-x-2 mb-4'>
          <input
            {...register('additionalCertification')}
            type='checkbox'
            id='additionalCert'
            className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
          />
          <label
            htmlFor='additionalCert'
            className='text-sm font-medium text-gray-700'
          >
            Do you have any additional certification or diploma?
          </label>
        </div>

        {additionalCertification && (
          <div className='mt-4 p-4 border rounded-lg bg-gray-50'>
            <h4 className='font-medium text-gray-900 mb-4'>
              Diploma/Certification Details
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='diplomaProgram' className='label'>
                  Program
                </label>
                <select
                  {...register('diploma.program')}
                  id='diplomaProgram'
                  className='input'
                >
                  <option value=''>Select program</option>
                  {programs.diploma.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor='diplomaSpecialization' className='label'>
                  Specialization
                </label>
                <input
                  {...register('diploma.specialization')}
                  type='text'
                  id='diplomaSpecialization'
                  className='input'
                />
              </div>

              <div>
                <label htmlFor='diplomaInstitution' className='label'>
                  Institution
                </label>
                <input
                  {...register('diploma.institution')}
                  type='text'
                  id='diplomaInstitution'
                  className='input'
                />
              </div>

              <div>
                <label htmlFor='diplomaCountry' className='label'>
                  Country
                </label>
                <select
                  {...register('diploma.country')}
                  id='diplomaCountry'
                  className='input'
                >
                  <option value=''>Select country</option>
                  <option value='Pakistan'>Pakistan</option>
                  {COUNTRIES.filter((c) => c !== 'Pakistan').map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor='diplomaStartDate' className='label'>
                  Start Date
                </label>
                <input
                  {...register('diploma.startDate')}
                  type='month'
                  id='diplomaStartDate'
                  className='input'
                />
              </div>

              <div>
                <label htmlFor='diplomaEndDate' className='label'>
                  End Date
                </label>
                <input
                  {...register('diploma.endDate')}
                  type='month'
                  id='diplomaEndDate'
                  className='input'
                />
              </div>

              <div>
                <label htmlFor='diplomaCGPA' className='label'>
                  CGPA/Percentage
                </label>
                <input
                  {...register('diploma.cgpaPercentage', {
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  id='diplomaCGPA'
                  className='input'
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HEC Equivalence - For foreign degrees */}
      {(studyLevel === 'master' || studyLevel === 'phd') && (
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            HEC Equivalence
          </h3>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
            <div className='flex'>
              <FiInfo className='h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0' />
              <p className='text-sm text-blue-800'>
                HEC equivalence is required if your bachelor's degree is from a
                foreign university.
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <input
                {...register('hecEquivalenceStatus.applied')}
                type='checkbox'
                id='hecApplied'
                className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
              />
              <label
                htmlFor='hecApplied'
                className='text-sm font-medium text-gray-700'
              >
                Have you applied for HEC equivalence?
              </label>
            </div>

            {hecApplied && (
              <div>
                <label htmlFor='hecDate' className='label'>
                  Equivalence Obtained Date
                </label>
                <input
                  {...register('hecEquivalenceStatus.obtainedDate')}
                  type='date'
                  id='hecDate'
                  className='input max-w-xs'
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Gap */}
      <div>
        <label htmlFor='educationalGap' className='label'>
          Educational Gap (if any)
        </label>
        <textarea
          {...register('educationalGap')}
          id='educationalGap'
          rows={3}
          className='input'
          placeholder='Please explain any gaps in your education...'
        />
        <p className='text-sm text-gray-500 mt-1'>
          If you have any gap years in your education, please explain the reason
          and what you did during that time.
        </p>
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
