import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { COUNTRIES } from '@/utils/constants';
import { FiUpload, FiX, FiCheck, FiInfo, FiCamera } from 'react-icons/fi';
import { documentService } from '@/services/document.service';
import toast from 'react-hot-toast';

interface PersonalInfoStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { personalDetails: StudentProfile['personalInfo'] }) => void;
  onPrevious: () => void;
  isSaving?: boolean;
}

type ExtendedPersonalInfo = StudentProfile['personalInfo'] & {
  profilePicture?: string;
  religion?: string;
  sect?: string;
  ethnicity?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
};

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onNext,
  isSaving,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(
    {}
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExtendedPersonalInfo>({
    defaultValues: data.personalInfo || {
      fullName: { firstName: '', lastName: '' },
      permanentAddress: {},
      emergencyContact: {},
      passportDetails: {},
      socialLinks: {},
    },
  });

  const handleFileUpload = async (
    file: File,
    fieldName: string,
    documentType: string
  ) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingFiles({ ...uploadingFiles, [fieldName]: true });

    try {
      const response = await documentService.uploadDocument(
        file,
        documentType as any,
        undefined,
        (progress) => console.log(`${fieldName} upload progress:`, progress)
      );

      setUploadedFiles({
        ...uploadedFiles,
        [fieldName]: response?.document?.id,
      });
      toast.success(`${fieldName} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${fieldName}`);
    } finally {
      setUploadingFiles({ ...uploadingFiles, [fieldName]: false });
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleFileUpload(file, 'profilePicture', 'photo');
  };

  const onSubmit = (formData: ExtendedPersonalInfo) => {
    onNext({
      personalInfo: {
        ...formData,
        uploadedDocuments: uploadedFiles,
      } as any,
    });
  };

  const pakistanProvinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Gilgit-Baltistan',
    'Azad Kashmir',
    'Islamabad Capital Territory',
  ];

  const relationships = [
    'Parent',
    'Sibling',
    'Spouse',
    'Guardian',
    'Friend',
    'Relative',
    'Other',
  ];

  const religions = [
    'Islam',
    'Christianity',
    'Hinduism',
    'Sikhism',
    'Buddhism',
    'Other',
  ];

  const ethnicities = [
    'Punjabi',
    'Pashtun',
    'Sindhi',
    'Baloch',
    'Muhajir',
    'Kashmiri',
    'Saraiki',
    'Other',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Document Disclaimer */}
      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
        <div className='flex'>
          <FiInfo className='h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-amber-900 mb-1'>
              Important Document Notice
            </h4>
            <p className='text-sm text-amber-700'>
              Please note that certain documents (educational certificates,
              transcripts, etc.) require attestation from MOFA (Ministry of
              Foreign Affairs) for international applications. You can upload
              documents now or later in the documents section.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Picture */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Profile Picture
        </h3>
        <div className='flex items-center space-x-6'>
          <div className='relative'>
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt='Profile'
                className='h-24 w-24 rounded-full object-cover'
              />
            ) : (
              <div className='h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center'>
                <FiCamera className='h-8 w-8 text-gray-400' />
              </div>
            )}
            {uploadingFiles.profilePicture && (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full'>
                <LoadingSpinner size='sm' />
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor='profilePicture'
              className='btn btn-outline cursor-pointer'
            >
              <FiUpload className='mr-2' />
              Upload Photo
            </label>
            <input
              id='profilePicture'
              type='file'
              accept='image/*'
              onChange={handleProfilePictureChange}
              className='hidden'
            />
            <p className='text-sm text-gray-500 mt-2'>
              JPG, PNG up to 5MB. Passport size photo recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Basic Information
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='firstName' className='label'>
              First Name <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('fullName.firstName', {
                validate: validators.required('First name'),
              })}
              type='text'
              id='firstName'
              className={`input ${
                errors.fullName?.firstName ? 'input-error' : ''
              }`}
            />
            {errors.fullName?.firstName && (
              <p className='error-text'>{errors.fullName.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='lastName' className='label'>
              Last Name <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('fullName.lastName', {
                validate: validators.required('Last name'),
              })}
              type='text'
              id='lastName'
              className={`input ${
                errors.fullName?.lastName ? 'input-error' : ''
              }`}
            />
            {errors.fullName?.lastName && (
              <p className='error-text'>{errors.fullName.lastName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='fatherName' className='label'>
              Father's Name <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('fatherName', {
                validate: validators.required("Father's name"),
              })}
              type='text'
              id='fatherName'
              className={`input ${errors.fatherName ? 'input-error' : ''}`}
            />
            {errors.fatherName && (
              <p className='error-text'>{errors.fatherName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='dateOfBirth' className='label'>
              Date of Birth <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('dateOfBirth', {
                validate: {
                  required: validators.required('Date of birth'),
                  pastDate: validators.pastDate('Date of birth'),
                },
              })}
              type='date'
              id='dateOfBirth'
              className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
            />
            {errors.dateOfBirth && (
              <p className='error-text'>{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='gender' className='label'>
              Gender <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('gender', {
                validate: validators.required('Gender'),
              })}
              id='gender'
              className={`input ${errors.gender ? 'input-error' : ''}`}
            >
              <option value=''>Select gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>
            {errors.gender && (
              <p className='error-text'>{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='religion' className='label'>
              Religion
            </label>
            <select
              {...register('religion' as any)}
              id='religion'
              className='input'
            >
              <option value=''>Select religion</option>
              {religions.map((religion) => (
                <option key={religion} value={religion}>
                  {religion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='sect' className='label'>
              Sect (if applicable)
            </label>
            <input
              {...register('sect' as any)}
              type='text'
              id='sect'
              className='input'
              placeholder='e.g., Sunni, Shia, etc.'
            />
          </div>

          <div>
            <label htmlFor='ethnicity' className='label'>
              Ethnicity
            </label>
            <select
              {...register('ethnicity' as any)}
              id='ethnicity'
              className='input'
            >
              <option value=''>Select ethnicity</option>
              {ethnicities.map((ethnicity) => (
                <option key={ethnicity} value={ethnicity}>
                  {ethnicity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='cnicNumber' className='label'>
              CNIC Number <span className='text-red-500'>*</span>
            </label>
            <div className='space-y-2'>
              <input
                {...register('cnicNumber', {
                  validate: validators.required('CNIC number'),
                  pattern: {
                    value: /^\d{5}-\d{7}-\d{1}$/,
                    message: 'Invalid CNIC format (XXXXX-XXXXXXX-X)',
                  },
                })}
                type='text'
                id='cnicNumber'
                placeholder='XXXXX-XXXXXXX-X'
                className={`input ${errors.cnicNumber ? 'input-error' : ''}`}
              />
              {errors.cnicNumber && (
                <p className='error-text'>{errors.cnicNumber.message}</p>
              )}

              <div className='flex items-center gap-2'>
                <label
                  htmlFor='cnicFile'
                  className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1' />
                  Upload CNIC Copy
                </label>
                <input
                  id='cnicFile'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'cnic', 'cnic');
                  }}
                  className='hidden'
                />
                {uploadedFiles.cnic && <FiCheck className='text-green-600' />}
                {uploadingFiles.cnic && <LoadingSpinner size='sm' />}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor='phone' className='label'>
              Phone Number <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('phone', {
                validate: {
                  required: validators.required('Phone number'),
                  phone: validators.phone,
                },
              })}
              type='tel'
              id='phone'
              placeholder='+92 XXX XXXXXXX'
              className={`input ${errors.phone ? 'input-error' : ''}`}
            />
            {errors.phone && (
              <p className='error-text'>{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='email' className='label'>
              Email Address <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('email', { validate: validators.email })}
              type='email'
              id='email'
              className={`input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <p className='error-text'>{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Social Media Links (Optional)
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label htmlFor='linkedin' className='label'>
              LinkedIn
            </label>
            <input
              {...register('socialLinks.linkedin' as any)}
              type='url'
              id='linkedin'
              className='input'
              placeholder='https://linkedin.com/in/...'
            />
          </div>

          <div>
            <label htmlFor='facebook' className='label'>
              Facebook
            </label>
            <input
              {...register('socialLinks.facebook' as any)}
              type='url'
              id='facebook'
              className='input'
              placeholder='https://facebook.com/...'
            />
          </div>

          <div>
            <label htmlFor='instagram' className='label'>
              Instagram
            </label>
            <input
              {...register('socialLinks.instagram' as any)}
              type='url'
              id='instagram'
              className='input'
              placeholder='https://instagram.com/...'
            />
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Permanent Address
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='md:col-span-2'>
            <label htmlFor='street' className='label'>
              Street Address <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('permanentAddress.street', {
                validate: validators.required('Street address'),
              })}
              type='text'
              id='street'
              className={`input ${
                errors.permanentAddress?.street ? 'input-error' : ''
              }`}
            />
            {errors.permanentAddress?.street && (
              <p className='error-text'>
                {errors.permanentAddress.street.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='city' className='label'>
              City <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('permanentAddress.city', {
                validate: validators.required('City'),
              })}
              type='text'
              id='city'
              className={`input ${
                errors.permanentAddress?.city ? 'input-error' : ''
              }`}
            />
            {errors.permanentAddress?.city && (
              <p className='error-text'>
                {errors.permanentAddress.city.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='province' className='label'>
              Province of Domicile <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('permanentAddress.provinceOfDomicile', {
                validate: validators.required('Province'),
              })}
              id='province'
              className={`input ${
                errors.permanentAddress?.provinceOfDomicile ? 'input-error' : ''
              }`}
            >
              <option value=''>Select province</option>
              {pakistanProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.permanentAddress?.provinceOfDomicile && (
              <p className='error-text'>
                {errors.permanentAddress.provinceOfDomicile.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='postalCode' className='label'>
              Postal Code <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('permanentAddress.postalCode', {
                validate: validators.required('Postal code'),
              })}
              type='text'
              id='postalCode'
              className={`input ${
                errors.permanentAddress?.postalCode ? 'input-error' : ''
              }`}
            />
            {errors.permanentAddress?.postalCode && (
              <p className='error-text'>
                {errors.permanentAddress.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='residenceCountry' className='label'>
              Country of Residence <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('residenceCountry', {
                validate: validators.required('Country of residence'),
              })}
              id='residenceCountry'
              className={`input ${
                errors.residenceCountry ? 'input-error' : ''
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
            {errors.residenceCountry && (
              <p className='error-text'>{errors.residenceCountry.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Emergency Contact
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label htmlFor='emergencyName' className='label'>
              Contact Name <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('emergencyContact.name', {
                validate: validators.required('Emergency contact name'),
              })}
              type='text'
              id='emergencyName'
              className={`input ${
                errors.emergencyContact?.name ? 'input-error' : ''
              }`}
            />
            {errors.emergencyContact?.name && (
              <p className='error-text'>
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='emergencyRelation' className='label'>
              Relationship <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('emergencyContact.relation', {
                validate: validators.required('Relationship'),
              })}
              id='emergencyRelation'
              className={`input ${
                errors.emergencyContact?.relation ? 'input-error' : ''
              }`}
            >
              <option value=''>Select relationship</option>
              {relationships.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
            {errors.emergencyContact?.relation && (
              <p className='error-text'>
                {errors.emergencyContact.relation.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='emergencyPhone' className='label'>
              Contact Phone <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('emergencyContact.phone', {
                validate: {
                  required: validators.required('Emergency contact phone'),
                  phone: validators.phone,
                },
              })}
              type='tel'
              id='emergencyPhone'
              placeholder='+92 XXX XXXXXXX'
              className={`input ${
                errors.emergencyContact?.phone ? 'input-error' : ''
              }`}
            />
            {errors.emergencyContact?.phone && (
              <p className='error-text'>
                {errors.emergencyContact.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Passport Details */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Passport Details
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label htmlFor='passportCountry' className='label'>
              Passport Country <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('passportDetails.passportCountry', {
                validate: validators.required('Passport country'),
              })}
              id='passportCountry'
              className={`input ${
                errors.passportDetails?.passportCountry ? 'input-error' : ''
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
            {errors.passportDetails?.passportCountry && (
              <p className='error-text'>
                {errors.passportDetails.passportCountry.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='passportNumber' className='label'>
              Passport Number <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('passportDetails.passportNumber', {
                validate: validators.required('Passport number'),
              })}
              type='text'
              id='passportNumber'
              className={`input ${
                errors.passportDetails?.passportNumber ? 'input-error' : ''
              }`}
            />
            {errors.passportDetails?.passportNumber && (
              <p className='error-text'>
                {errors.passportDetails.passportNumber.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor='passportExpiry' className='label'>
              Passport Expiry Date <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('passportDetails.passportExpiry', {
                validate: {
                  required: validators.required('Passport expiry date'),
                  futureDate: validators.futureDate('Passport expiry'),
                },
              })}
              type='date'
              id='passportExpiry'
              className={`input ${
                errors.passportDetails?.passportExpiry ? 'input-error' : ''
              }`}
            />
            {errors.passportDetails?.passportExpiry && (
              <p className='error-text'>
                {errors.passportDetails.passportExpiry.message}
              </p>
            )}
          </div>

          <div className='md:col-span-3'>
            <div className='flex items-center gap-2'>
              <label
                htmlFor='passportFile'
                className='text-sm text-primary-600 hover:text-primary-700 cursor-pointer flex items-center'
              >
                <FiUpload className='mr-1' />
                Upload Passport Copy (Optional)
              </label>
              <input
                id='passportFile'
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'passport', 'passport');
                }}
                className='hidden'
              />
              {uploadedFiles.passport && <FiCheck className='text-green-600' />}
              {uploadingFiles.passport && <LoadingSpinner size='sm' />}
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              You can upload your passport copy now or later in the documents
              section
            </p>
          </div>
        </div>
      </div>

      <div className='flex justify-end'>
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
