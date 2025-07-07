import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiInfo, FiAlertCircle, FiUpload, FiCheck } from 'react-icons/fi';
import { documentService } from '@/services/document.service';
import toast from 'react-hot-toast';

interface FinancialInfoStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { financialInfo: StudentProfile['financialInfo'] }) => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isSaving?: boolean;
}

type ExtendedFinancialInfo = StudentProfile['financialInfo'] & {
  bankStatementDocId?: string;
  financialAffidavitDocId?: string;
  policeClearanceDocId?: string;
  medicalClearanceDocId?: string;
  domicileCertificateDocId?: string;
  nocDocId?: string;
};

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExtendedFinancialInfo>({
    defaultValues: {
      ...data.financialInfo,
      bankStatementsSubmitted:
        data.financialInfo?.bankStatementsSubmitted || false,
      financialAffidavit: data.financialInfo?.financialAffidavit || false,
      visaRejections: data.financialInfo?.visaRejections || false,
      policeClearanceCertificate:
        data.financialInfo?.policeClearanceCertificate || false,
      medicalClearance: data.financialInfo?.medicalClearance || false,
      domicileCertificateSubmitted:
        data.financialInfo?.domicileCertificateSubmitted || false,
      nocRequired: data.financialInfo?.nocRequired || false,
    },
  });

  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(
    {}
  );

  const fundingSource = watch('fundingSource');
  const visaRejections = watch('visaRejections');
  const medicalClearance = watch('medicalClearance');
  const bankStatementsSubmitted = watch('bankStatementsSubmitted');
  const financialAffidavit = watch('financialAffidavit');
  const policeClearanceCertificate = watch('policeClearanceCertificate');
  const domicileCertificateSubmitted = watch('domicileCertificateSubmitted');
  const nocRequired = watch('nocRequired');

  const handleFileUpload = async (file: File, docType: string) => {
    if (!file) return;

    const fileValidation = validators.fileSize(10)(file);
    if (fileValidation !== true) {
      toast.error(fileValidation);
      return;
    }

    const fileTypeValidation = validators.fileType([
      '.pdf',
      '.jpg',
      '.jpeg',
      '.png',
    ])(file);
    if (fileTypeValidation !== true) {
      toast.error(fileTypeValidation);
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [docType]: true }));

    try {
      const response = await documentService.uploadDocument(
        file,
        'other',
        undefined,
        (progress) => console.log(`${docType} upload progress:`, progress)
      );

      setUploadedFiles((prev) => ({
        ...prev,
        [docType]: response?.document?.id,
      }));
      setValue(docType as keyof ExtendedFinancialInfo, response?.document?.id);
      toast.success(
        `${docType
          .replace('DocId', '')
          .replace(/([A-Z])/g, ' $1')
          .trim()} uploaded successfully`
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        `Failed to upload ${docType
          .replace('DocId', '')
          .replace(/([A-Z])/g, ' $1')
          .trim()}`
      );
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const onSubmit = (formData: ExtendedFinancialInfo) => {
    const cleanedData: StudentProfile['financialInfo'] = {
      ...formData,
    };

    if (
      fundingSource !== 'Family Sponsor' &&
      fundingSource !== 'Third Party Sponsor'
    ) {
      delete cleanedData.sponsorDetails;
    }

    if (uploadedFiles['bankStatementDocId']) {
      cleanedData.bankStatementDocId = uploadedFiles['bankStatementDocId'];
    }
    if (uploadedFiles['financialAffidavitDocId']) {
      cleanedData.financialAffidavitDocId =
        uploadedFiles['financialAffidavitDocId'];
    }
    if (uploadedFiles['policeClearanceDocId']) {
      cleanedData.policeClearanceDocId = uploadedFiles['policeClearanceDocId'];
    }
    if (uploadedFiles['medicalClearanceDocId']) {
      cleanedData.medicalClearanceDocId =
        uploadedFiles['medicalClearanceDocId'];
    }
    if (uploadedFiles['domicileCertificateDocId']) {
      cleanedData.domicileCertificateDocId =
        uploadedFiles['domicileCertificateDocId'];
    }
    if (uploadedFiles['nocDocId']) {
      cleanedData.nocDocId = uploadedFiles['nocDocId'];
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
    <div className='space-y-8'>
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Financial Information
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='fundingSource'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Primary Source of Funding <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('fundingSource', {
                validate: validators.required('Funding source'),
              })}
              id='fundingSource'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.fundingSource ? 'border-red-300' : ''
              }`}
            >
              <option value=''>Select funding source</option>
              {fundingSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.fundingSource && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.fundingSource.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='budgetConstraints'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Annual Budget Range <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('budgetConstraints', {
                validate: validators.required('Budget range'),
              })}
              id='budgetConstraints'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.budgetConstraints ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.budgetConstraints.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {(fundingSource === 'Family Sponsor' ||
        fundingSource === 'Third Party Sponsor') && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            Sponsor Details
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='sponsorName'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Sponsor Name <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('sponsorDetails.sponsorName', {
                  validate: validators.required('Sponsor name'),
                })}
                type='text'
                id='sponsorName'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.sponsorDetails?.sponsorName ? 'border-red-300' : ''
                }`}
                placeholder='Full name'
              />
              {errors.sponsorDetails?.sponsorName && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.sponsorDetails.sponsorName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='sponsorRelation'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Relationship with Sponsor{' '}
                <span className='text-red-600'>*</span>
              </label>
              <select
                {...register('sponsorDetails.sponsorRelation', {
                  validate: validators.required('Sponsor relation'),
                })}
                id='sponsorRelation'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.sponsorDetails?.sponsorRelation ? 'border-red-300' : ''
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
                <p className='text-xs text-red-600 mt-1'>
                  {errors.sponsorDetails.sponsorRelation.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='sponsorCnic'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Sponsor CNIC/ID Number <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('sponsorDetails.sponsorCnic', {
                  validate: validators.required('Sponsor CNIC'),
                })}
                type='text'
                id='sponsorCnic'
                placeholder='XXXXX-XXXXXXX-X'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.sponsorDetails?.sponsorCnic ? 'border-red-300' : ''
                }`}
              />
              {errors.sponsorDetails?.sponsorCnic && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.sponsorDetails.sponsorCnic.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='sponsorIncome'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Sponsor Annual Income <span className='text-red-600'>*</span>
              </label>
              <input
                {...register('sponsorDetails.sponsorAnnualIncome', {
                  validate: validators.required('Sponsor income'),
                })}
                type='text'
                id='sponsorIncome'
                placeholder='e.g., PKR 2,400,000'
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.sponsorDetails?.sponsorAnnualIncome
                    ? 'border-red-300'
                    : ''
                }`}
              />
              {errors.sponsorDetails?.sponsorAnnualIncome && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.sponsorDetails.sponsorAnnualIncome.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Financial Documents
        </h3>
        <div className='space-y-6'>
          <div className='flex items-center space-x-3'>
            <input
              {...register('bankStatementsSubmitted')}
              type='checkbox'
              id='bankStatements'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <label
              htmlFor='bankStatements'
              className='text-sm font-medium text-gray-900'
            >
              Bank statements for last 6 months available
            </label>
          </div>
          {bankStatementsSubmitted && (
            <div className='ml-6 space-y-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='bankStatementDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Bank Statements
                </label>
                <input
                  id='bankStatementDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'bankStatementDocId');
                  }}
                  className='hidden'
                />
                {uploadedFiles['bankStatementDocId'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['bankStatementDocId'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500'>
                Upload bank statements for last 6 months (PDF, JPG, PNG - Max
                10MB)
              </p>
            </div>
          )}

          <div className='flex items-center space-x-3'>
            <input
              {...register('financialAffidavit')}
              type='checkbox'
              id='financialAffidavit'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <label
              htmlFor='financialAffidavit'
              className='text-sm font-medium text-gray-900'
            >
              Financial affidavit/sponsorship letter available
            </label>
          </div>
          {financialAffidavit && (
            <div className='ml-6 space-y-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='financialAffidavitDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Financial Affidavit
                </label>
                <input
                  id='financialAffidavitDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'financialAffidavitDocId');
                  }}
                  className='hidden'
                />
                {uploadedFiles['financialAffidavitDocId'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['financialAffidavitDocId'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500'>
                Upload financial affidavit/sponsorship letter (PDF, JPG, PNG -
                Max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Visa & Travel History
        </h3>
        <div className='space-y-6'>
          <div>
            <div className='flex items-center space-x-3 mb-3'>
              <input
                {...register('visaRejections')}
                type='checkbox'
                id='visaRejections'
                className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
              />
              <label
                htmlFor='visaRejections'
                className='text-sm font-medium text-gray-900'
              >
                I have previous visa rejections
              </label>
            </div>
            {visaRejections && (
              <div className='bg-yellow-50/80 backdrop-blur-md border border-yellow-200/50 rounded-2xl p-6 shadow-xl'>
                <div className='flex items-start gap-3'>
                  <FiAlertCircle className='h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0' />
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
            <label
              htmlFor='travelHistory'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              International Travel History{' '}
              <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('travelHistory', {
                validate: validators.required('Travel history'),
              })}
              id='travelHistory'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.travelHistory ? 'border-red-300' : ''
              }`}
            >
              <option value=''>Select travel history</option>
              {travelHistoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.travelHistory && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.travelHistory.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Legal & Medical Documents
        </h3>
        <div className='space-y-6'>
          <div className='flex items-center space-x-3'>
            <input
              {...register('policeClearanceCertificate')}
              type='checkbox'
              id='policeClearance'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <label
              htmlFor='policeClearance'
              className='text-sm font-medium text-gray-900'
            >
              Police clearance certificate available
            </label>
          </div>
          {policeClearanceCertificate && (
            <div className='ml-6 space-y-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='policeClearanceDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Police Clearance Certificate
                </label>
                <input
                  id='policeClearanceDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'policeClearanceDocId');
                  }}
                  className='hidden'
                />
                {uploadedFiles['policeClearanceDocId'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['policeClearanceDocId'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500'>
                Upload police clearance certificate (PDF, JPG, PNG - Max 10MB)
              </p>
            </div>
          )}

          <div className='flex items-center space-x-3'>
            <input
              {...register('medicalClearance')}
              type='checkbox'
              id='medicalClearance'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <label
              htmlFor='medicalClearance'
              className='text-sm font-medium text-gray-900'
            >
              Medical examination completed
            </label>
          </div>
          {medicalClearance && (
            <div className='ml-6 space-y-4'>
              <div>
                <label
                  htmlFor='medicalConditions'
                  className='block text-sm font-medium text-gray-900 mb-2'
                >
                  Medical Conditions (if any)
                </label>
                <textarea
                  {...register('medicalConditions')}
                  id='medicalConditions'
                  rows={3}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none'
                  placeholder='Please mention any medical conditions that might affect your studies...'
                />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-4'>
                  <label
                    htmlFor='medicalClearanceDoc'
                    className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                  >
                    <FiUpload className='mr-1 h-5 w-5' />
                    Upload Medical Clearance Certificate
                  </label>
                  <input
                    id='medicalClearanceDoc'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'medicalClearanceDocId');
                    }}
                    className='hidden'
                  />
                  {uploadedFiles['medicalClearanceDocId'] && (
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <FiCheck className='h-5 w-5 text-green-600' />
                    </div>
                  )}
                  {uploadingFiles['medicalClearanceDocId'] && (
                    <LoadingSpinner size='sm' />
                  )}
                </div>
                <p className='text-xs text-gray-500'>
                  Upload medical clearance certificate (PDF, JPG, PNG - Max
                  10MB)
                </p>
              </div>
            </div>
          )}

          <div className='flex items-center space-x-3'>
            <input
              {...register('domicileCertificateSubmitted')}
              type='checkbox'
              id='domicile'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <label
              htmlFor='domicile'
              className='text-sm font-medium text-gray-900'
            >
              Domicile certificate available
            </label>
          </div>
          {domicileCertificateSubmitted && (
            <div className='ml-6 space-y-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='domicileCertificateDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload Domicile Certificate
                </label>
                <input
                  id='domicileCertificateDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleFileUpload(file, 'domicileCertificateDocId');
                  }}
                  className='hidden'
                />
                {uploadedFiles['domicileCertificateDocId'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['domicileCertificateDocId'] && (
                  <LoadingSpinner size='sm' />
                )}
              </div>
              <p className='text-xs text-gray-500'>
                Upload domicile certificate (PDF, JPG, PNG - Max 10MB)
              </p>
            </div>
          )}

          <div className='flex items-center space-x-3'>
            <input
              {...register('nocRequired')}
              type='checkbox'
              id='noc'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <label htmlFor='noc' className='text-sm font-medium text-gray-900'>
              NOC required from current employer/institution
            </label>
          </div>
          {nocRequired && (
            <div className='ml-6 space-y-2'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='nocDoc'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
                  Upload No Objection Certificate
                </label>
                <input
                  id='nocDoc'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'nocDocId');
                  }}
                  className='hidden'
                />
                {uploadedFiles['nocDocId'] && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles['nocDocId'] && <LoadingSpinner size='sm' />}
              </div>
              <p className='text-xs text-gray-500'>
                Upload NOC from employer/institution (PDF, JPG, PNG - Max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <label
          htmlFor='additionalInfo'
          className='block text-sm font-medium text-gray-900 mb-2'
        >
          Additional Information
        </label>
        <textarea
          {...register('additionalInfo')}
          id='additionalInfo'
          rows={4}
          className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none'
          placeholder='Please provide any additional information relevant to your application, including visa rejection details if applicable...'
        />
        <p className='text-sm text-gray-600 mt-1'>
          Include any special circumstances, visa rejection details, or other
          important information
        </p>
      </div>

      <div className='bg-blue-50/80 backdrop-blur-md border border-blue-200/50 rounded-2xl p-6 shadow-xl'>
        <div className='flex items-start gap-3'>
          <FiInfo className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-blue-900 mb-2'>
              Document Requirements & Privacy
            </h4>
            <p className='text-sm text-blue-700'>
              All uploaded documents must be clear, legible, and in PDF, JPG, or
              PNG format (max 10MB). Documents in languages other than English
              require certified translations. All financial and personal
              information is kept strictly confidential and used solely for your
              study abroad application, in compliance with data protection
              regulations.
            </p>
          </div>
        </div>
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
          type='button'
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isSaving}
          className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center'
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
    </div>
  );
};
