import React from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiInfo, FiAlertCircle } from 'react-icons/fi';

interface FinancialInfoStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { financialInfo: StudentProfile['financialInfo'] }) => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isSaving?: boolean;
}

export const FinancialInfoStep: React.FC<FinancialInfoStepProps> = ({
  data,
  onNext,
  onPrevious,
  isLastStep,
  isSaving,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfile['financialInfo']>({
    defaultValues: data.financialInfo || {
      bankStatementsSubmitted: false,
      financialAffidavit: false,
      visaRejections: false,
      policeClearanceCertificate: false,
      medicalClearance: false,
      domicileCertificateSubmitted: false,
      nocRequired: false,
    },
  });

  const fundingSource = watch('fundingSource');
  const visaRejections = watch('visaRejections');
  const medicalClearance = watch('medicalClearance');

  const onSubmit = (formData: StudentProfile['financialInfo']) => {
    // Clean up sponsor details if funding source is not sponsor-based
    const cleanedData = { ...formData };
    if (
      fundingSource !== 'Family Sponsor' &&
      fundingSource !== 'Third Party Sponsor'
    ) {
      delete cleanedData.sponsorDetails;
    }

    onNext({ financialInfo: cleanedData });
  };

  const fundingSources = [
    'Self Funded',
    'Family Sponsor',
    'Third Party Sponsor',
    'Scholarship',
    'Government Funding',
    'Educational Loan',
    'Employer Sponsorship',
    'Other',
  ];

  const sponsorRelations = [
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Uncle',
    'Aunt',
    'Spouse',
    'Guardian',
    'Employer',
    'Other',
  ];

  const budgetRanges = [
    'Less than $10,000',
    '$10,000 - $20,000',
    '$20,000 - $30,000',
    '$30,000 - $50,000',
    '$50,000 - $70,000',
    'Above $70,000',
  ];

  const travelHistoryOptions = [
    'No international travel',
    'Tourist/Visit visa only',
    'Student visa to other countries',
    'Work visa experience',
    'Multiple visa types',
    'Extensive travel history',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Financial Information */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Financial Information
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='fundingSource' className='label'>
              Primary Source of Funding <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('fundingSource', {
                validate: validators.required('Funding source'),
              })}
              id='fundingSource'
              className={`input ${errors.fundingSource ? 'input-error' : ''}`}
            >
              <option value=''>Select funding source</option>
              {fundingSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.fundingSource && (
              <p className='error-text'>{errors.fundingSource.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='budgetConstraints' className='label'>
              Annual Budget Range <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('budgetConstraints', {
                validate: validators.required('Budget range'),
              })}
              id='budgetConstraints'
              className={`input ${
                errors.budgetConstraints ? 'input-error' : ''
              }`}
            >
              <option value=''>Select budget range</option>
              {budgetRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            {errors.budgetConstraints && (
              <p className='error-text'>{errors.budgetConstraints.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sponsor Details - Conditional */}
      {(fundingSource === 'Family Sponsor' ||
        fundingSource === 'Third Party Sponsor') && (
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Sponsor Details
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='sponsorName' className='label'>
                Sponsor Name <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('sponsorDetails.sponsorName', {
                  validate:
                    fundingSource === 'Family Sponsor' ||
                    fundingSource === 'Third Party Sponsor'
                      ? validators.required('Sponsor name')
                      : undefined,
                })}
                type='text'
                id='sponsorName'
                className={`input ${
                  errors.sponsorDetails?.sponsorName ? 'input-error' : ''
                }`}
              />
              {errors.sponsorDetails?.sponsorName && (
                <p className='error-text'>
                  {errors.sponsorDetails.sponsorName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='sponsorRelation' className='label'>
                Relationship with Sponsor{' '}
                <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('sponsorDetails.sponsorRelation', {
                  validate:
                    fundingSource === 'Family Sponsor' ||
                    fundingSource === 'Third Party Sponsor'
                      ? validators.required('Sponsor relation')
                      : undefined,
                })}
                id='sponsorRelation'
                className={`input ${
                  errors.sponsorDetails?.sponsorRelation ? 'input-error' : ''
                }`}
              >
                <option value=''>Select relationship</option>
                {sponsorRelations.map((relation) => (
                  <option key={relation} value={relation}>
                    {relation}
                  </option>
                ))}
              </select>
              {errors.sponsorDetails?.sponsorRelation && (
                <p className='error-text'>
                  {errors.sponsorDetails.sponsorRelation.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='sponsorCnic' className='label'>
                Sponsor CNIC/ID Number <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('sponsorDetails.sponsorCnic', {
                  validate:
                    fundingSource === 'Family Sponsor' ||
                    fundingSource === 'Third Party Sponsor'
                      ? validators.required('Sponsor CNIC')
                      : undefined,
                })}
                type='text'
                id='sponsorCnic'
                placeholder='XXXXX-XXXXXXX-X'
                className={`input ${
                  errors.sponsorDetails?.sponsorCnic ? 'input-error' : ''
                }`}
              />
              {errors.sponsorDetails?.sponsorCnic && (
                <p className='error-text'>
                  {errors.sponsorDetails.sponsorCnic.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='sponsorIncome' className='label'>
                Sponsor Annual Income <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('sponsorDetails.sponsorAnnualIncome', {
                  validate:
                    fundingSource === 'Family Sponsor' ||
                    fundingSource === 'Third Party Sponsor'
                      ? validators.required('Sponsor income')
                      : undefined,
                })}
                type='text'
                id='sponsorIncome'
                placeholder='e.g., PKR 2,400,000'
                className={`input ${
                  errors.sponsorDetails?.sponsorAnnualIncome
                    ? 'input-error'
                    : ''
                }`}
              />
              {errors.sponsorDetails?.sponsorAnnualIncome && (
                <p className='error-text'>
                  {errors.sponsorDetails.sponsorAnnualIncome.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Financial Documents */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Financial Documents
        </h3>
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <input
              {...register('bankStatementsSubmitted')}
              type='checkbox'
              id='bankStatements'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='bankStatements'
              className='text-sm font-medium text-gray-700'
            >
              Bank statements for last 6 months available
            </label>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              {...register('financialAffidavit')}
              type='checkbox'
              id='financialAffidavit'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='financialAffidavit'
              className='text-sm font-medium text-gray-700'
            >
              Financial affidavit/sponsorship letter available
            </label>
          </div>
        </div>
      </div>

      {/* Visa & Travel History */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Visa & Travel History
        </h3>
        <div className='space-y-4'>
          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <input
                {...register('visaRejections')}
                type='checkbox'
                id='visaRejections'
                className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
              />
              <label
                htmlFor='visaRejections'
                className='text-sm font-medium text-gray-700'
              >
                I have previous visa rejections
              </label>
            </div>

            {visaRejections && (
              <div className='ml-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='flex'>
                  <FiAlertCircle className='h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0' />
                  <p className='text-sm text-yellow-800'>
                    Please provide details about visa rejections in the
                    additional information section below. Include country, visa
                    type, and year of rejection.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor='travelHistory' className='label'>
              International Travel History{' '}
              <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('travelHistory', {
                validate: validators.required('Travel history'),
              })}
              id='travelHistory'
              className={`input ${errors.travelHistory ? 'input-error' : ''}`}
            >
              <option value=''>Select travel history</option>
              {travelHistoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.travelHistory && (
              <p className='error-text'>{errors.travelHistory.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Legal & Medical Documents */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Legal & Medical Documents
        </h3>
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <input
              {...register('policeClearanceCertificate')}
              type='checkbox'
              id='policeClearance'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='policeClearance'
              className='text-sm font-medium text-gray-700'
            >
              Police clearance certificate available
            </label>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              {...register('medicalClearance')}
              type='checkbox'
              id='medicalClearance'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='medicalClearance'
              className='text-sm font-medium text-gray-700'
            >
              Medical examination completed
            </label>
          </div>

          {medicalClearance && (
            <div className='ml-6'>
              <label htmlFor='medicalConditions' className='label'>
                Medical Conditions (if any)
              </label>
              <textarea
                {...register('medicalConditions')}
                id='medicalConditions'
                rows={2}
                className='input'
                placeholder='Please mention any medical conditions that might affect your studies...'
              />
            </div>
          )}

          <div className='flex items-center space-x-2'>
            <input
              {...register('domicileCertificateSubmitted')}
              type='checkbox'
              id='domicile'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='domicile'
              className='text-sm font-medium text-gray-700'
            >
              Domicile certificate available
            </label>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              {...register('nocRequired')}
              type='checkbox'
              id='noc'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label htmlFor='noc' className='text-sm font-medium text-gray-700'>
              NOC required from current employer/institution
            </label>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label htmlFor='additionalInfo' className='label'>
          Additional Information
        </label>
        <textarea
          {...register('additionalInfo')}
          id='additionalInfo'
          rows={4}
          className='input'
          placeholder='Please provide any additional information relevant to your application, including visa rejection details if applicable...'
        />
        <p className='text-sm text-gray-600 mt-1'>
          Include any special circumstances, visa rejection details, or other
          important information
        </p>
      </div>

      {/* Privacy Notice */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex'>
          <FiInfo className='h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-blue-900 mb-1'>
              Privacy & Confidentiality
            </h4>
            <p className='text-sm text-blue-700'>
              All financial and personal information provided is kept strictly
              confidential and will only be used for your study abroad
              application process. We comply with all data protection
              regulations.
            </p>
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
          ) : isLastStep ? (
            'Complete Profile'
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </form>
  );
};
