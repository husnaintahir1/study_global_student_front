import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiGlobe,
  //   FiGraduationCap,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiCheck,
  FiX,
  FiBookOpen,
  FiMapPin,
  FiSave,
  FiArrowRight,
} from 'react-icons/fi';
import {
  applicationProcessService,
  University,
  UniversitySelection as SelectedUniversity,
} from '@/services/applicationProcessService';

interface Program {
  id: number;
  name: string;
  fees: string;
  duration: string;
  intakes: string[];
}

interface UniversitySelectionProps {
  applicationId: string;
  onClose: () => void;
  onSave: (selections: SelectedUniversity[]) => void;
  initialSelections?: SelectedUniversity[];
}

const UniversitySelection: React.FC<UniversitySelectionProps> = ({
  applicationId,
  onClose,
  onSave,
  initialSelections = [],
}) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    University[]
  >([]);
  const [selectedUniversities, setSelectedUniversities] =
    useState<SelectedUniversity[]>(initialSelections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    filterUniversities();
  }, [universities, searchTerm, selectedCountry, selectedProgram]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(
        '/api/v1/applications/student/universities',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUniversities(data.universities);
        setFilteredUniversities(data.universities);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUniversities = () => {
    let filtered = universities;

    if (searchTerm) {
      filtered = filtered
        .map((uni) => ({
          ...uni,
          programs: uni.programs.filter(
            (program) =>
              uni.universityName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              program.name.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((uni) => uni.programs.length > 0);
    }

    if (selectedCountry) {
      filtered = filtered.filter((uni) => uni.country === selectedCountry);
    }

    if (selectedProgram) {
      filtered = filtered
        .map((uni) => ({
          ...uni,
          programs: uni.programs.filter((program) =>
            program.name.toLowerCase().includes(selectedProgram.toLowerCase())
          ),
        }))
        .filter((uni) => uni.programs.length > 0);
    }

    setFilteredUniversities(filtered);
  };

  const handleProgramSelect = (university: University, program: Program) => {
    const selection: SelectedUniversity = {
      universityId: university.id,
      universityName: university.universityName,
      programId: program.id,
      programName: program.name,
      country: university.country,
      fees: program.fees,
      duration: program.duration,
      intakes: program.intakes,
    };

    const isAlreadySelected = selectedUniversities.some(
      (sel) =>
        sel.universityId === university.id && sel.programId === program.id
    );

    if (isAlreadySelected) {
      setSelectedUniversities((prev) =>
        prev.filter(
          (sel) =>
            !(
              sel.universityId === university.id && sel.programId === program.id
            )
        )
      );
    } else {
      if (selectedUniversities.length >= 5) {
        alert('You can select maximum 5 university programs');
        return;
      }
      setSelectedUniversities((prev) => [...prev, selection]);
    }
  };

  const handleSave = async () => {
    if (selectedUniversities.length === 0) {
      alert('Please select at least one university program');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/v1/applications/student/${applicationId}/universities`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            universitySelections: selectedUniversities,
          }),
        }
      );

      if (response.ok) {
        onSave(selectedUniversities);
      }
    } catch (error) {
      console.error('Error saving university selections:', error);
    } finally {
      setSaving(false);
    }
  };

  const isProgramSelected = (universityId: number, programId: number) => {
    return selectedUniversities.some(
      (sel) => sel.universityId === universityId && sel.programId === programId
    );
  };

  const getUniqueCountries = () => {
    return [...new Set(universities.map((uni) => uni.country))];
  };

  if (loading) {
    return (
      <div className='fixed inset-0 z-50 overflow-y-auto'>
        <div className='flex items-center justify-center min-h-screen px-4'>
          <div className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm' />
          <div className='relative bg-white/95 backdrop-blur-md rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-gray-200/50'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading universities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4'>
        <div
          className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
          onClick={onClose}
        />

        <div className='relative bg-white/95 backdrop-blur-md rounded-2xl max-w-6xl w-full max-h-[90vh] shadow-2xl border border-gray-200/50 flex flex-col'>
          {/* Header */}
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50 rounded-t-2xl'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                  Select Universities
                </h2>
                <p className='text-gray-600'>
                  Choose up to 5 university programs for your application
                </p>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-white/60 rounded-lg transition-colors'
              >
                <FiX className='h-6 w-6 text-gray-600' />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='p-6 border-b border-gray-200/50'>
            <div className='flex gap-4 mb-4'>
              <div className='flex-1 relative'>
                <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                <input
                  type='text'
                  placeholder='Search universities or programs...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 border border-gray-300 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiFilter className='h-5 w-5' />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                  >
                    <option value=''>All Countries</option>
                    {getUniqueCountries().map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Program
                  </label>
                  <input
                    type='text'
                    placeholder='Filter by program name...'
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                  />
                </div>
              </div>
            )}

            {/* Selected Count */}
            <div className='mt-4'>
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-200'>
                <FiCheck className='h-4 w-4' />
                {selectedUniversities.length}/5 Selected
              </span>
            </div>
          </div>

          {/* University List */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-6'>
              {filteredUniversities.map((university) => (
                <div
                  key={university.id}
                  className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50'
                >
                  <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200/50'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-100 rounded-lg'>
                        {/* <FiGraduationCap className='h-6 w-6 text-blue-600' /> */}
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {university.universityName}
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <FiMapPin className='h-4 w-4' />
                          {university.country}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-4'>
                    <div className='grid gap-3'>
                      {university.programs.map((program) => {
                        const isSelected = isProgramSelected(
                          university.id,
                          program.id
                        );

                        return (
                          <div
                            key={program.id}
                            onClick={() =>
                              handleProgramSelect(university, program)
                            }
                            className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                          >
                            <div className='flex-1'>
                              <div className='flex items-center gap-3 mb-2'>
                                <FiBookOpen className='h-5 w-5 text-blue-600' />
                                <h4 className='font-medium text-gray-900'>
                                  {program.name}
                                </h4>
                                {isSelected && (
                                  <div className='p-1 bg-blue-500 rounded-full'>
                                    <FiCheck className='h-3 w-3 text-white' />
                                  </div>
                                )}
                              </div>

                              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                                <div className='flex items-center gap-2'>
                                  <FiDollarSign className='h-4 w-4' />
                                  <span>{program.fees}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <FiClock className='h-4 w-4' />
                                  <span>{program.duration}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <FiCalendar className='h-4 w-4' />
                                  <span>{program.intakes.join(', ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {filteredUniversities.length === 0 && (
                <div className='text-center py-16'>
                  <div className='p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
                    <FiGlobe className='h-12 w-12 text-gray-400' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    No Universities Found
                  </h3>
                  <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                    Try adjusting your search criteria or filters to find
                    universities.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-200/50 bg-gray-50/50'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                {selectedUniversities.length > 0 && (
                  <span>
                    Selected {selectedUniversities.length} program
                    {selectedUniversities.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={onClose}
                  className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedUniversities.length === 0 || saving}
                  className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {saving ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className='h-4 w-4' />
                      Save Selection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversitySelection;
