import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { validators } from '@/utils/validators';

interface WorkExperienceStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { workExperience: StudentProfile['workExperience'] }) => void;
  onPrevious: () => void;
}

interface WorkExperienceForm {
  experiences: NonNullable<StudentProfile['workExperience']>;
}

export const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({
  data,
  onNext,
  onPrevious,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WorkExperienceForm>({
    defaultValues: {
      experiences:
        data.workExperience && data.workExperience.length > 0
          ? data.workExperience
          : [
              {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                description: '',
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  });

  const watchExperiences = watch('experiences');

  const onSubmit = async (formData: WorkExperienceForm) => {
    setIsSubmitting(true);
    // Filter out empty experiences
    const validExperiences = formData.experiences.filter(
      (exp) => exp.company || exp.position || exp.startDate
    );
    onNext({ workExperience: validExperiences });
    setIsSubmitting(false);
  };

  const addExperience = () => {
    append({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium text-gray-900'>Work Experience</h3>
        <button
          type='button'
          onClick={addExperience}
          className='btn btn-outline btn-sm flex items-center gap-2'
        >
          <FiPlus className='h-4 w-4' />
          Add Experience
        </button>
      </div>

      <div className='space-y-6'>
        {fields.map((field, index) => (
          <div key={field.id} className='card bg-gray-50'>
            <div className='flex justify-between items-start mb-4'>
              <h4 className='font-medium text-gray-900'>
                Experience {index + 1}
              </h4>
              {fields.length > 1 && (
                <button
                  type='button'
                  onClick={() => remove(index)}
                  className='text-red-600 hover:text-red-700'
                >
                  <FiTrash2 className='h-4 w-4' />
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='label'>Company/Organization</label>
                <input
                  {...register(`experiences.${index}.company`, {
                    validate: (value) => {
                      // Only validate if any field in this experience is filled
                      const exp = watchExperiences[index];
                      if (exp.position || exp.startDate) {
                        return validators.required('Company')(value);
                      }
                      return true;
                    },
                  })}
                  type='text'
                  className={`input ${
                    errors.experiences?.[index]?.company ? 'input-error' : ''
                  }`}
                />
                {errors.experiences?.[index]?.company && (
                  <p className='error-text'>
                    {errors.experiences[index]?.company?.message}
                  </p>
                )}
              </div>

              <div>
                <label className='label'>Position/Title</label>
                <input
                  {...register(`experiences.${index}.position`, {
                    validate: (value) => {
                      const exp = watchExperiences[index];
                      if (exp.company || exp.startDate) {
                        return validators.required('Position')(value);
                      }
                      return true;
                    },
                  })}
                  type='text'
                  className={`input ${
                    errors.experiences?.[index]?.position ? 'input-error' : ''
                  }`}
                />
                {errors.experiences?.[index]?.position && (
                  <p className='error-text'>
                    {errors.experiences[index]?.position?.message}
                  </p>
                )}
              </div>

              <div>
                <label className='label'>Start Date</label>
                <input
                  {...register(`experiences.${index}.startDate`, {
                    validate: (value) => {
                      const exp = watchExperiences[index];
                      if (exp.company || exp.position) {
                        return validators.required('Start date')(value);
                      }
                      return true;
                    },
                  })}
                  type='month'
                  className={`input ${
                    errors.experiences?.[index]?.startDate ? 'input-error' : ''
                  }`}
                />
                {errors.experiences?.[index]?.startDate && (
                  <p className='error-text'>
                    {errors.experiences[index]?.startDate?.message}
                  </p>
                )}
              </div>

              <div>
                <label className='label'>
                  End Date (Leave empty if current)
                </label>
                <input
                  {...register(`experiences.${index}.endDate`)}
                  type='month'
                  className='input'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='label'>Description/Responsibilities</label>
                <textarea
                  {...register(`experiences.${index}.description`)}
                  rows={3}
                  className='input'
                  placeholder='Briefly describe your role and key responsibilities...'
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          <p>No work experience added. Click "Add Experience" to start.</p>
        </div>
      )}

      <div className='border-t pt-4'>
        <p className='text-sm text-gray-600 text-center mb-4'>
          Work experience is optional. You can skip this step if not applicable.
        </p>
      </div>

      <div className='flex justify-between'>
        <button type='button' onClick={onPrevious} className='btn btn-outline'>
          Previous
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='btn btn-primary flex items-center'
        >
          {isSubmitting ? <LoadingSpinner size='sm' /> : 'Next'}
        </button>
      </div>
    </form>
  );
};
