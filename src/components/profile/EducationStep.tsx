import React from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EducationStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: { educationalBackground: StudentProfile['educationalBackground'] }) => void;
  onPrevious: () => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({ data, onNext, onPrevious }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfile['educationalBackground']>({
    defaultValues: data.educationalBackground || {},
  });

  const onSubmit = (formData: StudentProfile['educationalBackground']) => {
    onNext({ educationalBackground: formData });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="highestDegree" className="label">
            Highest Degree
          </label>
          <select
            {...register('highestDegree', { validate: validators.required('Highest degree') })}
            id="highestDegree"
            className={`input ${errors.highestDegree ? 'input-error' : ''}`}
          >
            <option value="">Select degree</option>
            <option value="high_school">High School</option>
            <option value="intermediate">Intermediate/A-Levels</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
          </select>
          {errors.highestDegree && <p className="error-text">{errors.highestDegree.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="institution" className="label">
            Institution/University
          </label>
          <input
            {...register('institution', { validate: validators.required('Institution') })}
            type="text"
            id="institution"
            className={`input ${errors.institution ? 'input-error' : ''}`}
            placeholder="Enter your institution name"
          />
          {errors.institution && <p className="error-text">{errors.institution.message}</p>}
        </div>

        <div>
          <label htmlFor="graduationYear" className="label">
            Graduation Year
          </label>
          <select
            {...register('graduationYear', { 
              validate: validators.required('Graduation year'),
              valueAsNumber: true,
            })}
            id="graduationYear"
            className={`input ${errors.graduationYear ? 'input-error' : ''}`}
          >
            <option value="">Select year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.graduationYear && <p className="error-text">{errors.graduationYear.message}</p>}
        </div>

        <div>
          <label htmlFor="gpa" className="label">
            GPA/CGPA
          </label>
          <input
            {...register('gpa', { 
              validate: {
                required: validators.required('GPA'),
                gpa: validators.gpa,
              },
              valueAsNumber: true,
            })}
            type="number"
            step="0.01"
            id="gpa"
            className={`input ${errors.gpa ? 'input-error' : ''}`}
            placeholder="e.g., 3.50"
          />
          {errors.gpa && <p className="error-text">{errors.gpa.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="majorSubject" className="label">
            Major Subject/Field of Study
          </label>
          <input
            {...register('majorSubject', { validate: validators.required('Major subject') })}
            type="text"
            id="majorSubject"
            className={`input ${errors.majorSubject ? 'input-error' : ''}`}
            placeholder="e.g., Computer Science, Business Administration"
          />
          {errors.majorSubject && <p className="error-text">{errors.majorSubject.message}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="btn btn-outline"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex items-center"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : 'Next'}
        </button>
      </div>
    </form>
  );
};