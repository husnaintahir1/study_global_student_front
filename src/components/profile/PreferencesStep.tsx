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
    <div className='space-y-8'>
      {/* Basic Preferences */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Study Preferences
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='preferredCourse'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Field of Study <span className='text-red-600'>*</span>
            </label>
            <input
              {...register('preferredCourse', {
                validate: validators.required('Field of study'),
              })}
              type='text'
              id='preferredCourse'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.preferredCourse ? 'border-red-300' : ''
              }`}
              placeholder='e.g., Computer Science'
            />
            {errors.preferredCourse && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.preferredCourse.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='specialization'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Specialization
            </label>
            <input
              {...register('specialization')}
              type='text'
              id='specialization'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              placeholder='e.g., Data Science'
            />
          </div>

          <div>
            <label
              htmlFor='preferredCountry'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Country <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('preferredCountry', {
                validate: validators.required('Country'),
              })}
              id='preferredCountry'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.preferredCountry ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.preferredCountry.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='intakeYear'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Intake Year <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('intendedIntake.year', {
                validate: validators.required('Intake year'),
                valueAsNumber: true,
              })}
              id='intakeYear'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.intendedIntake?.year ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.intendedIntake.year.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='intakeSeason'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Intake Season <span className='text-red-600'>*</span>
            </label>
            <select
              {...register('intendedIntake.season', {
                validate: validators.required('Intake season'),
              })}
              id='intakeSeason'
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                errors.intendedIntake?.season ? 'border-red-300' : ''
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
              <p className='text-xs text-red-600 mt-1'>
                {errors.intendedIntake.season.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* University Selection Module */}
      {preferredCountry && (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-semibold text-gray-900'>
              Select Universities
            </h3>
            <button
              type='button'
              onClick={() => setShowUniversityModule(!showUniversityModule)}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center'
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
            <div className='space-y-4'>
              {/* Filters */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='relative'>
                  <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                  <input
                    type='text'
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    placeholder='Search university or city...'
                    className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                  />
                </div>

                <div className='relative'>
                  <FiFilter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
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
                      className='flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all'
                    >
                      <input
                        type='checkbox'
                        checked={selectedUniversities.includes(university.id)}
                        onChange={() => toggleUniversity(university.id)}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
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
                <div className='pt-3 border-t border-gray-200'>
                  <p className='text-sm font-medium text-blue-600'>
                    {selectedUniversities.length} universities selected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Motivation */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Motivation & Goals
        </h3>
        <div className='space-y-6'>
          <div>
            <label
              htmlFor='studyReason'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Why study abroad? <span className='text-red-600'>*</span>
            </label>
            <textarea
              {...register('studyReason', {
                validate: validators.required('Study reason'),
              })}
              id='studyReason'
              rows={3}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none ${
                errors.studyReason ? 'border-red-300' : ''
              }`}
            />
            {errors.studyReason && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.studyReason.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='careerGoals'
              className='block text-sm font-medium text-gray-900 mb-2'
            >
              Career Goals <span className='text-red-600'>*</span>
            </label>
            <textarea
              {...register('careerGoals', {
                validate: validators.required('Career goals'),
              })}
              id='careerGoals'
              rows={3}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none ${
                errors.careerGoals ? 'border-red-300' : ''
              }`}
            />
            {errors.careerGoals && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.careerGoals.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'>
        <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
          Additional Preferences
        </h3>
        <div className='space-y-3'>
          <label className='flex items-center space-x-3'>
            <input
              {...register('scholarshipInterest')}
              type='checkbox'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <span className='text-sm text-gray-900'>
              Interested in scholarships
            </span>
          </label>

          <label className='flex items-center space-x-3'>
            <input
              {...register('coOpInterest')}
              type='checkbox'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <span className='text-sm text-gray-900'>
              Interested in Co-op programs
            </span>
          </label>

          <label className='flex items-center space-x-3'>
            <input
              {...register('familyAbroad')}
              type='checkbox'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <span className='text-sm text-gray-900'>
              Have family in preferred country
            </span>
          </label>

          <label className='flex items-center space-x-3'>
            <input
              {...register('accommodationSupport')}
              type='checkbox'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded transition-all'
            />
            <span className='text-sm text-gray-900'>
              Need accommodation assistance
            </span>
          </label>
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
