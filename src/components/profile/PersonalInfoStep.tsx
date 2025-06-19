import React from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { COUNTRIES } from '@/utils/constants';

interface PersonalInfoStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { personalInfo: StudentProfile['personalInfo'] }) => void;
  onPrevious: () => void;
  isSaving?: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onNext,
  isSaving,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfile['personalInfo']>({
    defaultValues: data.personalInfo || {
      fullName: { firstName: '', lastName: '' },
      permanentAddress: {},
      emergencyContact: {},
      passportDetails: {},
    },
  });
  console.log(data, 'data.personalInfo');

  const onSubmit = (formData: StudentProfile['personalInfo']) => {
    console.log('onnext');
    onNext({ personalInfo: formData });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
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
            <label htmlFor='cnicNumber' className='label'>
              CNIC Number <span className='text-red-500'>*</span>
            </label>
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
