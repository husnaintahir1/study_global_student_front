import React, { useState, useEffect, useRef } from 'react';
import {
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiBook,
  FiGlobe,
  FiDollarSign,
  FiFileText,
  FiUpload,
  FiDownload,
} from 'react-icons/fi';
import { ProfileBuilder } from '@/components/profile/ProfileBuilder';
import { profileService } from '@/services/profile.service';
import { documentService } from '@/services/document.service';
import { StudentProfile } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

const sections = [
  { id: 'personal', title: 'Personal Details', icon: FiUser },
  { id: 'academic', title: 'Academic Background', icon: FiBook },
  { id: 'tests', title: 'Test Scores & Experience', icon: FiFileText },
  { id: 'studyPreferences', title: 'Study Preferences', icon: FiGlobe },
  { id: 'financial', title: 'Financial & Documentation', icon: FiDollarSign },
];

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['personal'])
  );
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      const status = await profileService.getReviewStatus();
      setProfile(profileData.profile);
      setReviewStatus(status);
    } catch (error) {
      console.log('No profile found');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCompletionPercentage = () => {
    if (!profile?.profileCompletionStatus) return 0;
    return profile.profileCompletionStatus.overallPercentage;
  };

  const getReviewStatusBadge = () => {
    if (!reviewStatus?.status) return null;

    const statusConfig = {
      pending: {
        icon: FiClock,
        color: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200',
        text: 'Under Review',
        tooltip: 'Your profile is currently being reviewed.',
      },
      approved: {
        icon: FiCheckCircle,
        color: 'text-green-600 bg-green-100 hover:bg-green-200',
        text: 'Approved',
        tooltip: 'Your profile has been approved.',
      },
      rejected: {
        icon: FiAlertCircle,
        color: 'text-red-600 bg-red-100 hover:bg-red-200',
        text: 'Needs Revision',
        tooltip: 'Please revise your profile based on the comments provided.',
      },
    };

    const config =
      statusConfig[reviewStatus.status as keyof typeof statusConfig];
    const Icon = config?.icon;

    return (
      config &&
      Icon && (
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${config.color} transition-colors duration-200 cursor-pointer relative group`}
          title={config.tooltip}
        >
          <Icon className='h-5 w-5 mr-2' />
          {config.text}
          <span className='absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -top-10 left-1/2 transform -translate-x-1/2'>
            {config.tooltip}
          </span>
        </div>
      )
    );
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfUrl = await profileService.generateProfilePDF();
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'student_profile.pdf';
      link.click();
      toast.success('Profile PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate profile PDF');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!profile || isEditing) {
    return (
      <div className='max-w-5xl mx-auto py-12 px-6'>
        <div className='space-y-6'>
          <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>
            {profile ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className='text-lg text-gray-600 leading-relaxed'>
            {profile
              ? 'Refine your details to ensure your profile is up-to-date.'
              : 'Provide your information to unlock personalized study abroad opportunities.'}
          </p>
        </div>

        <ProfileBuilder
          initialData={profile || {}}
          onComplete={() => {
            setIsEditing(false);
            fetchProfile();
          }}
        />

        {profile && (
          <div className='text-center mt-8'>
            <button
              onClick={() => setIsEditing(false)}
              className='btn btn-outline px-8 py-3 text-lg rounded-lg hover:bg-gray-100 transition-all duration-300'
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  const ProfileSection = ({
    id,
    title,
    icon: Icon,
    children,
    isComplete,
  }: {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    isComplete: boolean;
  }) => (
    <div
      ref={(el) => (sectionRefs.current[id] = el)}
      className='card bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-100'
    >
      <button
        onClick={() => toggleSection(id)}
        className='w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors'
        aria-expanded={expandedSections.has(id)}
        aria-controls={`section-content-${id}`}
      >
        <div className='flex items-center gap-4'>
          <Icon className='h-7 w-7 text-primary-600' />
          <h2 className='text-2xl font-semibold text-gray-900 tracking-tight'>
            {title}
          </h2>
          {isComplete && <FiCheckCircle className='h-6 w-6 text-green-600' />}
        </div>
        {expandedSections.has(id) ? (
          <FiChevronUp className='h-7 w-7 text-gray-400' />
        ) : (
          <FiChevronDown className='h-7 w-7 text-gray-400' />
        )}
      </button>
      {expandedSections.has(id) && (
        <div
          id={`section-content-${id}`}
          className='p-6 pt-0 border-t border-gray-100 animate-slide-down'
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-6'>
      <div className='max-w-7xl mx-auto flex gap-8'>
        {/* Sidebar */}
        <aside className='w-64 sticky top-24 h-fit bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hidden lg:block'>
          <h3 className='text-xl font-semibold text-gray-900 mb-4'>Sections</h3>
          <nav className='space-y-2'>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className='w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-primary-50 transition-colors duration-200 text-gray-700 hover:text-primary-600'
                aria-label={`Go to ${section.title}`}
              >
                <section.icon className='h-5 w-5' />
                <span className='text-sm font-medium'>{section.title}</span>
              </button>
            ))}
            {/* <button
              onClick={handleDownloadPDF}
              className='w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200 mt-4'
              aria-label='Download Profile PDF'
            >
              <FiDownload className='h-5 w-5' />
              <span className='text-sm font-medium'>Download PDF</span>
            </button> */}
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 space-y-8'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>
                Your Profile
              </h1>
              <p className='text-lg text-gray-600 mt-2 leading-relaxed'>
                Curate your academic and personal details for a tailored study
                abroad experience.
              </p>
            </div>
            <div className='flex items-center gap-4'>
              {getReviewStatusBadge()}
              <button
                onClick={() => setIsEditing(true)}
                className='btn bg-gradient-to-r from-primary-500 to-primary-700 text-white px-8 py-3 rounded-lg text-lg hover:from-primary-600 hover:to-primary-800 transition-all duration-300 flex items-center gap-2'
                aria-label='Edit Profile'
              >
                <FiEdit2 className='h-5 w-5' />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Completion Progress */}
          <div className='card bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-2xl font-semibold text-gray-900 tracking-tight'>
                Profile Completion
              </h3>
              <span className='text-4xl font-bold text-primary-600'>
                {getCompletionPercentage()}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-5 overflow-hidden'>
              <div
                className='bg-gradient-to-r from-primary-500 to-primary-700 h-5 rounded-full transition-all duration-1000 ease-out'
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-6 mt-8'>
              {Object.entries(profile.profileCompletionStatus || {}).map(
                ([key, value]) => {
                  if (key === 'overallPercentage') return null;
                  return (
                    <div key={key} className='flex items-center gap-3'>
                      {value ? (
                        <FiCheckCircle className='h-6 w-6 text-green-600' />
                      ) : (
                        <div className='h-6 w-6 rounded-full border-3 border-gray-300' />
                      )}
                      <span className='text-sm font-medium text-gray-600 capitalize'>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Review Comments */}
          {reviewStatus?.status === 'rejected' && reviewStatus?.comments && (
            <div className='bg-red-50 border border-red-200 rounded-2xl p-8'>
              <h4 className='text-xl font-semibold text-red-900 mb-3 tracking-tight'>
                Revision Required
              </h4>
              <p className='text-red-700 leading-relaxed'>
                {reviewStatus.comments}
              </p>
            </div>
          )}

          {/* Personal Details */}
          <ProfileSection
            id='personal'
            title='Personal Details'
            icon={FiUser}
            isComplete={profile.profileCompletionStatus?.personalInfo || false}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              <div>
                <h4 className='font-semibold text-gray-900 mb-5 text-xl tracking-tight'>
                  Basic Information
                </h4>
                <dl className='space-y-4'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Full Name
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.fullName?.firstName}{' '}
                      {profile.personalInfo?.fullName?.lastName || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Father's Name
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.fatherName || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Date of Birth
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {formatDate(profile.personalInfo?.dateOfBirth) || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Gender
                    </dt>
                    <dd className='text-gray-900 capitalize text-lg'>
                      {profile.personalInfo?.gender || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>CNIC</dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.cnicNumber || '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className='font-semibold text-gray-900 mb-5 text-xl tracking-tight'>
                  Contact & Address
                </h4>
                <dl className='space-y-4'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Phone</dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.phone || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Email</dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.email || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Address
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.permanentAddress?.street
                        ? `${profile.personalInfo.permanentAddress.street}, ${profile.personalInfo.permanentAddress.city}, ${profile.personalInfo.permanentAddress.provinceOfDomicile}`
                        : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Emergency Contact
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.emergencyContact?.name
                        ? `${profile.personalInfo.emergencyContact.name} (${profile.personalInfo.emergencyContact.relation}), ${profile.personalInfo.emergencyContact.phone}`
                        : '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className='md:col-span-2'>
                <h4 className='font-semibold text-gray-900 mb-5 text-xl tracking-tight'>
                  Passport Information
                </h4>
                <dl className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Country
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.passportDetails?.passportCountry ||
                        '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Number
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.personalInfo?.passportDetails?.passportNumber ||
                        '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Expiry
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {formatDate(
                        profile.personalInfo?.passportDetails?.passportExpiry
                      ) || '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </ProfileSection>

          {/* Academic Background */}
          <ProfileSection
            id='academic'
            title='Academic Background'
            icon={FiBook}
            isComplete={
              profile.profileCompletionStatus?.educationalBackground || false
            }
          >
            <dl className='space-y-6'>
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  Study Level
                </dt>
                <dd className='text-gray-900 text-lg capitalize'>
                  {profile.educationalBackground?.studyLevel || '-'}
                </dd>
              </div>

              {profile.educationalBackground?.studyLevel === 'bachelor' && (
                <>
                  {profile.educationalBackground?.matriculation && (
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Matriculation
                      </dt>
                      <dd className='text-gray-900 text-lg'>
                        {profile.educationalBackground.matriculation.board} (
                        {profile.educationalBackground.matriculation.year}) -{' '}
                        {
                          profile.educationalBackground.matriculation
                            .scorePercentage
                        }
                        %
                      </dd>
                    </div>
                  )}
                  {profile.educationalBackground?.intermediate && (
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Intermediate
                      </dt>
                      <dd className='text-gray-900 text-lg'>
                        {profile.educationalBackground.intermediate.board} (
                        {profile.educationalBackground.intermediate.year}) -{' '}
                        {
                          profile.educationalBackground.intermediate
                            .scorePercentage
                        }
                        %
                        <br />
                        <span className='text-sm capitalize'>
                          {profile.educationalBackground.intermediate.preEngineeringOrPreMedical?.replace(
                            '-',
                            ' '
                          )}
                        </span>
                      </dd>
                    </div>
                  )}
                </>
              )}

              {(profile.educationalBackground?.studyLevel === 'master' ||
                profile.educationalBackground?.studyLevel === 'phd') &&
                profile.educationalBackground?.bachelorDegree && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Bachelor's Degree
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.educationalBackground.bachelorDegree.programName}
                      {profile.educationalBackground.bachelorDegree
                        .specialization &&
                        ` - ${profile.educationalBackground.bachelorDegree.specialization}`}
                      <br />
                      {profile.educationalBackground.bachelorDegree.institution}
                      , {profile.educationalBackground.bachelorDegree.country}
                      <br />
                      CGPA:{' '}
                      {
                        profile.educationalBackground.bachelorDegree
                          .cgpaPercentage
                      }
                    </dd>
                  </div>
                )}

              {profile.educationalBackground?.educationalGap && (
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Educational Gap
                  </dt>
                  <dd className='text-gray-900 text-lg'>
                    {profile.educationalBackground.educationalGap}
                  </dd>
                </div>
              )}
            </dl>
          </ProfileSection>

          {/* Test Scores */}
          <ProfileSection
            id='tests'
            title='Test Scores & Experience'
            icon={FiFileText}
            isComplete={profile.profileCompletionStatus?.testScores || false}
          >
            <div className='space-y-8'>
              {profile.testScores?.ieltsScores && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-4 text-xl tracking-tight'>
                    IELTS
                  </h4>
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-6 text-sm'>
                    <div className='bg-gray-50 p-4 rounded-xl shadow-sm'>
                      <span className='text-gray-600'>Listening:</span>{' '}
                      {profile.testScores.ieltsScores.listening}
                    </div>
                    <div className='bg-gray-50 p-4 rounded-xl shadow-sm'>
                      <span className='text-gray-600'>Reading:</span>{' '}
                      {profile.testScores.ieltsScores.reading}
                    </div>
                    <div className='bg-gray-50 p-4 rounded-xl shadow-sm'>
                      <span className='text-gray-600'>Writing:</span>{' '}
                      {profile.testScores.ieltsScores.writing}
                    </div>
                    <div className='bg-gray-50 p-4 rounded-xl shadow-sm'>
                      <span className='text-gray-600'>Speaking:</span>{' '}
                      {profile.testScores.ieltsScores.speaking}
                    </div>
                    <div className='bg-primary-50 p-4 rounded-xl shadow-sm'>
                      <span className='text-gray-600'>Overall:</span>{' '}
                      <strong>{profile.testScores.ieltsScores.total}</strong>
                    </div>
                  </div>
                </div>
              )}

              {profile.testScores?.toeflScore && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-4 text-xl tracking-tight'>
                    TOEFL
                  </h4>
                  <p className='text-gray-900 text-lg'>
                    Score: {profile.testScores.toeflScore}
                  </p>
                </div>
              )}

              {(profile.testScores?.satScore ||
                profile.testScores?.greScore ||
                profile.testScores?.gmatScore) && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {profile.testScores.satScore && (
                    <div className='bg-gray-50 p-6 rounded-xl shadow-sm'>
                      <h4 className='font-semibold text-gray-900'>SAT</h4>
                      <p className='text-3xl font-bold text-gray-900'>
                        {profile.testScores.satScore}
                      </p>
                    </div>
                  )}
                  {profile.testScores.greScore && (
                    <div className='bg-gray-50 p-6 rounded-xl shadow-sm'>
                      <h4 className='font-semibold text-gray-900'>GRE</h4>
                      <p className='text-3xl font-bold text-gray-900'>
                        {profile.testScores.greScore}
                      </p>
                    </div>
                  )}
                  {profile.testScores.gmatScore && (
                    <div className='bg-gray-50 p-6 rounded-xl shadow-sm'>
                      <h4 className='font-semibold text-gray-900'>GMAT</h4>
                      <p className='text-3xl font-bold text-gray-900'>
                        {profile.testScores.gmatScore}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {profile.testScores?.workExperience && (
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Work Experience
                  </dt>
                  <dd className='text-gray-900 text-lg'>
                    {profile.testScores.workExperience}
                  </dd>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Study Preferences */}
          <ProfileSection
            id='studyPreferences'
            title='Study Preferences'
            icon={FiGlobe}
            isComplete={
              profile.profileCompletionStatus?.studyPreferences || false
            }
          >
            <dl className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  Preferred Course
                </dt>
                <dd className='text-gray-900 text-lg'>
                  {profile.studyPreferences?.preferredCourse || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  Specialization
                </dt>
                <dd className='text-gray-900 text-lg'>
                  {profile.studyPreferences?.specialization || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-500'>Country</dt>
                <dd className='text-gray-900 text-lg'>
                  {profile.studyPreferences?.preferredCountry || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-500'>Intake</dt>
                <dd className='text-gray-900 text-lg'>
                  {profile.studyPreferences?.intendedIntake?.season}{' '}
                  {profile.studyPreferences?.intendedIntake?.year || '-'}
                </dd>
              </div>
              <div className='md:col-span-2'>
                <dt className='text-sm font-medium text-gray-500'>
                  Selected Universities
                </dt>
                <dd className='text-gray-900 text-lg'>
                  {profile.studyPreferences?.preferredUniversities?.length || 0}{' '}
                  universities selected
                </dd>
              </div>
              <div className='md:col-span-2'>
                <dt className='text-sm font-medium text-gray-500'>
                  Study Motivation
                </dt>
                <dd className='text-gray-900 text-lg'>
                  {profile.studyPreferences?.studyReason || '-'}
                </dd>
              </div>
            </dl>
          </ProfileSection>

          {/* Financial & Documentation */}
          <ProfileSection
            id='financial'
            title='Financial & Documentation'
            icon={FiDollarSign}
            isComplete={profile.profileCompletionStatus?.financialInfo || false}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              <div>
                <h4 className='font-semibold text-gray-900 mb-5 text-xl tracking-tight'>
                  Financial Information
                </h4>
                <dl className='space-y-4'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Funding Source
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.financialInfo?.fundingSource || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Budget Range
                    </dt>
                    <dd className='text-gray-900 text-lg'>
                      {profile.financialInfo?.budgetConstraints || '-'}
                    </dd>
                  </div>
                  {profile.financialInfo?.sponsorDetails && (
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Sponsor
                      </dt>
                      <dd className='text-gray-900 text-lg'>
                        {profile.financialInfo.sponsorDetails.sponsorName} (
                        {profile.financialInfo.sponsorDetails.sponsorRelation})
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h4 className='font-semibold text-gray-900 mb-5 text-xl tracking-tight'>
                  Documentation Status
                </h4>
                <div className='space-y-4'>
                  {[
                    {
                      key: 'bankStatementsSubmitted',
                      label: 'Bank Statements',
                      docId: 'bankStatementDocId',
                    },
                    {
                      key: 'financialAffidavit',
                      label: 'Financial Affidavit',
                      docId: 'financialAffidavitDocId',
                    },
                    {
                      key: 'policeClearanceCertificate',
                      label: 'Police Clearance',
                      docId: 'policeClearanceDocId',
                    },
                    {
                      key: 'medicalClearance',
                      label: 'Medical Clearance',
                      docId: 'medicalClearanceDocId',
                    },
                    {
                      key: 'domicileCertificate',
                      label: 'Domicile Certificate',
                      docId: 'domicileCertificateDocId',
                    },
                    {
                      key: 'nocRequired',
                      label: 'No Objection Certificate',
                      docId: 'nocDocId',
                    },
                  ].map((doc) => (
                    <div
                      key={doc.key}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        {profile.financialInfo?.[
                          doc.key as keyof typeof profile.financialInfo
                        ] ? (
                          <FiCheckCircle className='h-5 w-5 text-green-500' />
                        ) : (
                          <div className='h-5 w-5 rounded-full border-3 border-gray-400' />
                        )}
                        <span className='text-sm font-semibold text-gray-700'>
                          {doc.label}
                        </span>
                      </div>
                      {profile.financialInfo?.[
                        doc.docId as keyof typeof profile.financialInfo
                      ] && (
                        <a
                          href={documentService.getDocumentUrl(
                            profile.financialInfo[
                              doc.docId as keyof typeof profile.financialInfo
                            ] as string
                          )}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:bg-blue-100 px-3 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2 relative group'
                          title={'View uploaded ${doc.label}'}
                          aria-label='View uploaded document ${doc.label}'
                        >
                          <FiUpload className='h-5 w-5' />
                          View
                          <span className='absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 py-1.5 -top-10 right-0'>
                            View uploaded {doc.label}
                          </span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* {reviewStatus?.status !== 'pending' && (
            <div className='flex justify-center'>
              <button
                onClick={async () => {
                  try {
                    await profileService.submitForReview();
                    toast.success('Profile submitted for review');
                    fetchProfile();
                  } catch (error) {
                    toast.error('Failed to submit profile for review');
                  }
                }}
                className='btn bg-gradient-to-r from-primary-700 to-blue-600 text-white px-10 py-4 text-xl font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors duration-300 shadow-lg flex items-center gap-3'
                aria-label='Submit Profile for Review'
              >
                Submit for Review
              </button>
            </div>
          )} */}
        </main>
      </div>

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
