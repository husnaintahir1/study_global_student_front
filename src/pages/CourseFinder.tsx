import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiGlobe,
  FiBook,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiClock,
  FiBookmark,
  FiHeart,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiGrid,
  FiList,
  FiArrowRight,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiRefreshCw,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Mock data for countries, universities, subjects, etc.
const COUNTRIES = [
  { id: 'us', name: 'United States', flag: '🇺🇸', universities: 245 },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', universities: 189 },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', universities: 156 },
  { id: 'au', name: 'Australia', flag: '🇦🇺', universities: 134 },
  { id: 'de', name: 'Germany', flag: '🇩🇪', universities: 198 },
  { id: 'fr', name: 'France', flag: '🇫🇷', universities: 167 },
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱', universities: 87 },
  { id: 'ie', name: 'Ireland', flag: '🇮🇪', universities: 45 },
];

const STUDY_LEVELS = [
  { id: 'bachelor', name: "Bachelor's Degree", count: 45623 },
  { id: 'master', name: "Master's Degree", count: 38947 },
  { id: 'phd', name: 'PhD / Doctorate', count: 15234 },
  { id: 'certificate', name: 'Certificate', count: 8965 },
  { id: 'diploma', name: 'Diploma', count: 6743 },
];

const SUBJECT_AREAS = [
  { id: 'business', name: 'Business & Management', count: 12453, icon: '💼' },
  {
    id: 'engineering',
    name: 'Engineering & Technology',
    count: 11234,
    icon: '⚙️',
  },
  { id: 'computer', name: 'Computer Science & IT', count: 9876, icon: '💻' },
  { id: 'medicine', name: 'Medicine & Health', count: 8765, icon: '🏥' },
  { id: 'arts', name: 'Arts & Humanities', count: 7654, icon: '🎨' },
  { id: 'science', name: 'Natural Sciences', count: 6543, icon: '🔬' },
  { id: 'social', name: 'Social Sciences', count: 5432, icon: '👥' },
  { id: 'law', name: 'Law & Legal Studies', count: 4321, icon: '⚖️' },
];

const LANGUAGES = [
  { id: 'en', name: 'English', count: 89456 },
  { id: 'de', name: 'German', count: 12345 },
  { id: 'fr', name: 'French', count: 8765 },
  { id: 'es', name: 'Spanish', count: 6543 },
  { id: 'it', name: 'Italian', count: 4321 },
];

const DURATIONS = [
  { id: '1', name: '1 Year', count: 15234 },
  { id: '2', name: '2 Years', count: 23456 },
  { id: '3', name: '3 Years', count: 34567 },
  { id: '4', name: '4 Years', count: 18765 },
  { id: '5+', name: '5+ Years', count: 6543 },
];

const MOCK_COURSES = [
  {
    id: 1,
    title: 'Master of Science in Computer Science',
    university: 'Stanford University',
    location: 'California, United States',
    country: 'us',
    level: 'master',
    subject: 'computer',
    duration: '2 Years',
    language: 'English',
    tuitionFee: 58416,
    currency: 'USD',
    startDate: 'September 2025',
    deadline: 'December 15, 2024',
    rating: 4.8,
    reviews: 342,
    scholarships: true,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop',
    description:
      'Advanced program in computer science with specializations in AI, machine learning, and software engineering.',
    requirements: ["Bachelor's degree", 'GRE scores', 'TOEFL/IELTS'],
    tags: ['AI', 'Machine Learning', 'Software Engineering'],
  },
  {
    id: 2,
    title: 'Bachelor of Business Administration',
    university: 'London Business School',
    location: 'London, United Kingdom',
    country: 'uk',
    level: 'bachelor',
    subject: 'business',
    duration: '3 Years',
    language: 'English',
    tuitionFee: 45000,
    currency: 'GBP',
    startDate: 'October 2025',
    deadline: 'January 20, 2025',
    rating: 4.6,
    reviews: 289,
    scholarships: true,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop',
    description:
      'Comprehensive business program covering management, finance, marketing, and entrepreneurship.',
    requirements: ['High school diploma', 'SAT/ACT scores', 'IELTS'],
    tags: ['Management', 'Finance', 'Marketing'],
  },
  {
    id: 3,
    title: 'Master of Engineering in Renewable Energy',
    university: 'Technical University of Munich',
    location: 'Munich, Germany',
    country: 'de',
    level: 'master',
    subject: 'engineering',
    duration: '2 Years',
    language: 'English',
    tuitionFee: 0,
    currency: 'EUR',
    startDate: 'April 2025',
    deadline: 'February 28, 2025',
    rating: 4.7,
    reviews: 156,
    scholarships: true,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=200&fit=crop',
    description:
      'Focus on sustainable energy technologies, solar power, wind energy, and energy storage systems.',
    requirements: ["Bachelor's in Engineering", 'TOEFL/IELTS', 'GRE'],
    tags: ['Renewable Energy', 'Sustainability', 'Green Tech'],
  },
  // Add more mock courses...
];

export const CourseFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    countries: [],
    levels: [],
    subjects: [],
    languages: [],
    durations: [],
    tuitionRange: [0, 100000],
    startDate: '',
    hasScholarships: false,
    featuredOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [filteredCourses, setFilteredCourses] = useState(MOCK_COURSES);
  const [savedCourses, setSavedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    countries: true,
    levels: true,
    subjects: true,
    languages: false,
    durations: false,
  });

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, sortBy]);

  const applyFilters = () => {
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      let filtered = MOCK_COURSES.filter((course) => {
        // Search query filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !course.title.toLowerCase().includes(query) &&
            !course.university.toLowerCase().includes(query) &&
            !course.location.toLowerCase().includes(query) &&
            !course.subject.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        // Country filter
        if (
          filters.countries.length > 0 &&
          !filters.countries.includes(course.country)
        ) {
          return false;
        }

        // Level filter
        if (
          filters.levels.length > 0 &&
          !filters.levels.includes(course.level)
        ) {
          return false;
        }

        // Subject filter
        if (
          filters.subjects.length > 0 &&
          !filters.subjects.includes(course.subject)
        ) {
          return false;
        }

        // Language filter
        if (
          filters.languages.length > 0 &&
          !filters.languages.includes(course.language.toLowerCase())
        ) {
          return false;
        }

        // Tuition range filter
        if (
          course.tuitionFee < filters.tuitionRange[0] ||
          course.tuitionFee > filters.tuitionRange[1]
        ) {
          return false;
        }

        // Scholarship filter
        if (filters.hasScholarships && !course.scholarships) {
          return false;
        }

        // Featured filter
        if (filters.featuredOnly && !course.featured) {
          return false;
        }

        return true;
      });

      // Apply sorting
      switch (sortBy) {
        case 'tuition-low':
          filtered.sort((a, b) => a.tuitionFee - b.tuitionFee);
          break;
        case 'tuition-high':
          filtered.sort((a, b) => b.tuitionFee - a.tuitionFee);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'deadline':
          filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
          break;
        default:
          // Keep original order for relevance
          break;
      }

      setFilteredCourses(filtered);
      setIsLoading(false);
    }, 500);
  };

  const toggleFilter = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      countries: [],
      levels: [],
      subjects: [],
      languages: [],
      durations: [],
      tuitionRange: [0, 100000],
      startDate: '',
      hasScholarships: false,
      featuredOnly: false,
    });
    setSearchQuery('');
  };

  const toggleSavedCourse = (courseId) => {
    setSavedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const FilterSection = ({
    title,
    items,
    category,
    isExpanded,
    icon: Icon,
  }) => (
    <div className='border-b border-gray-200 pb-4 mb-4'>
      <button
        onClick={() => toggleSection(category)}
        className='flex items-center justify-between w-full text-left mb-3'
      >
        <div className='flex items-center gap-2'>
          {Icon && <Icon className='h-4 w-4 text-gray-500' />}
          <span className='font-medium text-gray-900'>{title}</span>
        </div>
        {isExpanded ? (
          <FiChevronUp className='h-4 w-4 text-gray-500' />
        ) : (
          <FiChevronDown className='h-4 w-4 text-gray-500' />
        )}
      </button>

      {isExpanded && (
        <div className='space-y-2 max-h-48 overflow-y-auto'>
          {items.map((item) => (
            <label
              key={item.id}
              className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
            >
              <input
                type='checkbox'
                checked={filters[category].includes(item.id)}
                onChange={() => toggleFilter(category, item.id)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <div className='flex items-center gap-2 flex-1'>
                {item.flag && <span className='text-lg'>{item.flag}</span>}
                {item.icon && <span className='text-lg'>{item.icon}</span>}
                <span className='text-sm text-gray-700'>{item.name}</span>
              </div>
              <span className='text-xs text-gray-500'>
                {item.count || item.universities}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const CourseCard = ({ course, isListView = false }) => (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
        isListView ? 'flex' : ''
      }`}
    >
      {course.featured && (
        <div className='absolute top-4 left-4 z-10'>
          <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
            <FiStar className='h-3 w-3' />
            Featured
          </span>
        </div>
      )}

      <div className={`relative ${isListView ? 'w-64 flex-shrink-0' : ''}`}>
        <img
          src={course.image}
          alt={course.title}
          className={`w-full object-cover ${isListView ? 'h-full' : 'h-48'}`}
        />
        <button
          onClick={() => toggleSavedCourse(course.id)}
          className='absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all'
        >
          <FiHeart
            className={`h-4 w-4 ${
              savedCourses.includes(course.id)
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      <div className={`p-6 ${isListView ? 'flex-1' : ''}`}>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
              {course.title}
            </h3>
            <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
              <FiMapPin className='h-4 w-4' />
              <span>{course.university}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <FiGlobe className='h-4 w-4' />
              <span>{course.location}</span>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <FiStar className='h-4 w-4 text-yellow-500 fill-current' />
            <span className='text-sm font-medium text-gray-900'>
              {course.rating}
            </span>
            <span className='text-xs text-gray-500'>({course.reviews})</span>
          </div>
        </div>

        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
          {course.description}
        </p>

        <div className='flex flex-wrap gap-2 mb-4'>
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
            >
              {tag}
            </span>
          ))}
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
          <div className='flex items-center gap-2'>
            <FiClock className='h-4 w-4 text-gray-500' />
            <span className='text-gray-600'>{course.duration}</span>
          </div>
          <div className='flex items-center gap-2'>
            <FiCalendar className='h-4 w-4 text-gray-500' />
            <span className='text-gray-600'>{course.startDate}</span>
          </div>
          <div className='flex items-center gap-2'>
            <FiDollarSign className='h-4 w-4 text-gray-500' />
            <span className='text-gray-600'>
              {course.tuitionFee === 0
                ? 'Free'
                : `${course.currency} ${course.tuitionFee.toLocaleString()}`}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <FiBook className='h-4 w-4 text-gray-500' />
            <span className='text-gray-600'>{course.language}</span>
          </div>
        </div>

        {course.scholarships && (
          <div className='flex items-center gap-2 mb-4'>
            <FiAward className='h-4 w-4 text-green-600' />
            <span className='text-sm text-green-600 font-medium'>
              Scholarships Available
            </span>
          </div>
        )}

        <div className='flex gap-3'>
          <Link
            to={`/courses/${course.id}`}
            className='flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2'
          >
            View Details
            <FiArrowRight className='h-4 w-4' />
          </Link>
          <button className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
            <FiBookmark className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background Decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-6 py-8'>
        {/* Header */}
        <div className='mb-8 mt-5'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
            Find Your Perfect Course
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl'>
            Discover from over 100,000+ courses from top universities worldwide.
            Your dream education is just a search away.
          </p>
        </div>

        {/* Search Bar */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8'>
          <div className='flex gap-4'>
            <div className='flex-1 relative'>
              <FiSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search courses, universities, or subjects...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiFilter className='h-4 w-4' />
              Filters
              {filters.countries.length +
                filters.levels.length +
                filters.subjects.length >
                0 && (
                <span className='bg-white/20 text-xs px-2 py-1 rounded-full'>
                  {filters.countries.length +
                    filters.levels.length +
                    filters.subjects.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className='flex gap-8'>
          {/* Filters Sidebar */}
          {showFilters && (
            <div className='w-80 flex-shrink-0'>
              <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-8'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Filters
                  </h3>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={clearFilters}
                      className='text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1'
                    >
                      <FiRefreshCw className='h-3 w-3' />
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className='p-1 text-gray-400 hover:text-gray-600'
                    >
                      <FiX className='h-4 w-4' />
                    </button>
                  </div>
                </div>

                <div className='space-y-6 max-h-96 overflow-y-auto'>
                  <FilterSection
                    title='Countries'
                    items={COUNTRIES}
                    category='countries'
                    isExpanded={expandedSections.countries}
                    icon={FiGlobe}
                  />

                  <FilterSection
                    title='Study Level'
                    items={STUDY_LEVELS}
                    category='levels'
                    isExpanded={expandedSections.levels}
                    icon={FiAward}
                  />

                  <FilterSection
                    title='Subject Areas'
                    items={SUBJECT_AREAS}
                    category='subjects'
                    isExpanded={expandedSections.subjects}
                    icon={FiBook}
                  />

                  <FilterSection
                    title='Languages'
                    items={LANGUAGES}
                    category='languages'
                    isExpanded={expandedSections.languages}
                  />

                  <FilterSection
                    title='Duration'
                    items={DURATIONS}
                    category='durations'
                    isExpanded={expandedSections.durations}
                    icon={FiClock}
                  />

                  {/* Additional Filters */}
                  <div className='border-b border-gray-200 pb-4'>
                    <h4 className='font-medium text-gray-900 mb-3'>
                      Additional Options
                    </h4>
                    <div className='space-y-2'>
                      <label className='flex items-center gap-3 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={filters.hasScholarships}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              hasScholarships: e.target.checked,
                            }))
                          }
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700'>
                          Scholarships Available
                        </span>
                      </label>
                      <label className='flex items-center gap-3 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={filters.featuredOnly}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              featuredOnly: e.target.checked,
                            }))
                          }
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700'>
                          Featured Courses Only
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className='flex-1'>
            {/* Results Header */}
            <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {isLoading
                      ? 'Searching...'
                      : `${filteredCourses.length.toLocaleString()} courses found`}
                  </h2>
                  {searchQuery && (
                    <p className='text-sm text-gray-600'>
                      Results for "{searchQuery}"
                    </p>
                  )}
                </div>

                <div className='flex items-center gap-4'>
                  {/* View Mode Toggle */}
                  <div className='flex border border-gray-300 rounded-lg'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${
                        viewMode === 'grid'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <FiGrid className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${
                        viewMode === 'list'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <FiList className='h-4 w-4' />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300'
                  >
                    <option value='relevance'>Sort by Relevance</option>
                    <option value='rating'>Highest Rated</option>
                    <option value='tuition-low'>Tuition: Low to High</option>
                    <option value='tuition-high'>Tuition: High to Low</option>
                    <option value='deadline'>Application Deadline</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {filters.countries.length +
                filters.levels.length +
                filters.subjects.length +
                filters.languages.length >
                0 && (
                <div className='flex flex-wrap gap-2'>
                  {filters.countries.map((countryId) => {
                    const country = COUNTRIES.find((c) => c.id === countryId);
                    return (
                      <span
                        key={countryId}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
                      >
                        {country?.flag} {country?.name}
                        <button
                          onClick={() => toggleFilter('countries', countryId)}
                          className='text-blue-600 hover:text-blue-800'
                        >
                          <FiX className='h-3 w-3' />
                        </button>
                      </span>
                    );
                  })}
                  {filters.levels.map((levelId) => {
                    const level = STUDY_LEVELS.find((l) => l.id === levelId);
                    return (
                      <span
                        key={levelId}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full'
                      >
                        {level?.name}
                        <button
                          onClick={() => toggleFilter('levels', levelId)}
                          className='text-green-600 hover:text-green-800'
                        >
                          <FiX className='h-3 w-3' />
                        </button>
                      </span>
                    );
                  })}
                  {filters.subjects.map((subjectId) => {
                    const subject = SUBJECT_AREAS.find(
                      (s) => s.id === subjectId
                    );
                    return (
                      <span
                        key={subjectId}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full'
                      >
                        {subject?.icon} {subject?.name}
                        <button
                          onClick={() => toggleFilter('subjects', subjectId)}
                          className='text-purple-600 hover:text-purple-800'
                        >
                          <FiX className='h-3 w-3' />
                        </button>
                      </span>
                    );
                  })}
                  {filters.languages.map((langId) => {
                    const language = LANGUAGES.find((l) => l.id === langId);
                    return (
                      <span
                        key={langId}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full'
                      >
                        {language?.name}
                        <button
                          onClick={() => toggleFilter('languages', langId)}
                          className='text-orange-600 hover:text-orange-800'
                        >
                          <FiX className='h-3 w-3' />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <span className='ml-3 text-gray-600'>Searching courses...</span>
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <>
                {filteredCourses.length > 0 ? (
                  <div
                    className={
                      viewMode === 'grid'
                        ? `grid gap-6 ${
                            showFilters
                              ? 'grid-cols-1 lg:grid-cols-2'
                              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                          }`
                        : 'space-y-6'
                    }
                  >
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isListView={viewMode === 'list'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-16'>
                    <div className='p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
                      <FiSearch className='h-12 w-12 text-gray-400' />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      No courses found
                    </h3>
                    <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                      Try adjusting your search criteria or clearing some
                      filters to see more results.
                    </p>
                    <button
                      onClick={clearFilters}
                      className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all'
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Load More Button */}
                {filteredCourses.length > 0 && filteredCourses.length >= 20 && (
                  <div className='text-center mt-12'>
                    <button className='bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto'>
                      Load More Courses
                      <FiArrowRight className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className='mt-16 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl p-8 border border-gray-200/50'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-6 text-center'>
            Discover Your Perfect Match
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='p-4 bg-blue-100 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <FiBook className='h-8 w-8 text-blue-600' />
              </div>
              <p className='text-2xl font-bold text-gray-900'>100,000+</p>
              <p className='text-sm text-gray-600'>Courses Available</p>
            </div>
            <div className='text-center'>
              <div className='p-4 bg-green-100 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <FiGlobe className='h-8 w-8 text-green-600' />
              </div>
              <p className='text-2xl font-bold text-gray-900'>900+</p>
              <p className='text-sm text-gray-600'>Universities</p>
            </div>
            <div className='text-center'>
              <div className='p-4 bg-purple-100 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <FiMapPin className='h-8 w-8 text-purple-600' />
              </div>
              <p className='text-2xl font-bold text-gray-900'>35+</p>
              <p className='text-sm text-gray-600'>Countries</p>
            </div>
            <div className='text-center'>
              <div className='p-4 bg-orange-100 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center'>
                <FiUsers className='h-8 w-8 text-orange-600' />
              </div>
              <p className='text-2xl font-bold text-gray-900'>1M+</p>
              <p className='text-sm text-gray-600'>Students Helped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
