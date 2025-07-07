import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiStar,
  FiHeart,
  FiShare2,
  FiDownload,
  FiExternalLink,
  FiUsers,
  FiAward,
  FiBook,
  FiGlobe,
  FiCheck,
  FiX,
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiBookmark,
  FiTrendingUp,
  //   FiBarChart3,
  //   FiGraduationCap,
  FiBriefcase,
  FiTarget,
  FiFileText,
  FiVideo,
  FiImage,
  FiPlay,
} from 'react-icons/fi';

// Mock detailed course data
const MOCK_COURSE_DETAIL = {
  id: 1,
  title: 'Master of Science in Computer Science',
  university: {
    name: 'Stanford University',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop',
    location: 'California, United States',
    ranking: 2,
    type: 'Public Research University',
    website: 'https://stanford.edu',
    established: 1885,
  },
  images: [
    'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
  ],
  level: "Master's Degree",
  subject: 'Computer Science & IT',
  duration: '2 Years',
  language: 'English',
  tuitionFee: 58416,
  currency: 'USD',
  startDate: 'September 2025',
  applicationDeadline: 'December 15, 2024',
  rating: 4.8,
  reviews: 342,
  scholarship: true,
  featured: true,
  studyMode: 'Full-time',
  credits: 120,

  overview:
    'This comprehensive Master of Science in Computer Science program at Stanford University is designed for students who want to advance their careers in technology. The program covers cutting-edge topics in artificial intelligence, machine learning, software engineering, and computer systems.',

  keyFeatures: [
    'World-class faculty with industry experience',
    'Access to Silicon Valley tech ecosystem',
    'State-of-the-art research facilities',
    'Internship opportunities with top tech companies',
    'Flexible curriculum with specialization tracks',
    'Strong alumni network in tech industry',
  ],

  curriculum: {
    coreModules: [
      { name: 'Advanced Algorithms', credits: 3, semester: 1 },
      { name: 'Machine Learning', credits: 3, semester: 1 },
      { name: 'Software Engineering', credits: 3, semester: 1 },
      { name: 'Computer Systems', credits: 3, semester: 2 },
      { name: 'Artificial Intelligence', credits: 3, semester: 2 },
      { name: 'Database Systems', credits: 3, semester: 2 },
    ],
    electiveModules: [
      { name: 'Deep Learning', credits: 3 },
      { name: 'Computer Vision', credits: 3 },
      { name: 'Natural Language Processing', credits: 3 },
      { name: 'Robotics', credits: 3 },
      { name: 'Cybersecurity', credits: 3 },
      { name: 'Human-Computer Interaction', credits: 3 },
    ],
  },

  admissionRequirements: {
    academic: [
      "Bachelor's degree in Computer Science or related field",
      'Minimum GPA of 3.5/4.0',
      'Strong background in mathematics and programming',
    ],
    tests: [
      'GRE General Test (minimum 320)',
      'TOEFL iBT (minimum 100) or IELTS (minimum 7.0)',
    ],
    documents: [
      'Statement of Purpose',
      'Three letters of recommendation',
      'Official transcripts',
      'Resume/CV',
      'Portfolio (optional but recommended)',
    ],
  },

  costs: {
    tuition: 58416,
    livingExpenses: 25000,
    books: 1500,
    insurance: 3000,
    miscellaneous: 2000,
    total: 89916,
  },

  scholarships: [
    {
      name: 'Stanford Graduate Fellowship',
      amount: 45000,
      coverage: 'Full tuition + stipend',
      criteria: 'Academic excellence',
    },
    {
      name: 'Diversity in Tech Scholarship',
      amount: 25000,
      coverage: 'Partial tuition',
      criteria: 'Underrepresented groups',
    },
    {
      name: 'International Student Aid',
      amount: 20000,
      coverage: 'Partial tuition',
      criteria: 'Financial need',
    },
  ],

  careerOutcomes: {
    employmentRate: 98,
    averageSalary: 165000,
    topEmployers: ['Google', 'Apple', 'Microsoft', 'Meta', 'Amazon', 'Tesla'],
    jobTitles: [
      'Software Engineer',
      'Machine Learning Engineer',
      'Data Scientist',
      'Research Scientist',
      'Product Manager',
      'Technical Lead',
    ],
  },

  campusLife: {
    studentBody: 17000,
    internationalStudents: 22,
    facultyRatio: '7:1',
    clubs: 650,
    facilities: [
      'Modern libraries and research centers',
      'Recreation facilities and sports complexes',
      'Student housing options',
      'Dining halls and cafeterias',
      'Health and wellness services',
    ],
  },

  applicationProcess: [
    {
      step: 1,
      title: 'Complete Online Application',
      description: 'Fill out the Stanford graduate application form',
    },
    {
      step: 2,
      title: 'Submit Documents',
      description: 'Upload all required documents and test scores',
    },
    {
      step: 3,
      title: 'Pay Application Fee',
      description: '$125 non-refundable application fee',
    },
    {
      step: 4,
      title: 'Interview (if required)',
      description: 'Some programs may require an interview',
    },
    {
      step: 5,
      title: 'Await Decision',
      description: 'Decisions typically released by March 31st',
    },
  ],
};

const SIMILAR_COURSES = [
  {
    id: 2,
    title: 'Master of Science in Data Science',
    university: 'MIT',
    location: 'Massachusetts, US',
    tuitionFee: 55000,
    currency: 'USD',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
  },
  {
    id: 3,
    title: 'MS in Artificial Intelligence',
    university: 'Carnegie Mellon',
    location: 'Pennsylvania, US',
    tuitionFee: 52000,
    currency: 'USD',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
  },
  {
    id: 4,
    title: 'MSc Computer Science',
    university: 'University of Oxford',
    location: 'Oxford, UK',
    tuitionFee: 35000,
    currency: 'GBP',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop',
  },
];

export const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourse(MOCK_COURSE_DETAIL);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>Loading course details...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Course not found
          </h2>
          <Link to='/courses' className='text-blue-600 hover:text-blue-700'>
            Back to Course Finder
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBook },
    { id: 'curriculum', label: 'Curriculum', icon: FiUsers },
    { id: 'admission', label: 'Admission', icon: FiFileText },
    { id: 'costs', label: 'Costs & Aid', icon: FiDollarSign },
    { id: 'careers', label: 'Career Outcomes', icon: FiBriefcase },
    { id: 'campus', label: 'Campus Life', icon: FiUsers },
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className='space-y-8'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Program Overview
              </h3>
              <p className='text-gray-600 leading-relaxed mb-6'>
                {course.overview}
              </p>

              <h4 className='text-lg font-semibold text-gray-900 mb-3'>
                Key Features
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {course.keyFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <FiCheck className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-600'>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-blue-50 rounded-xl p-6'>
                <FiClock className='h-8 w-8 text-blue-600 mb-3' />
                <h4 className='font-semibold text-gray-900 mb-2'>Duration</h4>
                <p className='text-gray-600'>{course.duration}</p>
              </div>
              <div className='bg-green-50 rounded-xl p-6'>
                <FiAward className='h-8 w-8 text-green-600 mb-3' />
                <h4 className='font-semibold text-gray-900 mb-2'>Credits</h4>
                <p className='text-gray-600'>{course.credits} Credits</p>
              </div>
              <div className='bg-purple-50 rounded-xl p-6'>
                <FiGlobe className='h-8 w-8 text-purple-600 mb-3' />
                <h4 className='font-semibold text-gray-900 mb-2'>Language</h4>
                <p className='text-gray-600'>{course.language}</p>
              </div>
            </div>
          </div>
        );

      case 'curriculum':
        return (
          <div className='space-y-8'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Core Modules
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {course.curriculum.coreModules.map((module, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='font-medium text-gray-900'>
                        {module.name}
                      </h4>
                      <span className='text-sm text-gray-500'>
                        {module.credits} credits
                      </span>
                    </div>
                    <span className='text-sm text-blue-600'>
                      Semester {module.semester}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Elective Modules
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {course.curriculum.electiveModules.map((module, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start'>
                      <h4 className='font-medium text-gray-900'>
                        {module.name}
                      </h4>
                      <span className='text-sm text-gray-500'>
                        {module.credits} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'admission':
        return (
          <div className='space-y-8'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Academic Requirements
              </h3>
              <div className='space-y-3'>
                {course.admissionRequirements.academic.map((req, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <FiCheck className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-600'>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Test Requirements
              </h3>
              <div className='space-y-3'>
                {course.admissionRequirements.tests.map((test, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <FiCheck className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-600'>{test}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Required Documents
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {course.admissionRequirements.documents.map((doc, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <FiFileText className='h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-600'>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Application Process
              </h3>
              <div className='space-y-4'>
                {course.applicationProcess.map((step, index) => (
                  <div key={index} className='flex gap-4'>
                    <div className='flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium'>
                      {step.step}
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {step.title}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'costs':
        return (
          <div className='space-y-8'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Cost Breakdown
              </h3>
              <div className='bg-gray-50 rounded-xl p-6'>
                <div className='space-y-4'>
                  {Object.entries(course.costs)
                    .filter(([key]) => key !== 'total')
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className='flex justify-between items-center'
                      >
                        <span className='text-gray-600 capitalize'>
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className='font-medium text-gray-900'>
                          {course.currency} {value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  <hr className='border-gray-300' />
                  <div className='flex justify-between items-center text-lg font-semibold'>
                    <span className='text-gray-900'>Total Annual Cost</span>
                    <span className='text-blue-600'>
                      {course.currency} {course.costs.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Available Scholarships
              </h3>
              <div className='space-y-4'>
                {course.scholarships.map((scholarship, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-xl p-6'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <h4 className='font-semibold text-gray-900'>
                        {scholarship.name}
                      </h4>
                      <span className='text-lg font-bold text-green-600'>
                        {course.currency} {scholarship.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className='text-gray-600 mb-2'>{scholarship.coverage}</p>
                    <span className='text-sm text-blue-600'>
                      Criteria: {scholarship.criteria}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'careers':
        return (
          <div className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-green-50 rounded-xl p-6 text-center'>
                <FiTrendingUp className='h-8 w-8 text-green-600 mx-auto mb-3' />
                <p className='text-2xl font-bold text-green-600'>
                  {course.careerOutcomes.employmentRate}%
                </p>
                <p className='text-sm text-gray-600'>Employment Rate</p>
              </div>
              <div className='bg-blue-50 rounded-xl p-6 text-center'>
                <FiDollarSign className='h-8 w-8 text-blue-600 mx-auto mb-3' />
                <p className='text-2xl font-bold text-blue-600'>
                  {course.currency}{' '}
                  {course.careerOutcomes.averageSalary.toLocaleString()}
                </p>
                <p className='text-sm text-gray-600'>Average Salary</p>
              </div>
              <div className='bg-purple-50 rounded-xl p-6 text-center'>
                <FiBriefcase className='h-8 w-8 text-purple-600 mx-auto mb-3' />
                <p className='text-2xl font-bold text-purple-600'>
                  {course.careerOutcomes.topEmployers.length}+
                </p>
                <p className='text-sm text-gray-600'>Top Employers</p>
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Top Employers
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {course.careerOutcomes.topEmployers.map((employer, index) => (
                  <div
                    key={index}
                    className='bg-white border border-gray-200 rounded-lg p-4 text-center'
                  >
                    <span className='font-medium text-gray-900'>
                      {employer}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Common Job Titles
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {course.careerOutcomes.jobTitles.map((title, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    <FiTarget className='h-4 w-4 text-blue-600 flex-shrink-0' />
                    <span className='text-gray-600'>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'campus':
        return (
          <div className='space-y-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='bg-blue-50 rounded-xl p-4 mb-3'>
                  <FiUsers className='h-8 w-8 text-blue-600 mx-auto' />
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {course.campusLife.studentBody.toLocaleString()}
                </p>
                <p className='text-sm text-gray-600'>Students</p>
              </div>
              <div className='text-center'>
                <div className='bg-green-50 rounded-xl p-4 mb-3'>
                  <FiGlobe className='h-8 w-8 text-green-600 mx-auto' />
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {course.campusLife.internationalStudents}%
                </p>
                <p className='text-sm text-gray-600'>International</p>
              </div>
              <div className='text-center'>
                <div className='bg-purple-50 rounded-xl p-4 mb-3'>
                  {/* <FiBarChart3 className='h-8 w-8 text-purple-600 mx-auto' /> */}
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {course.campusLife.facultyRatio}
                </p>
                <p className='text-sm text-gray-600'>Faculty Ratio</p>
              </div>
              <div className='text-center'>
                <div className='bg-orange-50 rounded-xl p-4 mb-3'>
                  <FiAward className='h-8 w-8 text-orange-600 mx-auto' />
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {course.campusLife.clubs}+
                </p>
                <p className='text-sm text-gray-600'>Clubs</p>
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Campus Facilities
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {course.campusLife.facilities.map((facility, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <FiCheck className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-600'>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background Decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-6 py-8'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-gray-600 mb-6'>
          <Link
            to='/courses'
            className='hover:text-blue-600 transition-colors flex items-center gap-1'
          >
            <FiArrowLeft className='h-4 w-4' />
            Course Finder
          </Link>
          <span>/</span>
          <span className='text-gray-900'>{course.title}</span>
        </div>

        {/* Hero Section */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8'>
          {/* Image Gallery */}
          <div className='relative'>
            <img
              src={course.images[activeImageIndex]}
              alt={course.title}
              className='w-full h-80 object-cover'
            />
            <div className='absolute bottom-4 left-4 flex gap-2'>
              {course.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeImageIndex ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>

            {course.featured && (
              <div className='absolute top-4 left-4'>
                <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2'>
                  <FiStar className='h-4 w-4' />
                  Featured Program
                </span>
              </div>
            )}

            <div className='absolute top-4 right-4 flex gap-2'>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className='p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all'
              >
                <FiHeart
                  className={`h-5 w-5 ${
                    isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`}
                />
              </button>
              <button className='p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all'>
                <FiShare2 className='h-5 w-5 text-gray-600' />
              </button>
            </div>
          </div>

          {/* Course Header */}
          <div className='p-8'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
              <div className='flex-1'>
                <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                  {course.title}
                </h1>

                <div className='flex items-center gap-6 mb-4'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={course.university.logo}
                      alt={course.university.name}
                      className='w-12 h-12 rounded-full object-cover'
                    />
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        {course.university.name}
                      </h3>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <FiMapPin className='h-4 w-4' />
                        <span>{course.university.location}</span>
                        <span>•</span>
                        <span>Rank #{course.university.ranking}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      <FiStar className='h-5 w-5 text-yellow-500 fill-current' />
                      <span className='font-semibold text-gray-900'>
                        {course.rating}
                      </span>
                    </div>
                    <span className='text-sm text-gray-600'>
                      ({course.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-6 text-sm text-gray-600'>
                  <div className='flex items-center gap-2'>
                    {/* <FiGraduationCap className='h-4 w-4' /> */}
                    <span>{course.level}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiClock className='h-4 w-4' />
                    <span>{course.duration}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiCalendar className='h-4 w-4' />
                    <span>Starts {course.startDate}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiBook className='h-4 w-4' />
                    <span>{course.language}</span>
                  </div>
                  {course.scholarship && (
                    <div className='flex items-center gap-2 text-green-600'>
                      <FiAward className='h-4 w-4' />
                      <span>Scholarships Available</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='lg:w-80 flex-shrink-0'>
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100'>
                  <div className='text-center mb-6'>
                    <p className='text-sm text-gray-600 mb-1'>Annual Tuition</p>
                    <p className='text-3xl font-bold text-blue-600'>
                      {course.tuitionFee === 0
                        ? 'Free'
                        : `${
                            course.currency
                          } ${course.tuitionFee.toLocaleString()}`}
                    </p>
                  </div>

                  <div className='space-y-3 mb-6 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>
                        Application Deadline:
                      </span>
                      <span className='font-medium text-gray-900'>
                        {course.applicationDeadline}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Study Mode:</span>
                      <span className='font-medium text-gray-900'>
                        {course.studyMode}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Credits:</span>
                      <span className='font-medium text-gray-900'>
                        {course.credits}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <button
                      onClick={() => setShowApplicationModal(true)}
                      className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2'
                    >
                      Apply Now
                      <FiExternalLink className='h-4 w-4' />
                    </button>

                    <button className='w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'>
                      <FiDownload className='h-4 w-4' />
                      Download Brochure
                    </button>

                    <button className='w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'>
                      <FiMessageSquare className='h-4 w-4' />
                      Contact Admissions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 mb-8'>
          <div className='flex overflow-x-auto'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className='h-4 w-4' />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-8'>
              <TabContent />
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Facts */}
            <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Facts
              </h3>
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>University Type:</span>
                  <span className='font-medium text-gray-900'>
                    {course.university.type}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Established:</span>
                  <span className='font-medium text-gray-900'>
                    {course.university.established}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Global Ranking:</span>
                  <span className='font-medium text-gray-900'>
                    #{course.university.ranking}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Subject Area:</span>
                  <span className='font-medium text-gray-900'>
                    {course.subject}
                  </span>
                </div>
              </div>

              <hr className='my-4 border-gray-200' />

              <div className='space-y-3'>
                <a
                  href={course.university.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'
                >
                  <FiExternalLink className='h-4 w-4' />
                  University Website
                </a>
                <button className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'>
                  <FiPhone className='h-4 w-4' />
                  Request Callback
                </button>
                <button className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'>
                  <FiMail className='h-4 w-4' />
                  Email Counselor
                </button>
              </div>
            </div>

            {/* Similar Courses */}
            <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Similar Courses
              </h3>
              <div className='space-y-4'>
                {SIMILAR_COURSES.map((similarCourse) => (
                  <div
                    key={similarCourse.id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                  >
                    <div className='flex gap-3'>
                      <img
                        src={similarCourse.image}
                        alt={similarCourse.title}
                        className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-900 text-sm mb-1 line-clamp-2'>
                          {similarCourse.title}
                        </h4>
                        <p className='text-xs text-gray-600 mb-2'>
                          {similarCourse.university}
                        </p>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <FiStar className='h-3 w-3 text-yellow-500 fill-current' />
                            <span className='text-xs text-gray-600'>
                              {similarCourse.rating}
                            </span>
                          </div>
                          <span className='text-xs font-medium text-blue-600'>
                            {similarCourse.currency}{' '}
                            {similarCourse.tuitionFee.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to='/courses'
                className='w-full mt-4 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'
              >
                View More Courses
                <FiArrowLeft className='h-4 w-4 rotate-180' />
              </Link>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex items-center justify-center min-h-screen px-4'>
              <div
                className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
                onClick={() => setShowApplicationModal(false)}
              />

              <div className='relative bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-200/50'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Apply to {course.title}
                  </h3>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    <FiX className='h-6 w-6' />
                  </button>
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6'>
                  <div className='flex items-start gap-3'>
                    <FiCalendar className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <h4 className='text-sm font-medium text-blue-900 mb-1'>
                        Application Deadline
                      </h4>
                      <p className='text-sm text-blue-800'>
                        {course.applicationDeadline}
                      </p>
                    </div>
                  </div>
                </div>

                <form className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        First Name
                      </label>
                      <input
                        type='text'
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                        placeholder='Enter your first name'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Last Name
                      </label>
                      <input
                        type='text'
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                        placeholder='Enter your last name'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                      placeholder='Enter your email address'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    <input
                      type='tel'
                      className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                      placeholder='Enter your phone number'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Educational Background
                    </label>
                    <select className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'>
                      <option value=''>
                        Select your highest qualification
                      </option>
                      <option value='bachelors'>Bachelor's Degree</option>
                      <option value='masters'>Master's Degree</option>
                      <option value='phd'>PhD</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Why are you interested in this program?
                    </label>
                    <textarea
                      rows={4}
                      className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none'
                      placeholder='Tell us about your motivation and goals...'
                    />
                  </div>

                  <div className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      id='terms'
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='terms' className='text-sm text-gray-600'>
                      I agree to the terms and conditions and privacy policy
                    </label>
                  </div>

                  <div className='flex gap-4'>
                    <button
                      type='button'
                      onClick={() => setShowApplicationModal(false)}
                      className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all'
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
