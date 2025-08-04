import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  BookOpen,
  Users,
  ChevronDown,
  X,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  applicationService,
  University,
  Program,
} from '../services/ApplicationProcessService';
import { parseApiError } from '../utils/applicationUtils';

interface UniversityBrowserProps {
  onSelectUniversity?: (university: University, program: Program) => void;
  selectedUniversities?: Array<{ universityId: number; programId: number }>;
  showSelectionMode?: boolean;
}

interface Filters {
  country: string;
  program: string;
  searchTerm: string;
}

const UniversityBrowser: React.FC<UniversityBrowserProps> = ({
  onSelectUniversity,
  selectedUniversities = [],
  showSelectionMode = false,
}) => {
  // State Management
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    University[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    country: '',
    program: '',
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Available filter options (extracted from data)
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);

  // Load universities
  const loadUniversities = async (filterOptions?: {
    country?: string;
    program?: string;
  }) => {
    try {
      setError(null);
      const response = await applicationService.getUniversities(filterOptions);
      setUniversities(response.universities);

      // Extract unique countries and programs for filter options
      const countries = [
        ...new Set(response.universities.map((u) => u.country)),
      ].sort();
      const programs = [
        ...new Set(
          response.universities.flatMap((u) => u.programs.map((p) => p.name))
        ),
      ].sort();

      setAvailableCountries(countries);
      setAvailablePrograms(programs);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUniversities();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = universities;

    // Apply search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (university) =>
          university.universityName.toLowerCase().includes(searchLower) ||
          university.country.toLowerCase().includes(searchLower) ||
          university.programs.some((program) =>
            program.name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply country filter
    if (filters.country) {
      filtered = filtered.filter(
        (university) => university.country === filters.country
      );
    }

    // Apply program filter
    if (filters.program) {
      filtered = filtered.filter((university) =>
        university.programs.some((program) => program.name === filters.program)
      );
    }

    setFilteredUniversities(filtered);
  }, [universities, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Apply API filters (for country and program)
  const applyApiFilters = async () => {
    setLoading(true);
    const apiFilters: { country?: string; program?: string } = {};

    if (filters.country) apiFilters.country = filters.country;
    if (filters.program) apiFilters.program = filters.program;

    await loadUniversities(apiFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      country: '',
      program: '',
      searchTerm: '',
    });
    loadUniversities();
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUniversities();
  };

  // Check if university/program is selected
  const isSelected = (universityId: number, programId: number): boolean => {
    return selectedUniversities.some(
      (selected) =>
        selected.universityId === universityId &&
        selected.programId === programId
    );
  };

  // Handle university/program selection
  const handleSelection = (university: University, program: Program) => {
    if (onSelectUniversity) {
      onSelectUniversity(university, program);
    } else {
      // Default navigation to application creation with pre-selected university
      window.location.href = `/applications/new?university=${university.id}&program=${program.id}`;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
          {/* Loading skeleton */}
          <div className='bg-white/80 backdrop-blur-md rounded-2xl p-8'>
            <div className='animate-pulse space-y-6'>
              <div className='h-8 bg-gray-200 rounded w-64'></div>
              <div className='h-12 bg-gray-200 rounded'></div>
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className='h-64 bg-gray-200 rounded-xl'></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
            Browse Universities
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Explore universities and programs from around the world. Find the
            perfect fit for your study abroad journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6'>
          <div className='space-y-4'>
            {/* Search Bar */}
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search universities, programs, or countries...'
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange('searchTerm', e.target.value)
                }
                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              />
            </div>

            {/* Filter Toggle and Actions */}
            <div className='flex items-center justify-between'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <Filter className='h-4 w-4' />
                <span>Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className='flex items-center gap-3'>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50'
                  title='Refresh'
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                  />
                </button>

                {(filters.country || filters.program || filters.searchTerm) && (
                  <button
                    onClick={resetFilters}
                    className='px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    Clear All
                  </button>
                )}

                <div className='text-sm text-gray-600'>
                  {filteredUniversities.length}{' '}
                  {filteredUniversities.length === 1
                    ? 'university'
                    : 'universities'}
                </div>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className='border-t border-gray-200 pt-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Country Filter */}
                  <div>
                    <label className='block text-sm font-medium text-gray-900 mb-2'>
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) =>
                        handleFilterChange('country', e.target.value)
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                    >
                      <option value=''>All Countries</option>
                      {availableCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Program Filter */}
                  <div>
                    <label className='block text-sm font-medium text-gray-900 mb-2'>
                      Program
                    </label>
                    <select
                      value={filters.program}
                      onChange={(e) =>
                        handleFilterChange('program', e.target.value)
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                    >
                      <option value=''>All Programs</option>
                      {availablePrograms.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='mt-4 flex justify-end'>
                  <button
                    onClick={applyApiFilters}
                    className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='text-sm font-medium text-red-900 mb-1'>Error</h4>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Universities Grid */}
        {filteredUniversities.length === 0 ? (
          /* Empty State */
          <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-16 text-center'>
            <div className='p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
              <BookOpen className='h-12 w-12 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No Universities Found
            </h3>
            <p className='text-gray-500 mb-6 max-w-md mx-auto'>
              {filters.searchTerm || filters.country || filters.program
                ? 'Try adjusting your filters or search terms to find more universities.'
                : 'No universities are currently available. Please try again later.'}
            </p>
            {(filters.searchTerm || filters.country || filters.program) && (
              <button
                onClick={resetFilters}
                className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {filteredUniversities.map((university) => (
              <div
                key={university.id}
                className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group'
              >
                {/* University Header */}
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                        {university.universityName}
                      </h3>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <MapPin className='h-4 w-4' />
                        <span className='text-sm'>{university.country}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programs */}
                <div className='p-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium text-gray-900'>
                        Available Programs
                      </h4>
                      <span className='text-sm text-gray-500'>
                        {university.programs.length} programs
                      </span>
                    </div>

                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                      {university.programs.map((program) => (
                        <div
                          key={program.id}
                          className={`p-4 border rounded-xl transition-all ${
                            showSelectionMode &&
                            isSelected(university.id, program.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className='flex items-start justify-between mb-3'>
                            <h5 className='font-medium text-gray-900 flex-1 pr-2'>
                              {program.name}
                            </h5>
                            {showSelectionMode && (
                              <button
                                onClick={() =>
                                  handleSelection(university, program)
                                }
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                                  isSelected(university.id, program.id)
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                              >
                                {isSelected(university.id, program.id)
                                  ? 'Selected'
                                  : 'Select'}
                              </button>
                            )}
                          </div>

                          <div className='grid grid-cols-2 gap-3 text-xs text-gray-600'>
                            <div className='flex items-center gap-1'>
                              <DollarSign className='h-3 w-3' />
                              <span>{program.fees}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              <span>{program.duration}</span>
                            </div>
                          </div>

                          <div className='mt-2'>
                            <div className='flex items-center gap-1 text-xs text-gray-600'>
                              <Calendar className='h-3 w-3' />
                              <span>Intakes: {program.intakes.join(', ')}</span>
                            </div>
                          </div>

                          {!showSelectionMode && (
                            <button
                              onClick={() =>
                                handleSelection(university, program)
                              }
                              className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all'
                            >
                              <span>Apply Now</span>
                              <ArrowRight className='h-3 w-3' />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityBrowser;
