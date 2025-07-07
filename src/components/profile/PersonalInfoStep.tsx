import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { API_BASE_URL, COUNTRIES } from '@/utils/constants';
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
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
};

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
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
  console.log(data, 'data in personal info step');
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(
    API_BASE_URL.replace('/api/v1', '') + data.personalInfo?.profilePicture ||
      null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ExtendedPersonalInfo>({
    defaultValues: data.personalInfo || {
      fullName: { firstName: '', lastName: '' },
      permanentAddress: {},
      emergencyContact: {},
      passportDetails: {},
      socialLinks: {},
      profilePicture: '',
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
      if (fieldName === 'profilePicture') {
        // Use /upload API for profile picture
        const response = await documentService.uploadProfilePicture(file);
        setValue('profilePicture', response?.fileUrl);
        setProfilePicturePreview(
          API_BASE_URL.replace('/api/v1', '') + response?.fileUrl
        );
        toast.success('Profile picture uploaded successfully');
      } else {
        // Use /document API for other documents
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
      }
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

    // Upload file to /upload API
    handleFileUpload(file, 'profilePicture', 'photo');
  };

  const onSubmit = (formData: ExtendedPersonalInfo) => {
    onNext({
      personalInfo: {
        ...formData,
        uploadedDocuments: uploadedFiles,
        profilePicture: formData.profilePicture,
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

  return (
    <div className='space-y-8'>
      {/* Document Disclaimer */}
      <div className='bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-2xl p-6 shadow-xl'>
        <div className='flex items-start gap-3'>
          <FiInfo className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-amber-900 mb-2'>
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
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Profile Picture
        </h3>
        <div className='flex items-center space-x-6'>
          <div className='relative'>
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt='Profile'
                className='h-24 w-24 rounded-full object-cover border-2 border-gray-200'
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
              className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
            >
              <FiUpload className='mr-1 h-5 w-5' />
              Upload Photo
            </label>
            <input
              id='profilePicture'
              type='file'
              accept='image/*'
              onChange={handleProfilePictureChange}
              className='hidden'
            />
            <p className='text-xs text-gray-500 mt-2'>
              JPG, PNG up to 5MB. Passport size photo recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Basic Information
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='firstName'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              First Name <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('fullName.firstName', {
                validate: validators.required('First name'),
              })}
              type='text'
              id='firstName'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.fullName?.firstName ? 'border-red-300' : ''
              }`}
            />
            {errors.fullName?.firstName && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.fullName.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='lastName'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Last Name <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('fullName.lastName', {
                validate: validators.required('Last name'),
              })}
              type='text'
              id='lastName'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.fullName?.lastName ? 'border-red-300' : ''
              }`}
            />
            {errors.fullName?.lastName && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.fullName.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='fatherName'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Father's Name <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('fatherName', {
                validate: validators.required("Father's name"),
              })}
              type='text'
              id='fatherName'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.fatherName ? 'border-red-300' : ''
              }`}
            />
            {errors.fatherName && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.fatherName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='dateOfBirth'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Date of Birth <span className='text-red-600'>*</span>
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
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.dateOfBirth ? 'border-red-300' : ''
              }`}
            />
            {errors.dateOfBirth && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='gender'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Gender <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('gender', {
                validate: validators.required('Gender'),
              })}
              id='gender'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.gender ? 'border-red-300' : ''
              }`}
            >
              <option value=''>Select gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>
            {errors.gender && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='religion'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Religion
            </label>
            <select
              {...register('religion' as any)}
              id='religion'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
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
            <label
              htmlFor='cnicNumber'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              CNIC Number <span className='text-red-600'>*</span>
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  errors.cnicNumber ? 'border-red-300' : ''
                }`}
              />
              {errors.cnicNumber && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.cnicNumber.message}
                </p>
              )}
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='cnicFile'
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
                >
                  <FiUpload className='mr-1 h-5 w-5' />
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
                {uploadedFiles.cnic && (
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <FiCheck className='h-5 w-5 text-green-600' />
                  </div>
                )}
                {uploadingFiles.cnic && <LoadingSpinner size='sm' />}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Phone Number <span className='text-red-600'>*</span>
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
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.phone ? 'border-red-300' : ''
              }`}
            />
            {errors.phone && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Email Address <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('email', { validate: validators.email })}
              type='email'
              id='email'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.email ? 'border-red-300' : ''
              }`}
            />
            {errors.email && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Social Media Links (Optional)
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label
              htmlFor='linkedin'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              LinkedIn
            </label>
            <input
              {...register('socialLinks.linkedin' as any)}
              type='url'
              id='linkedin'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              placeholder='https://linkedin.com/in/...'
            />
          </div>

          <div>
            <label
              htmlFor='facebook'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Facebook
            </label>
            <input
              {...register('socialLinks.facebook' as any)}
              type='url'
              id='facebook'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              placeholder='https://facebook.com/...'
            />
          </div>

          <div>
            <label
              htmlFor='instagram'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Instagram
            </label>
            <input
              {...register('socialLinks.instagram' as any)}
              type='url'
              id='instagram'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              placeholder='https://instagram.com/...'
            />
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Permanent Address
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='md:col-span-2'>
            <label
              htmlFor='street'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Street Address <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('permanentAddress.street', {
                validate: validators.required('Street address'),
              })}
              type='text'
              id='street'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.permanentAddress?.street ? 'border-red-300' : ''
              }`}
            />
            {errors.permanentAddress?.street && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.permanentAddress.street.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='city'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              City <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('permanentAddress.city', {
                validate: validators.required('City'),
              })}
              type='text'
              id='city'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.permanentAddress?.city ? 'border-red-300' : ''
              }`}
            />
            {errors.permanentAddress?.city && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.permanentAddress.city.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='province'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Province of Domicile <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('permanentAddress.provinceOfDomicile', {
                validate: validators.required('Province'),
              })}
              id='province'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.permanentAddress?.provinceOfDomicile
                  ? 'border-red-300'
                  : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.permanentAddress.provinceOfDomicile.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='postalCode'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Postal Code <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('permanentAddress.postalCode', {
                validate: validators.required('Postal code'),
              })}
              type='text'
              id='postalCode'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.permanentAddress?.postalCode ? 'border-red-300' : ''
              }`}
            />
            {errors.permanentAddress?.postalCode && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.permanentAddress.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='residenceCountry'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Country of Residence <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('residenceCountry', {
                validate: validators.required('Country of residence'),
              })}
              id='residenceCountry'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.residenceCountry ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.residenceCountry.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Emergency Contact
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label
              htmlFor='emergencyName'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Contact Name <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('emergencyContact.name', {
                validate: validators.required('Emergency contact name'),
              })}
              type='text'
              id='emergencyName'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.emergencyContact?.name ? 'border-red-300' : ''
              }`}
            />
            {errors.emergencyContact?.name && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='emergencyRelation'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Relationship <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('emergencyContact.relation', {
                validate: validators.required('Relationship'),
              })}
              id='emergencyRelation'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.emergencyContact?.relation ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.emergencyContact.relation.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='emergencyPhone'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Contact Phone <span className='text-red-600'>*</span>
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
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.emergencyContact?.phone ? 'border-red-300' : ''
              }`}
            />
            {errors.emergencyContact?.phone && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.emergencyContact.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Passport Details */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Passport Details
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label
              htmlFor='passportCountry'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Passport Country <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('passportDetails.passportCountry', {
                validate: validators.required('Passport country'),
              })}
              id='passportCountry'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.passportDetails?.passportCountry ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.passportDetails.passportCountry.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='passportNumber'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Passport Number <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('passportDetails.passportNumber', {
                validate: validators.required('Passport number'),
              })}
              type='text'
              id='passportNumber'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.passportDetails?.passportNumber ? 'border-red-300' : ''
              }`}
            />
            {errors.passportDetails?.passportNumber && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.passportDetails.passportNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='passportExpiry'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Passport Expiry Date <span className='text-red-600'>*</span>
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
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.passportDetails?.passportExpiry ? 'border-red-300' : ''
              }`}
            />
            {errors.passportDetails?.passportExpiry && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.passportDetails.passportExpiry.message}
              </p>
            )}
          </div>

          <div className='md:col-span-3'>
            <div className='flex items-center gap-4'>
              <label
                htmlFor='passportFile'
                className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center'
              >
                <FiUpload className='mr-1 h-5 w-5' />
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
              {uploadedFiles.passport && (
                <div className='p-2 bg-green-100 rounded-lg'>
                  <FiCheck className='h-5 w-5 text-green-600' />
                </div>
              )}
              {uploadingFiles.passport && <LoadingSpinner size='sm' />}
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              You can upload your passport copy now or later in the documents
              section
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
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </div>
  );
};
