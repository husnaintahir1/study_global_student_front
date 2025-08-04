import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import {
  applicationService,
  University,
  Program,
  UniversitySelection,
  Application,
} from '../services/ApplicationProcessService';
import {
  validateUniversitySelection,
  parseApiError,
} from '../utils/applicationUtils';

interface SelectedUniversity extends UniversitySelection {
  tempId: string; // For React keys and local state management
}

const UniversitySelector: React.FC = () => {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // State Management
  const [application, setApplication] = useState<Application | null>(null);
  const [availableUniversities, setAvailableUniversities] = useState<
    University[]
  >([]);
  const [selectedUniversities, setSelectedUniversities] = useState<
    SelectedUniversity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [showBrowser, setShowBrowser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState<
    University[]
  >([]);

  // Load application and universities
  const loadData = async () => {
    if (!applicationId) {
      setError('Application ID is required');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [appResponse, universitiesResponse] = await Promise.all([
        applicationService.getApplicationById(applicationId),
        applicationService.getUniversities(),
      ]);

      setApplication(appResponse.application); // Updated to use response.application
      setAvailableUniversities(universitiesResponse.universities);

      // Convert existing selections to local state with temp IDs
      const existingSelections: SelectedUniversity[] =
        appResponse.application.universitySelections.map(
          (selection, index) => ({
            ...selection,
            tempId: `existing-${index}`,
          })
        );
      setSelectedUniversities(existingSelections);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, [applicationId]);

  // Filter available universities
  useEffect(() => {
    let filtered = availableUniversities;

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
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
    if (countryFilter) {
      filtered = filtered.filter(
        (university) => university.country === countryFilter
      );
    }

    setFilteredUniversities(filtered);
  }, [availableUniversities, searchTerm, countryFilter]);

  // Get available countries for filter
  const availableCountries = [
    ...new Set(availableUniversities.map((u) => u.country)),
  ].sort();

  // Check if university/program is already selected
  const isAlreadySelected = (
    universityId: number,
    programId: number
  ): boolean => {
    return selectedUniversities.some(
      (sel) => sel.universityId === universityId && sel.programId === programId
    );
  };

  // Add university selection
  const addUniversitySelection = (university: University, program: Program) => {
    if (selectedUniversities.length >= 5) {
      setError('Maximum 5 universities allowed');
      return;
    }

    if (isAlreadySelected(university.id, program.id)) {
      setError('This university and program combination is already selected');
      return;
    }

    const newSelection: SelectedUniversity = {
      universityId: university.id,
      universityName: university.universityName,
      programId: program.id,
      programName: program.name,
      country: university.country,
      fees: program.fees,
      duration: program.duration,
      intakes: program.intakes,
      selectedIntake: program.intakes[0] || '', // Default to first intake
      priority: selectedUniversities.length + 1,
      tempId: `new-${Date.now()}-${university.id}-${program.id}`,
    };

    setSelectedUniversities((prev) => [...prev, newSelection]);
    setShowBrowser(false);
    setError(null);
  };

  // Remove university selection
  const removeUniversitySelection = (tempId: string) => {
    setSelectedUniversities((prev) => {
      const filtered = prev.filter((sel) => sel.tempId !== tempId);
      // Recalculate priorities
      return filtered.map((sel, index) => ({
        ...sel,
        priority: index + 1,
      }));
    });
  };

  // Update selected intake
  const updateSelectedIntake = (tempId: string, intake: string) => {
    setSelectedUniversities((prev) =>
      prev.map((sel) =>
        sel.tempId === tempId ? { ...sel, selectedIntake: intake } : sel
      )
    );
  };

  // Move university up in priority
  const moveUniversityUp = (tempId: string) => {
    setSelectedUniversities((prev) => {
      const index = prev.findIndex((sel) => sel.tempId === tempId);
      if (index <= 0) return prev;

      const newList = [...prev];
      [newList[index - 1], newList[index]] = [
        newList[index],
        newList[index - 1],
      ];

      // Update priorities
      return newList.map((sel, idx) => ({
        ...sel,
        priority: idx + 1,
      }));
    });
  };

  // Move university down in priority
  const moveUniversityDown = (tempId: string) => {
    setSelectedUniversities((prev) => {
      const index = prev.findIndex((sel) => sel.tempId === tempId);
      if (index >= prev.length - 1) return prev;

      const newList = [...prev];
      [newList[index], newList[index + 1]] = [
        newList[index + 1],
        newList[index],
      ];

      // Update priorities
      return newList.map((sel, idx) => ({
        ...sel,
        priority: idx + 1,
      }));
    });
  };

  // Save selections
  const handleSave = async () => {
    if (!applicationId) return;

    const validationError = validateUniversitySelection(selectedUniversities);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Remove tempId before sending to API
      const selectionsToSave = selectedUniversities.map(
        ({ tempId, ...selection }) => selection
      );

      await applicationService.selectUniversities(applicationId, {
        universitySelections: selectionsToSave,
      });

      // Navigate back to application details
      navigate(`/applications/${applicationId}`);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (applicationId) {
      navigate(`/applications/${applicationId}`);
    } else {
      navigate('/applications');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-8'>
          <div className='bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center'>
            <div className='animate-pulse space-y-4'>
              <div className='h-8 bg-gray-200 rounded w-64 mx-auto'></div>
              <div className='h-4 bg-gray-200 rounded w-48 mx-auto'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-8'>
          <div className='bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Application ID Required
            </h3>
            <p className='text-gray-600 mb-4'>
              Please select an application to manage universities.
            </p>
            <button
              onClick={() => navigate('/applications')}
              className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
            >
              Back to Applications
            </button>
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
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={handleCancel}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              title='Go Back'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Select Universities
              </h1>
              <p className='text-lg text-gray-600 mt-2'>
                {application?.notes ||
                  `Application ${application?.id.slice(-8).toUpperCase()}`}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-600'>
              {selectedUniversities.length}/5 selected
            </span>
            <button
              onClick={handleSave}
              disabled={saving || selectedUniversities.length === 0}
              className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {saving ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4' />
                  Save Selections
                </>
              )}
            </button>
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

        {/* Selected Universities */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                  Selected Universities
                </h2>
                <p className='text-gray-600'>
                  {selectedUniversities.length === 0
                    ? 'No universities selected yet. Add universities below.'
                    : `${selectedUniversities.length} universities selected. You can select up to 5.`}
                </p>
              </div>
              <button
                onClick={() => setShowBrowser(true)}
                disabled={selectedUniversities.length >= 5}
                className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                Add University
              </button>
            </div>
          </div>

          <div className='p-6'>
            {selectedUniversities.length === 0 ? (
              /* Empty State */
              <div className='text-center py-12'>
                <div className='p-6 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                  <Plus className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No Universities Selected
                </h3>
                <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                  Start by adding universities to your application. You can
                  select up to 5 universities.
                </p>
                <button
                  onClick={() => setShowBrowser(true)}
                  className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
                >
                  Browse Universities
                </button>
              </div>
            ) : (
              /* Selected Universities List */
              <div className='space-y-4'>
                {selectedUniversities.map((selection, index) => (
                  <div
                    key={selection.tempId}
                    className='border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-start gap-4'>
                          {/* Priority Badge */}
                          <div className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium min-w-max'>
                            #{selection.priority}
                          </div>

                          <div className='flex-1'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                              {selection.universityName}
                            </h3>
                            <h4 className='text-purple-600 font-medium mb-3'>
                              {selection.programName}
                            </h4>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <MapPin className='h-4 w-4' />
                                <span>{selection.country}</span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <DollarSign className='h-4 w-4' />
                                <span>{selection.fees}</span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <Clock className='h-4 w-4' />
                                <span>{selection.duration}</span>
                              </div>
                            </div>

                            {/* Intake Selection */}
                            <div className='flex items-center gap-3'>
                              <Calendar className='h-4 w-4 text-gray-500' />
                              <label className='text-sm font-medium text-gray-700'>
                                Selected Intake:
                              </label>
                              <select
                                value={selection.selectedIntake}
                                onChange={(e) =>
                                  updateSelectedIntake(
                                    selection.tempId,
                                    e.target.value
                                  )
                                }
                                className='px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                              >
                                <option value=''>Select intake</option>
                                {selection.intakes.map((intake) => (
                                  <option key={intake} value={intake}>
                                    {intake}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex items-center gap-2 ml-4'>
                        <button
                          onClick={() => moveUniversityUp(selection.tempId)}
                          disabled={index === 0}
                          className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          title='Move Up'
                        >
                          <ArrowUp className='h-4 w-4' />
                        </button>

                        <button
                          onClick={() => moveUniversityDown(selection.tempId)}
                          disabled={index === selectedUniversities.length - 1}
                          className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          title='Move Down'
                        >
                          <ArrowDown className='h-4 w-4' />
                        </button>

                        <button
                          onClick={() =>
                            removeUniversitySelection(selection.tempId)
                          }
                          className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                          title='Remove'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* University Browser Modal */}
        {showBrowser && (
          <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex items-start justify-center min-h-screen px-4 pt-16 pb-20'>
              <div
                className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
                onClick={() => setShowBrowser(false)}
              />

              <div className='relative bg-white/95 backdrop-blur-md rounded-2xl max-w-5xl w-full shadow-2xl border border-gray-200/50'>
                {/* Modal Header */}
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-2xl font-semibold text-gray-900'>
                      Add Universities
                    </h3>
                    <button
                      onClick={() => setShowBrowser(false)}
                      className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      <X className='h-5 w-5' />
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className='p-6 border-b border-gray-200/50'>
                  <div className='flex gap-4'>
                    <div className='flex-1 relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search universities or programs...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                      />
                    </div>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                    >
                      <option value=''>All Countries</option>
                      {availableCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Universities List */}
                <div className='p-6 max-h-96 overflow-y-auto'>
                  <div className='space-y-4'>
                    {filteredUniversities.map((university) => (
                      <div
                        key={university.id}
                        className='border border-gray-200 rounded-xl p-4'
                      >
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          {university.universityName}
                        </h4>
                        <p className='text-sm text-gray-600 mb-3 flex items-center gap-1'>
                          <MapPin className='h-3 w-3' />
                          {university.country}
                        </p>

                        <div className='space-y-2'>
                          {university.programs.map((program) => (
                            <div
                              key={program.id}
                              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                            >
                              <div className='flex-1'>
                                <h5 className='font-medium text-gray-900'>
                                  {program.name}
                                </h5>
                                <div className='flex items-center gap-4 text-xs text-gray-600 mt-1'>
                                  <span>{program.fees}</span>
                                  <span>{program.duration}</span>
                                  <span>
                                    Intakes: {program.intakes.join(', ')}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  addUniversitySelection(university, program)
                                }
                                disabled={isAlreadySelected(
                                  university.id,
                                  program.id
                                )}
                                className='px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                              >
                                {isAlreadySelected(university.id, program.id)
                                  ? 'Selected'
                                  : 'Add'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitySelector;
