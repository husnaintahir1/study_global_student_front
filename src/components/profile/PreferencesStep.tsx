import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StudentProfile } from '@/types';
import { validators } from '@/utils/validators';
import { COUNTRIES, INTAKE_SEASONS } from '@/utils/constants';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { api } from '@/services/api';

interface PreferencesStepProps {
  data: Partial<StudentProfile>;
  onNext: (data: {
    studyPreferences: StudentProfile['studyPreferences'];
  }) => void;
  onPrevious: () => void;
  isSaving?: boolean;
}

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  website?: string;
  mouStatus: 'direct' | 'third_party' | 'none';
}

interface Course {
  id: string;
  name: string;
  level: string;
  universityId: string;
}

interface UniversityWithCourses extends University {
  coursesCount?: number;
  matchingCourses?: Course[];
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  data,
  onNext,
  onPrevious,
  isSaving,
}) => {
  const currentYear = new Date().getFullYear();
  const [universities, setUniversities] = useState<UniversityWithCourses[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    UniversityWithCourses[]
  >([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    data.studyPreferences?.preferredUniversities || []
  );
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [showUniversityModule, setShowUniversityModule] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfile['studyPreferences']>({
    defaultValues: data.studyPreferences || {
      scholarshipInterest: false,
      coOpInterest: false,
      familyAbroad: false,
      accommodationSupport: false,
    },
  });

  const preferredCountry = watch('preferredCountry');
  const preferredCourse = watch('preferredCourse');

  // Load universities when country changes
  useEffect(() => {
    if (preferredCountry) {
      loadUniversities();
      loadAvailableCourses();
    } else {
      setUniversities([]);
      setCourses([]);
      setFilteredUniversities([]);
    }
  }, [preferredCountry]);

  // Filter universities when search or course filter changes
  useEffect(() => {
    filterUniversities();
  }, [universitySearch, courseFilter, universities]);

  const loadUniversities = async () => {
    setIsLoadingUniversities(true);
    try {
      const response = await api.get<University[]>(
        `/universities?country=${preferredCountry}`
      );
      // Sort by MOU status but don't show it
      const sorted = response.sort((a, b) => {
        const priority = { direct: 0, third_party: 1, none: 2 };
        return priority[a.mouStatus] - priority[b.mouStatus];
      });
      setUniversities(sorted);
      setFilteredUniversities(sorted);
    } catch (error) {
      console.error('Failed to load universities:', error);
    } finally {
      setIsLoadingUniversities(false);
    }
  };

  const loadAvailableCourses = async () => {
    setIsLoadingCourses(true);
    try {
      // Get unique courses available in the selected country
      const response = await api.get<string[]>(
        `/courses/unique?country=${preferredCountry}`
      );
      setCourses(response);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const filterUniversities = async () => {
    let filtered = [...universities];

    // Filter by search query
    if (universitySearch) {
      filtered = filtered.filter(
        (uni) =>
          uni.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
          uni.city.toLowerCase().includes(universitySearch.toLowerCase())
      );
    }

    // Filter by course
    if (courseFilter) {
      try {
        // Get universities offering this course
        const response = await api.get<string[]>(
          `/universities/by-course?country=${preferredCountry}&course=${encodeURIComponent(
            courseFilter
          )}`
        );
        const universityIds = new Set(response);
        filtered = filtered.filter((uni) => universityIds.has(uni.id));
      } catch (error) {
        console.error('Failed to filter by course:', error);
      }
    }

    setFilteredUniversities(filtered);
  };

  const toggleUniversity = (universityId: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(universityId)
        ? prev.filter((id) => id !== universityId)
        : [...prev, universityId]
    );
  };

  const onSubmit = (formData: StudentProfile['studyPreferences']) => {
    onNext({
      studyPreferences: {
        ...formData,
        preferredUniversities: selectedUniversities,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Basic Preferences */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Study Preferences
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='preferredCourse' className='label'>
              Field of Study <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('preferredCourse', {
                validate: validators.required('Field of study'),
              })}
              type='text'
              id='preferredCourse'
              className={`input ${errors.preferredCourse ? 'input-error' : ''}`}
              placeholder='e.g., Computer Science'
            />
            {errors.preferredCourse && (
              <p className='error-text'>{errors.preferredCourse.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='specialization' className='label'>
              Specialization
            </label>
            <input
              {...register('specialization')}
              type='text'
              id='specialization'
              className='input'
              placeholder='e.g., Data Science'
            />
          </div>

          <div>
            <label htmlFor='preferredCountry' className='label'>
              Country <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('preferredCountry', {
                validate: validators.required('Country'),
              })}
              id='preferredCountry'
              className={`input ${
                errors.preferredCountry ? 'input-error' : ''
              }`}
            >
              <option value=''>Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.preferredCountry && (
              <p className='error-text'>{errors.preferredCountry.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='intakeYear' className='label'>
              Intake Year <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('intendedIntake.year', {
                validate: validators.required('Intake year'),
                valueAsNumber: true,
              })}
              id='intakeYear'
              className={`input ${
                errors.intendedIntake?.year ? 'input-error' : ''
              }`}
            >
              <option value=''>Select year</option>
              {[currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.intendedIntake?.year && (
              <p className='error-text'>{errors.intendedIntake.year.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='intakeSeason' className='label'>
              Intake Season <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('intendedIntake.season', {
                validate: validators.required('Intake season'),
              })}
              id='intakeSeason'
              className={`input ${
                errors.intendedIntake?.season ? 'input-error' : ''
              }`}
            >
              <option value=''>Select season</option>
              {INTAKE_SEASONS.map((season) => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>
            {errors.intendedIntake?.season && (
              <p className='error-text'>
                {errors.intendedIntake.season.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* University Selection Module */}
      {preferredCountry && (
        <div>
          <div className='flex items-center justify-between mb-4'>
            <label className='label mb-0'>Select Universities</label>
            <button
              type='button'
              onClick={() => setShowUniversityModule(!showUniversityModule)}
              className='text-primary-600 hover:text-primary-700 text-sm font-medium'
            >
              {showUniversityModule ? 'Hide' : 'Browse'} Universities
            </button>
          </div>

          {/* Selected Universities Count */}
          {selectedUniversities.length > 0 && !showUniversityModule && (
            <p className='text-sm text-gray-600'>
              {selectedUniversities.length} universities selected
            </p>
          )}

          {showUniversityModule && (
            <div className='border rounded-lg p-4 space-y-4'>
              {/* Filters */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='relative'>
                  <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <input
                    type='text'
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    placeholder='Search university or city...'
                    className='input pl-10 text-sm'
                  />
                </div>

                <div className='relative'>
                  <FiFilter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className='input pl-10 text-sm'
                    disabled={isLoadingCourses}
                  >
                    <option value=''>All Courses</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className='text-sm text-gray-600'>
                Showing {filteredUniversities.length} of {universities.length}{' '}
                universities
                {courseFilter && ` offering ${courseFilter}`}
              </div>

              {/* University List */}
              {isLoadingUniversities ? (
                <div className='flex justify-center py-8'>
                  <LoadingSpinner size='md' />
                </div>
              ) : filteredUniversities.length > 0 ? (
                <div className='max-h-96 overflow-y-auto space-y-2 pr-2'>
                  {filteredUniversities.map((university) => (
                    <label
                      key={university.id}
                      className='flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50'
                    >
                      <input
                        type='checkbox'
                        checked={selectedUniversities.includes(university.id)}
                        onChange={() => toggleUniversity(university.id)}
                        className='h-4 w-4 text-primary-600 rounded'
                      />
                      <div className='ml-3 flex-1'>
                        <p className='font-medium text-gray-900'>
                          {university.name}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {university.city}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className='text-center text-gray-500 py-8'>
                  No universities found matching your criteria
                </p>
              )}

              {/* Selected Count */}
              {selectedUniversities.length > 0 && (
                <div className='pt-3 border-t'>
                  <p className='text-sm font-medium text-primary-600'>
                    {selectedUniversities.length} universities selected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Motivation */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Motivation & Goals
        </h3>
        <div className='space-y-4'>
          <div>
            <label htmlFor='studyReason' className='label'>
              Why study abroad? <span className='text-red-500'>*</span>
            </label>
            <textarea
              {...register('studyReason', {
                validate: validators.required('Study reason'),
              })}
              id='studyReason'
              rows={3}
              className={`input ${errors.studyReason ? 'input-error' : ''}`}
            />
            {errors.studyReason && (
              <p className='error-text'>{errors.studyReason.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='careerGoals' className='label'>
              Career Goals <span className='text-red-500'>*</span>
            </label>
            <textarea
              {...register('careerGoals', {
                validate: validators.required('Career goals'),
              })}
              id='careerGoals'
              rows={3}
              className={`input ${errors.careerGoals ? 'input-error' : ''}`}
            />
            {errors.careerGoals && (
              <p className='error-text'>{errors.careerGoals.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className='space-y-2'>
        <label className='flex items-center space-x-2'>
          <input
            {...register('scholarshipInterest')}
            type='checkbox'
            className='h-4 w-4 text-primary-600 rounded'
          />
          <span className='text-sm'>Interested in scholarships</span>
        </label>

        <label className='flex items-center space-x-2'>
          <input
            {...register('coOpInterest')}
            type='checkbox'
            className='h-4 w-4 text-primary-600 rounded'
          />
          <span className='text-sm'>Interested in Co-op programs</span>
        </label>

        <label className='flex items-center space-x-2'>
          <input
            {...register('familyAbroad')}
            type='checkbox'
            className='h-4 w-4 text-primary-600 rounded'
          />
          <span className='text-sm'>Have family in preferred country</span>
        </label>

        <label className='flex items-center space-x-2'>
          <input
            {...register('accommodationSupport')}
            type='checkbox'
            className='h-4 w-4 text-primary-600 rounded'
          />
          <span className='text-sm'>Need accommodation assistance</span>
        </label>
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
