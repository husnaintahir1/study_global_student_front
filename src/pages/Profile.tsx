import React, { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiBook,
  FiGlobe,
  FiDollarSign,
  FiFileText,
  FiDownload,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCamera,
  FiAward,
  FiTarget,
  FiHeart,
  FiShield,
  FiBookOpen,
  FiExternalLink,
  FiFlag,
  FiUsers,
  FiBriefcase,
  FiHome,
  FiTrendingUp,
  FiFilter,
  FiMoreHorizontal,
  FiEye,
  FiUpload,
  // FiGraduationCap,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { profileService } from '@/services/profile.service';
import { documentService } from '@/services/document.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

// Import the ProfileBuilder component for editing
import { ProfileBuilder } from '@/components/profile/ProfileBuilder';
import { API_BASE_URL } from '@/utils/constants';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewStatus, setReviewStatus] = useState(null);
  const [universities, setUniversities] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const [profileData, statusData] = await Promise.all([
        profileService.getProfile(),
        profileService.getReviewStatus().catch(() => null),
      ]);

      setProfile(profileData?.profile || null);
      setReviewStatus(statusData);

      // Fetch university names if they exist
      if (
        profileData?.profile?.studyPreferences?.preferredUniversities?.length >
        0
      ) {
        fetchUniversityNames(
          profileData.profile.studyPreferences.preferredUniversities
        );
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversityNames = async (universityIds) => {
    try {
      const universityPromises = universityIds.map((id) =>
        fetch(`/api/universities/${id}`)
          .then((res) => res.json())
          .catch(() => ({ id, name: `University ${id}` }))
      );
      const universityData = await Promise.all(universityPromises);
      const universityMap = {};
      universityData.forEach((uni) => {
        universityMap[uni.id] = uni;
      });
      setUniversities(universityMap);
    } catch (error) {
      console.error('Failed to fetch university names:', error);
    }
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

  const getReviewStatusBadge = () => {
    if (!reviewStatus?.status) return null;

    const statusConfig = {
      pending: {
        icon: FiClock,
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Under Review',
      },
      approved: {
        icon: FiCheckCircle,
        color: 'bg-green-100 text-green-800',
        text: 'Profile Approved',
      },
      rejected: {
        icon: FiAlertCircle,
        color: 'bg-red-100 text-red-800',
        text: 'Needs Revision',
      },
    };

    const config = statusConfig[reviewStatus.status];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className='h-4 w-4 mr-2' />
        {config.text}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => (
    <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
      <div className='flex items-center gap-3'>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <p className='text-sm text-gray-600'>{label}</p>
          <p className='text-lg font-semibold text-gray-900'>{value || '-'}</p>
        </div>
      </div>
    </div>
  );

  const InfoItem = ({ label, value, icon: Icon }) => (
    <div className='flex items-center gap-3 py-2'>
      {Icon && <Icon className='h-4 w-4 text-gray-500' />}
      <div className='flex-1'>
        <span className='text-sm text-gray-600'>{label}:</span>
        <span className='ml-2 text-sm font-medium text-gray-900'>
          {value || '-'}
        </span>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className='h-4 w-4' />
      {label}
    </button>
  );

  const DocumentLink = ({ docId, label }) => {
    if (!docId) return null;

    const handleView = () => {
      const url = documentService.getDocumentUrl(docId);
      window.open(url, '_blank');
    };

    return (
      <button
        onClick={handleView}
        className='text-blue-600 hover:bg-blue-100 px-3 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2'
        title={`View ${label}`}
      >
        <FiEye className='h-4 w-4' />
        View
      </button>
    );
  };

  // Helper function to calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return 0;

    let totalFields = 0;
    let completedFields = 0;

    // Personal Info (20 points)
    const personalFields = [
      profile.personalInfo?.fullName?.firstName,
      profile.personalInfo?.fullName?.lastName,
      profile.personalInfo?.email,
      profile.personalInfo?.phone,
      profile.personalInfo?.dateOfBirth,
      profile.personalInfo?.gender,
      profile.personalInfo?.cnicNumber,
      profile.personalInfo?.fatherName,
    ];
    totalFields += personalFields.length;
    completedFields += personalFields.filter((field) => field).length;

    // Educational Background (30 points)
    const educationalFields = [
      profile.educationalBackground?.studyLevel,
      profile.educationalBackground?.admissionYear,
    ];
    totalFields += educationalFields.length;
    completedFields += educationalFields.filter((field) => field).length;

    // Study Preferences (25 points)
    const preferenceFields = [
      profile.studyPreferences?.preferredCountry,
      profile.studyPreferences?.preferredCourse,
      profile.studyPreferences?.intendedIntake?.year,
      profile.studyPreferences?.intendedIntake?.season,
      profile.studyPreferences?.studyReason,
    ];
    totalFields += preferenceFields.length;
    completedFields += preferenceFields.filter((field) => field).length;

    // Financial Info (15 points)
    const financialFields = [
      profile.financialInfo?.fundingSource,
      profile.financialInfo?.budgetConstraints,
    ];
    totalFields += financialFields.length;
    completedFields += financialFields.filter((field) => field).length;

    // Test Scores (10 points)
    const hasTestScores =
      profile.testScores?.ieltsScores ||
      profile.testScores?.toeflScore ||
      profile.testScores?.satScore ||
      profile.testScores?.greScore ||
      profile.testScores?.gmatScore;
    totalFields += 1;
    if (hasTestScores) completedFields += 1;

    return Math.round((completedFields / totalFields) * 100);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Editing state
  if (isEditing) {
    return (
      <div className='max-w-5xl mx-auto py-12 px-6'>
        <div className='space-y-6'>
          <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>
            {profile ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className='text-lg text-gray-600 leading-relaxed'>
            {profile
              ? 'Update your details to ensure your profile is current.'
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

  // No profile state
  if (!profile) {
    return (
      <div className='max-w-5xl mx-auto py-12 px-6 text-center'>
        <div className='space-y-6'>
          <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>
            Welcome to Your Profile
          </h1>
          <p className='text-lg text-gray-600 leading-relaxed'>
            Start building your study abroad profile to get personalized
            recommendations.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className='btn btn-primary px-8 py-3 text-lg rounded-lg'
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background Decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-20 blur-3xl'></div>
      </div>

      <div className='relative max-w-7xl mx-auto p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Sidebar - Profile Card */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              {/* Profile Header */}
              <div className='bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white relative'>
                <div className='absolute top-4 right-4'></div>

                <div className='text-center'>
                  {/* Profile Picture */}
                  <div className='relative inline-block mb-4'>
                    {profile.personalInfo?.profilePicture ? (
                      <img
                        src={
                          API_BASE_URL.replace('/api/v1', '') +
                          profile.personalInfo.profilePicture
                        }
                        alt='Profile'
                        className='h-24 w-24 rounded-full object-cover border-4 border-white/20'
                      />
                    ) : (
                      <div className='h-24 w-24 rounded-full bg-white/20 border-4 border-white/20 flex items-center justify-center text-white text-2xl font-bold'>
                        {profile.personalInfo?.fullName?.firstName?.[0] || 'U'}
                        {profile.personalInfo?.fullName?.lastName?.[0] || ''}
                      </div>
                    )}
                    <button className='absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow'>
                      <FiCamera className='h-3 w-3 text-gray-600' />
                    </button>
                  </div>

                  <h1 className='text-xl font-bold mb-1'>
                    {profile.personalInfo?.fullName?.firstName || 'First'}{' '}
                    {profile.personalInfo?.fullName?.lastName || 'Last'}
                  </h1>
                  <p className='text-white/80 text-sm mb-3'>
                    {profile.studyPreferences?.preferredCourse || 'Student'}
                  </p>
                  {getReviewStatusBadge()}
                </div>
              </div>

              {/* Profile Details */}
              <div className='p-6'>
                <div className='space-y-1'>
                  <InfoItem
                    icon={FiMail}
                    label='Email'
                    value={profile.personalInfo?.email}
                  />
                  <InfoItem
                    icon={FiPhone}
                    label='Phone'
                    value={profile.personalInfo?.phone}
                  />
                  <InfoItem
                    icon={FiMapPin}
                    label='Location'
                    value={
                      profile.personalInfo?.permanentAddress?.city &&
                      profile.personalInfo?.residenceCountry
                        ? `${profile.personalInfo.permanentAddress.city}, ${profile.personalInfo.residenceCountry}`
                        : profile.personalInfo?.permanentAddress?.city ||
                          profile.personalInfo?.residenceCountry
                    }
                  />
                  <InfoItem
                    icon={FiCalendar}
                    label='Date of Birth'
                    value={formatDate(profile.personalInfo?.dateOfBirth)}
                  />
                  <InfoItem
                    icon={FiShield}
                    label='CNIC'
                    value={profile.personalInfo?.cnicNumber}
                  />
                </div>

                {/* Action Buttons */}
                <div className='mt-6 space-y-3'>
                  <button
                    onClick={() => setIsEditing(true)}
                    className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
                  >
                    Edit Profile
                  </button>
                  {/* <button
                    onClick={handleDownloadPDF}
                    className='w-full border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'
                  >
                    <FiDownload className='h-4 w-4' />
                    Download PDF
                  </button> */}
                </div>

                {/* SMS Alerts Toggle */}
                {/* <div className='mt-6 pt-6 border-t border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        SMS alerts activation
                      </p>
                      <p className='text-xs text-gray-500'>
                        Get notifications via SMS
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6'></span>
                    </button>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Social Links */}
            {profile.personalInfo?.socialLinks &&
              Object.values(profile.personalInfo.socialLinks).some(
                (link) => link
              ) && (
                <div className='mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Social Profiles
                  </h3>
                  <div className='space-y-3'>
                    {Object.entries(profile.personalInfo.socialLinks).map(
                      ([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors'
                          >
                            <FiExternalLink className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-medium text-gray-700 capitalize'>
                              {platform}
                            </span>
                          </a>
                        )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Right Content Area */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Stats Overview */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Profile Overview
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard
                  icon={FiTrendingUp}
                  label='Completion'
                  value={`${calculateCompletion()}%`}
                  color='green'
                />
                <StatCard
                  icon={FiUser}
                  label='Study Level'
                  value={profile.educationalBackground?.studyLevel}
                  color='blue'
                />
                <StatCard
                  icon={FiGlobe}
                  label='Target Country'
                  value={profile.studyPreferences?.preferredCountry}
                  color='purple'
                />
                <StatCard
                  icon={FiCalendar}
                  label='Intake'
                  value={
                    profile.studyPreferences?.intendedIntake
                      ? `${
                          profile.studyPreferences.intendedIntake.season || ''
                        } ${profile.studyPreferences.intendedIntake.year || ''}`
                      : null
                  }
                  color='orange'
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100'>
              <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Detailed Information
                  </h2>
                </div>

                <div className='flex flex-wrap gap-2'>
                  <TabButton
                    id='overview'
                    label='Personal Info'
                    icon={FiUser}
                    isActive={activeTab === 'overview'}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id='academic'
                    label='Academic'
                    icon={FiBookOpen}
                    isActive={activeTab === 'academic'}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id='tests'
                    label='Test Scores'
                    icon={FiAward}
                    isActive={activeTab === 'tests'}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id='preferences'
                    label='Study Goals'
                    icon={FiTarget}
                    isActive={activeTab === 'preferences'}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id='financial'
                    label='Financial'
                    icon={FiDollarSign}
                    isActive={activeTab === 'financial'}
                    onClick={setActiveTab}
                  />
                </div>
              </div>

              {/* Tab Content */}
              <div className='p-6'>
                {activeTab === 'overview' && (
                  <div className='space-y-6'>
                    {/* Personal Information */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Personal Details
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Father's Name
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.personalInfo?.fatherName || '-'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Gender
                            </label>
                            <p className='text-base text-gray-900 capitalize'>
                              {profile.personalInfo?.gender || '-'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Religion
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.personalInfo?.religion || '-'}
                            </p>
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Emergency Contact
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.personalInfo?.emergencyContact?.name
                                ? `${
                                    profile.personalInfo.emergencyContact.name
                                  } (${
                                    profile.personalInfo.emergencyContact
                                      .relation || 'N/A'
                                  })`
                                : '-'}
                            </p>
                            {profile.personalInfo?.emergencyContact?.phone && (
                              <p className='text-sm text-gray-600'>
                                {profile.personalInfo.emergencyContact.phone}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Passport
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.personalInfo?.passportDetails
                                ?.passportNumber || '-'}
                            </p>
                            {profile.personalInfo?.passportDetails
                              ?.passportExpiry && (
                              <p className='text-sm text-gray-600'>
                                Expires:{' '}
                                {formatDate(
                                  profile.personalInfo.passportDetails
                                    .passportExpiry
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    {profile.personalInfo?.permanentAddress && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Address Information
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Street Address
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.personalInfo.permanentAddress.street ||
                                  '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                City & Province
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.personalInfo.permanentAddress.city &&
                                profile.personalInfo.permanentAddress
                                  .provinceOfDomicile
                                  ? `${profile.personalInfo.permanentAddress.city}, ${profile.personalInfo.permanentAddress.provinceOfDomicile}`
                                  : profile.personalInfo.permanentAddress
                                      .city ||
                                    profile.personalInfo.permanentAddress
                                      .provinceOfDomicile ||
                                    '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Postal Code
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.personalInfo.permanentAddress
                                  .postalCode || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Country
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.personalInfo.residenceCountry || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'academic' && (
                  <div className='space-y-6'>
                    {/* Study Level & Admission Info */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Study Information
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <label className='text-sm font-medium text-gray-500'>
                            Study Level
                          </label>
                          <p className='text-base text-gray-900 capitalize'>
                            {profile.educationalBackground?.studyLevel || '-'}
                          </p>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <label className='text-sm font-medium text-gray-500'>
                            Admission Year
                          </label>
                          <p className='text-base text-gray-900'>
                            {profile.educationalBackground?.admissionYear ||
                              '-'}
                          </p>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <label className='text-sm font-medium text-gray-500'>
                            Educational Gap
                          </label>
                          <p className='text-base text-gray-900'>
                            {profile.educationalBackground?.educationalGap
                              ? 'Yes'
                              : 'No'}
                          </p>
                        </div>
                      </div>
                      {profile.educationalBackground?.educationalGap && (
                        <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                          <p className='text-sm text-yellow-800'>
                            <strong>Gap Details:</strong>{' '}
                            {profile.educationalBackground.educationalGap}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Matriculation/O-Levels */}
                    {profile.educationalBackground?.matriculation && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Matriculation/O-Levels
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Year
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.matriculation
                                  .year || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Board
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.matriculation
                                  .board || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Grading System
                              </label>
                              <p className='text-base text-gray-900 capitalize'>
                                {profile.educationalBackground.matriculation
                                  .gradingSystem || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Score
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.matriculation
                                  .gradingSystem === 'percentage'
                                  ? `${
                                      profile.educationalBackground
                                        .matriculation.scorePercentage || '-'
                                    }%`
                                  : profile.educationalBackground.matriculation
                                      .grades
                                  ? 'Grades Available'
                                  : '-'}
                              </p>
                            </div>
                            {profile.educationalBackground.matriculation
                              .institute && (
                              <div>
                                <label className='text-sm font-medium text-gray-500'>
                                  Institute Name
                                </label>
                                <p className='text-base text-gray-900'>
                                  {
                                    profile.educationalBackground.matriculation
                                      .institute
                                  }
                                </p>
                              </div>
                            )}
                            {profile.educationalBackground.matriculation
                              .subjects && (
                              <div>
                                <label className='text-sm font-medium text-gray-500'>
                                  Subjects
                                </label>
                                <p className='text-base text-gray-900'>
                                  {
                                    profile.educationalBackground.matriculation
                                      .subjects
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                          {profile.educationalBackground.matriculation
                            .documentId && (
                            <div className='mt-4 pt-4 border-t border-gray-200'>
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.matriculation
                                    .documentId
                                }
                                label='Matriculation Certificate'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Intermediate/A-Levels */}
                    {profile.educationalBackground?.intermediate && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Intermediate/A-Levels
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Year
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.intermediate
                                  .year || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Board
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.intermediate
                                  .board || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Program
                              </label>
                              <p className='text-base text-gray-900 capitalize'>
                                {profile.educationalBackground.intermediate.preEngineeringOrPreMedical?.replace(
                                  '-',
                                  ' '
                                ) || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Score
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.intermediate
                                  .gradingSystem === 'percentage'
                                  ? `${
                                      profile.educationalBackground.intermediate
                                        .scorePercentage || '-'
                                    }%`
                                  : profile.educationalBackground.intermediate
                                      .grades
                                  ? 'Grades Available'
                                  : '-'}
                              </p>
                            </div>
                          </div>
                          {profile.educationalBackground.intermediate
                            .documentId && (
                            <div className='mt-4 pt-4 border-t border-gray-200'>
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.intermediate
                                    .documentId
                                }
                                label='Intermediate Certificate'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bachelor's Degree */}
                    {profile.educationalBackground?.bachelorDegree && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Bachelor's Degree
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Program
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.bachelorDegree
                                  .programName || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Specialization
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.bachelorDegree
                                  .specialization || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Institution
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.bachelorDegree
                                  .institution || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Country
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.bachelorDegree
                                  .country || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Duration
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.bachelorDegree
                                  .startDate &&
                                profile.educationalBackground.bachelorDegree
                                  .endDate
                                  ? `${formatDate(
                                      profile.educationalBackground
                                        .bachelorDegree.startDate
                                    )} - ${formatDate(
                                      profile.educationalBackground
                                        .bachelorDegree.endDate
                                    )}`
                                  : '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                CGPA/Percentage
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.bachelorDegree
                                  .cgpaPercentage || '-'}
                              </p>
                            </div>
                          </div>
                          <div className='mt-4 pt-4 border-t border-gray-200 flex gap-2'>
                            {profile.educationalBackground.bachelorDegree
                              .transcriptId && (
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.bachelorDegree
                                    .transcriptId
                                }
                                label="Bachelor's Transcript"
                              />
                            )}
                            {profile.educationalBackground.bachelorDegree
                              .degreeId && (
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.bachelorDegree
                                    .degreeId
                                }
                                label="Bachelor's Degree"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Master's Degree */}
                    {profile.educationalBackground?.masterDegree && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Master's Degree
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Program
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.masterDegree
                                  .programName || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Specialization
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.masterDegree
                                  .specialization || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Institution
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.masterDegree
                                  .institution || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Country
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.masterDegree
                                  .country || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                CGPA/Percentage
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.masterDegree
                                  .cgpaPercentage || '-'}
                              </p>
                            </div>
                            {profile.educationalBackground.masterDegree
                              .thesisTitle && (
                              <div>
                                <label className='text-sm font-medium text-gray-500'>
                                  Thesis Title
                                </label>
                                <p className='text-base text-gray-900'>
                                  {
                                    profile.educationalBackground.masterDegree
                                      .thesisTitle
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                          <div className='mt-4 pt-4 border-t border-gray-200 flex gap-2'>
                            {profile.educationalBackground.masterDegree
                              .transcriptId && (
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.masterDegree
                                    .transcriptId
                                }
                                label="Master's Transcript"
                              />
                            )}
                            {profile.educationalBackground.masterDegree
                              .degreeId && (
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.masterDegree
                                    .degreeId
                                }
                                label="Master's Degree"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Work Experience */}
                    {profile.educationalBackground?.workExperience &&
                      profile.educationalBackground.workExperience.length >
                        0 && (
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                            Work Experience
                          </h3>
                          <div className='space-y-4'>
                            {profile.educationalBackground.workExperience.map(
                              (experience, index) => (
                                <div
                                  key={index}
                                  className='bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500'
                                >
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                      <label className='text-sm font-medium text-gray-500'>
                                        Company
                                      </label>
                                      <p className='text-base text-gray-900 font-semibold'>
                                        {experience.company || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className='text-sm font-medium text-gray-500'>
                                        Position
                                      </label>
                                      <p className='text-base text-gray-900'>
                                        {experience.position || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className='text-sm font-medium text-gray-500'>
                                        Duration
                                      </label>
                                      <p className='text-base text-gray-900'>
                                        {experience.startDate &&
                                        experience.endDate
                                          ? `${formatDate(
                                              experience.startDate
                                            )} - ${formatDate(
                                              experience.endDate
                                            )}`
                                          : experience.startDate
                                          ? `${formatDate(
                                              experience.startDate
                                            )} - Present`
                                          : '-'}
                                      </p>
                                    </div>
                                    {experience.responsibilities && (
                                      <div className='md:col-span-2'>
                                        <label className='text-sm font-medium text-gray-500'>
                                          Responsibilities
                                        </label>
                                        <p className='text-base text-gray-900'>
                                          {experience.responsibilities}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {experience.documentId && (
                                    <div className='mt-4 pt-4 border-t border-gray-200'>
                                      <DocumentLink
                                        docId={experience.documentId}
                                        label='Experience Certificate'
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Additional Certifications */}
                    {profile.educationalBackground?.diploma && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Additional Certifications
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Program
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.diploma
                                  .programName || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Institution
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.diploma
                                  .institution || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Year
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.educationalBackground.diploma.year ||
                                  '-'}
                              </p>
                            </div>
                          </div>
                          {profile.educationalBackground.diploma.documentId && (
                            <div className='mt-4 pt-4 border-t border-gray-200'>
                              <DocumentLink
                                docId={
                                  profile.educationalBackground.diploma
                                    .documentId
                                }
                                label='Diploma Certificate'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* HEC Equivalence */}
                    {profile.educationalBackground?.hecEquivalenceStatus
                      ?.applied && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          HEC Equivalence
                        </h3>
                        <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
                          <div className='flex items-center gap-2 mb-2'>
                            <FiCheck className='h-5 w-5 text-green-600' />
                            <span className='text-green-800 font-medium'>
                              HEC Equivalence Applied
                            </span>
                          </div>
                          {profile.educationalBackground.hecEquivalenceStatus
                            .obtainedDate && (
                            <p className='text-sm text-green-700'>
                              Obtained:{' '}
                              {formatDate(
                                profile.educationalBackground
                                  .hecEquivalenceStatus.obtainedDate
                              )}
                            </p>
                          )}
                          {profile.educationalBackground.hecEquivalenceStatus
                            .documentId && (
                            <div className='mt-2'>
                              <DocumentLink
                                docId={
                                  profile.educationalBackground
                                    .hecEquivalenceStatus.documentId
                                }
                                label='HEC Equivalence Certificate'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'tests' && (
                  <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Test Scores
                      </h3>
                      <span className='text-sm text-gray-500'>
                        {
                          Object.keys(profile.testScores || {}).filter(
                            (key) =>
                              key.includes('Score') && profile.testScores[key]
                          ).length
                        }{' '}
                        tests recorded
                      </span>
                    </div>

                    {/* IELTS Scores */}
                    {profile.testScores?.ieltsScores && (
                      <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='text-lg font-semibold text-blue-900'>
                            IELTS
                          </h4>
                          <span className='text-2xl font-bold text-blue-600'>
                            {profile.testScores.ieltsScores.total}
                          </span>
                        </div>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                          <div className='text-center'>
                            <p className='text-sm text-blue-600 font-medium'>
                              Listening
                            </p>
                            <p className='text-lg font-bold text-blue-800'>
                              {profile.testScores.ieltsScores.listening || '-'}
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='text-sm text-blue-600 font-medium'>
                              Reading
                            </p>
                            <p className='text-lg font-bold text-blue-800'>
                              {profile.testScores.ieltsScores.reading || '-'}
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='text-sm text-blue-600 font-medium'>
                              Writing
                            </p>
                            <p className='text-lg font-bold text-blue-800'>
                              {profile.testScores.ieltsScores.writing || '-'}
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='text-sm text-blue-600 font-medium'>
                              Speaking
                            </p>
                            <p className='text-lg font-bold text-blue-800'>
                              {profile.testScores.ieltsScores.speaking || '-'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-blue-700'>
                            Test Date:{' '}
                            {formatDate(
                              profile.testScores.ieltsScores.testDate
                            )}
                          </p>
                          {profile.testScores.ieltsScores.documentId && (
                            <DocumentLink
                              docId={profile.testScores.ieltsScores.documentId}
                              label='IELTS Certificate'
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* TOEFL Scores */}
                    {profile.testScores?.toeflScore && (
                      <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='text-lg font-semibold text-green-900'>
                            TOEFL iBT
                          </h4>
                          <span className='text-2xl font-bold text-green-600'>
                            {profile.testScores.toeflScore.total}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-green-700'>
                            Test Date:{' '}
                            {formatDate(profile.testScores.toeflScore.testDate)}
                          </p>
                          {profile.testScores.toeflScore.documentId && (
                            <DocumentLink
                              docId={profile.testScores.toeflScore.documentId}
                              label='TOEFL Certificate'
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* SAT Scores */}
                    {profile.testScores?.satScore && (
                      <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='text-lg font-semibold text-purple-900'>
                            SAT
                          </h4>
                          <span className='text-2xl font-bold text-purple-600'>
                            {profile.testScores.satScore.total}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-purple-700'>
                            Test Date:{' '}
                            {formatDate(profile.testScores.satScore.testDate)}
                          </p>
                          {profile.testScores.satScore.documentId && (
                            <DocumentLink
                              docId={profile.testScores.satScore.documentId}
                              label='SAT Certificate'
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* GRE Scores */}
                    {profile.testScores?.greScore && (
                      <div className='bg-orange-50 rounded-lg p-4 border border-orange-200'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='text-lg font-semibold text-orange-900'>
                            GRE
                          </h4>
                          <div className='text-right'>
                            <p className='text-sm text-orange-600'>Total</p>
                            <p className='text-lg font-bold text-orange-800'>
                              {(profile.testScores.greScore.verbal || 0) +
                                (profile.testScores.greScore.quantitative || 0)}
                            </p>
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-4 mb-4'>
                          <div className='text-center'>
                            <p className='text-sm text-orange-600 font-medium'>
                              Verbal
                            </p>
                            <p className='text-lg font-bold text-orange-800'>
                              {profile.testScores.greScore.verbal || '-'}
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='text-sm text-orange-600 font-medium'>
                              Quantitative
                            </p>
                            <p className='text-lg font-bold text-orange-800'>
                              {profile.testScores.greScore.quantitative || '-'}
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='text-sm text-orange-600 font-medium'>
                              Analytical
                            </p>
                            <p className='text-lg font-bold text-orange-800'>
                              {profile.testScores.greScore.analytical || '-'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-orange-700'>
                            Test Date:{' '}
                            {formatDate(profile.testScores.greScore.testDate)}
                          </p>
                          {profile.testScores.greScore.documentId && (
                            <DocumentLink
                              docId={profile.testScores.greScore.documentId}
                              label='GRE Certificate'
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Other Test Scores */}
                    {[
                      'gmatScore',
                      'actScore',
                      'neetScore',
                      'pteScore',
                      'duolingoScore',
                      'mcatScore',
                    ].map((testType) => {
                      const testData = profile.testScores?.[testType];
                      if (!testData) return null;

                      const testNames = {
                        gmatScore: 'GMAT',
                        actScore: 'ACT',
                        neetScore: 'NEET',
                        pteScore: 'PTE Academic',
                        duolingoScore: 'Duolingo English Test',
                        mcatScore: 'MCAT',
                      };

                      const colors = {
                        gmatScore: 'red',
                        actScore: 'indigo',
                        neetScore: 'pink',
                        pteScore: 'teal',
                        duolingoScore: 'cyan',
                        mcatScore: 'emerald',
                      };

                      const color = colors[testType];
                      const testName = testNames[testType];

                      return (
                        <div
                          key={testType}
                          className={`bg-${color}-50 rounded-lg p-4 border border-${color}-200`}
                        >
                          <div className='flex items-center justify-between mb-4'>
                            <h4
                              className={`text-lg font-semibold text-${color}-900`}
                            >
                              {testName}
                            </h4>
                            <span
                              className={`text-2xl font-bold text-${color}-600`}
                            >
                              {testData.total || testData.composite || '-'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <p className={`text-sm text-${color}-700`}>
                              Test Date: {formatDate(testData.testDate)}
                            </p>
                            {testData.documentId && (
                              <DocumentLink
                                docId={testData.documentId}
                                label={`${testName} Certificate`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* No Test Scores */}
                    {!profile.testScores ||
                      (Object.keys(profile.testScores).filter(
                        (key) =>
                          key.includes('Score') && profile.testScores[key]
                      ).length === 0 && (
                        <div className='text-center py-8'>
                          <FiAward className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                          <h3 className='text-lg font-medium text-gray-900 mb-2'>
                            No Test Scores Added
                          </h3>
                          <p className='text-gray-600 mb-4'>
                            Add your standardized test scores to strengthen your
                            profile.
                          </p>
                          <button
                            onClick={() => setIsEditing(true)}
                            className='btn btn-primary'
                          >
                            Add Test Scores
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === 'preferences' && (
                  <div className='space-y-6'>
                    {/* Study Preferences */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Study Preferences
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Field of Study
                            </label>
                            <p className='text-lg font-semibold text-gray-900'>
                              {profile.studyPreferences?.preferredCourse || '-'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Specialization
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.studyPreferences?.specialization || '-'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Preferred Country
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.studyPreferences?.preferredCountry ||
                                '-'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Intended Intake
                            </label>
                            <p className='text-base text-gray-900'>
                              {profile.studyPreferences?.intendedIntake
                                ? `${
                                    profile.studyPreferences.intendedIntake
                                      .season || ''
                                  } ${
                                    profile.studyPreferences.intendedIntake
                                      .year || ''
                                  }`
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <div className='bg-gray-50 rounded-lg p-4'>
                            <h4 className='text-sm font-medium text-gray-900 mb-3'>
                              Interests & Support
                            </h4>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                {profile.studyPreferences
                                  ?.scholarshipInterest ? (
                                  <FiCheck className='h-4 w-4 text-green-600' />
                                ) : (
                                  <FiX className='h-4 w-4 text-gray-400' />
                                )}
                                <span className='text-sm text-gray-700'>
                                  Scholarship Interest
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                {profile.studyPreferences?.coOpInterest ? (
                                  <FiCheck className='h-4 w-4 text-green-600' />
                                ) : (
                                  <FiX className='h-4 w-4 text-gray-400' />
                                )}
                                <span className='text-sm text-gray-700'>
                                  Co-op Programs
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                {profile.studyPreferences?.familyAbroad ? (
                                  <FiCheck className='h-4 w-4 text-green-600' />
                                ) : (
                                  <FiX className='h-4 w-4 text-gray-400' />
                                )}
                                <span className='text-sm text-gray-700'>
                                  Family Abroad
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                {profile.studyPreferences
                                  ?.accommodationSupport ? (
                                  <FiCheck className='h-4 w-4 text-green-600' />
                                ) : (
                                  <FiX className='h-4 w-4 text-gray-400' />
                                )}
                                <span className='text-sm text-gray-700'>
                                  Accommodation Support
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferred Universities */}
                    {profile.studyPreferences?.preferredUniversities &&
                      profile.studyPreferences.preferredUniversities.length >
                        0 && (
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                            Preferred Universities (
                            {
                              profile.studyPreferences.preferredUniversities
                                .length
                            }
                            )
                          </h3>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {profile.studyPreferences.preferredUniversities.map(
                              (universityId, index) => (
                                <div
                                  key={universityId}
                                  className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                                >
                                  <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                      <span className='text-sm font-semibold text-blue-600'>
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <p className='font-medium text-gray-900'>
                                        {universities[universityId]?.name ||
                                          `University ${universityId}`}
                                      </p>
                                      {universities[universityId]?.city && (
                                        <p className='text-sm text-gray-600'>
                                          {universities[universityId].city},{' '}
                                          {universities[universityId].country}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Study Motivation */}
                    {profile.studyPreferences?.studyReason && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Why Study Abroad?
                        </h3>
                        <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
                          <p className='text-gray-800 leading-relaxed'>
                            {profile.studyPreferences.studyReason}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Career Goals */}
                    {profile.studyPreferences?.careerGoals && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Career Goals
                        </h3>
                        <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
                          <p className='text-gray-800 leading-relaxed'>
                            {profile.studyPreferences.careerGoals}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'financial' && (
                  <div className='space-y-6'>
                    {/* Financial Overview */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Financial Information
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='bg-blue-50 rounded-lg p-4'>
                          <label className='text-sm font-medium text-blue-600'>
                            Funding Source
                          </label>
                          <p className='text-lg font-semibold text-blue-900'>
                            {profile.financialInfo?.fundingSource || '-'}
                          </p>
                        </div>
                        <div className='bg-green-50 rounded-lg p-4'>
                          <label className='text-sm font-medium text-green-600'>
                            Budget Range
                          </label>
                          <p className='text-lg font-semibold text-green-900'>
                            {profile.financialInfo?.budgetConstraints || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sponsor Details */}
                    {profile.financialInfo?.sponsorDetails && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Sponsor Information
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Sponsor Name
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.financialInfo.sponsorDetails
                                  .sponsorName || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Relationship
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.financialInfo.sponsorDetails
                                  .sponsorRelation || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                CNIC/ID
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.financialInfo.sponsorDetails
                                  .sponsorCnic || '-'}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Annual Income
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.financialInfo.sponsorDetails
                                  .sponsorAnnualIncome || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Financial Documents */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Financial Documents
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Bank Statements */}
                        <div
                          className={`p-4 rounded-lg border ${
                            profile.financialInfo?.bankStatementsSubmitted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {profile.financialInfo?.bankStatementsSubmitted ? (
                              <FiCheck className='h-5 w-5 text-green-600' />
                            ) : (
                              <FiX className='h-5 w-5 text-gray-400' />
                            )}
                            <span className='font-medium text-gray-900'>
                              Bank Statements
                            </span>
                          </div>
                          <p className='text-sm text-gray-600'>Last 6 months</p>
                          {profile.financialInfo?.bankStatementDocId && (
                            <div className='mt-2'>
                              <DocumentLink
                                docId={profile.financialInfo.bankStatementDocId}
                                label='Bank Statements'
                              />
                            </div>
                          )}
                        </div>

                        {/* Financial Affidavit */}
                        <div
                          className={`p-4 rounded-lg border ${
                            profile.financialInfo?.financialAffidavit
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {profile.financialInfo?.financialAffidavit ? (
                              <FiCheck className='h-5 w-5 text-green-600' />
                            ) : (
                              <FiX className='h-5 w-5 text-gray-400' />
                            )}
                            <span className='font-medium text-gray-900'>
                              Financial Affidavit
                            </span>
                          </div>
                          <p className='text-sm text-gray-600'>
                            Sponsorship letter
                          </p>
                          {profile.financialInfo?.financialAffidavitDocId && (
                            <div className='mt-2'>
                              <DocumentLink
                                docId={
                                  profile.financialInfo.financialAffidavitDocId
                                }
                                label='Financial Affidavit'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Travel History */}
                    {profile.financialInfo?.travelHistory && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Travel & Visa History
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Travel History
                              </label>
                              <p className='text-base text-gray-900'>
                                {profile.financialInfo.travelHistory}
                              </p>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-gray-500'>
                                Visa Rejections
                              </label>
                              <div className='flex items-center gap-2'>
                                {profile.financialInfo.visaRejections ? (
                                  <>
                                    <FiAlertCircle className='h-4 w-4 text-yellow-600' />
                                    <span className='text-yellow-800'>
                                      Previous rejections
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <FiCheck className='h-4 w-4 text-green-600' />
                                    <span className='text-green-800'>
                                      No rejections
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Legal & Medical Documents */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Legal & Medical Documents
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Police Clearance */}
                        <div
                          className={`p-4 rounded-lg border ${
                            profile.financialInfo?.policeClearanceCertificate
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {profile.financialInfo
                              ?.policeClearanceCertificate ? (
                              <FiCheck className='h-5 w-5 text-green-600' />
                            ) : (
                              <FiX className='h-5 w-5 text-gray-400' />
                            )}
                            <span className='font-medium text-gray-900'>
                              Police Clearance
                            </span>
                          </div>
                          {profile.financialInfo?.policeClearanceDocId && (
                            <DocumentLink
                              docId={profile.financialInfo.policeClearanceDocId}
                              label='Police Clearance Certificate'
                            />
                          )}
                        </div>

                        {/* Medical Clearance */}
                        <div
                          className={`p-4 rounded-lg border ${
                            profile.financialInfo?.medicalClearance
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {profile.financialInfo?.medicalClearance ? (
                              <FiCheck className='h-5 w-5 text-green-600' />
                            ) : (
                              <FiX className='h-5 w-5 text-gray-400' />
                            )}
                            <span className='font-medium text-gray-900'>
                              Medical Clearance
                            </span>
                          </div>
                          {profile.financialInfo?.medicalConditions && (
                            <p className='text-sm text-gray-600 mb-2'>
                              Conditions:{' '}
                              {profile.financialInfo.medicalConditions}
                            </p>
                          )}
                          {profile.financialInfo?.medicalClearanceDocId && (
                            <DocumentLink
                              docId={
                                profile.financialInfo.medicalClearanceDocId
                              }
                              label='Medical Clearance Certificate'
                            />
                          )}
                        </div>

                        {/* Domicile Certificate */}
                        <div
                          className={`p-4 rounded-lg border ${
                            profile.financialInfo?.domicileCertificateSubmitted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {profile.financialInfo
                              ?.domicileCertificateSubmitted ? (
                              <FiCheck className='h-5 w-5 text-green-600' />
                            ) : (
                              <FiX className='h-5 w-5 text-gray-400' />
                            )}
                            <span className='font-medium text-gray-900'>
                              Domicile Certificate
                            </span>
                          </div>
                          {profile.financialInfo?.domicileCertificateDocId && (
                            <DocumentLink
                              docId={
                                profile.financialInfo.domicileCertificateDocId
                              }
                              label='Domicile Certificate'
                            />
                          )}
                        </div>

                        {/* NOC */}
                        <div
                          className={`p-4 rounded-lg border ${
                            profile.financialInfo?.nocRequired
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            {profile.financialInfo?.nocRequired ? (
                              <FiCheck className='h-5 w-5 text-green-600' />
                            ) : (
                              <FiX className='h-5 w-5 text-gray-400' />
                            )}
                            <span className='font-medium text-gray-900'>
                              No Objection Certificate
                            </span>
                          </div>
                          {profile.financialInfo?.nocDocId && (
                            <DocumentLink
                              docId={profile.financialInfo.nocDocId}
                              label='NOC Certificate'
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {profile.financialInfo?.additionalInfo && (
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                          Additional Information
                        </h3>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <p className='text-gray-800 leading-relaxed'>
                            {profile.financialInfo.additionalInfo}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
