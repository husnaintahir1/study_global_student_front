import React, { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import { ProfileBuilder } from '@/components/profile/ProfileBuilder';
import { profileService } from '@/services/profile.service';
import { StudentProfile } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['personal'])
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      const status = await profileService.getReviewStatus();
      console.log(profileData, 'sdasdadasd');
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

  const getCompletionPercentage = () => {
    if (!profile?.profileCompletionStatus) return 0;
    return profile.profileCompletionStatus.overallPercentage;
  };

  const getReviewStatusBadge = () => {
    if (!reviewStatus?.status) return null;

    const statusConfig = {
      pending: {
        icon: FiClock,
        color: 'text-yellow-600 bg-yellow-100',
        text: 'Under Review',
      },
      approved: {
        icon: FiCheckCircle,
        color: 'text-green-600 bg-green-100',
        text: 'Approved',
      },
      rejected: {
        icon: FiAlertCircle,
        color: 'text-red-600 bg-red-100',
        text: 'Needs Revision',
      },
    };

    const config =
      statusConfig[reviewStatus.status as keyof typeof statusConfig];
    const Icon = config?.icon;

    return (
      config &&
      Icon && (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
        >
          <Icon className='h-4 w-4 mr-1' />
          {config.text}
        </div>
      )
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }
  console.log(profile);
  if (!profile || isEditing) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {profile ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className='text-gray-600 mt-1'>
            {profile
              ? 'Update your information to keep your profile current'
              : 'Tell us about yourself to get personalized study abroad recommendations'}
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
          <div className='text-center'>
            <button
              onClick={() => setIsEditing(false)}
              className='btn btn-outline'
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
    <div className='card'>
      <button
        onClick={() => toggleSection(id)}
        className='w-full flex items-center justify-between p-6 -m-6 hover:bg-gray-50 rounded-lg transition-colors'
      >
        <div className='flex items-center gap-3'>
          <Icon className='h-5 w-5 text-gray-600' />
          <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
          {isComplete && <FiCheckCircle className='h-5 w-5 text-green-600' />}
        </div>
        {expandedSections.has(id) ? (
          <FiChevronUp className='h-5 w-5 text-gray-400' />
        ) : (
          <FiChevronDown className='h-5 w-5 text-gray-400' />
        )}
      </button>
      {expandedSections.has(id) && (
        <div className='mt-6 pt-6 border-t'>{children}</div>
      )}
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Your Profile</h1>
          <p className='text-gray-600 mt-1'>
            Manage your personal and academic information
          </p>
        </div>
        <div className='flex items-center gap-4'>
          {getReviewStatusBadge()}
          <button
            onClick={() => setIsEditing(true)}
            className='btn btn-outline flex items-center gap-2'
          >
            <FiEdit2 className='h-4 w-4' />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Completion Progress */}
      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Profile Completion
          </h3>
          <span className='text-2xl font-bold text-primary-600'>
            {getCompletionPercentage()}%
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3'>
          <div
            className='bg-primary-600 h-3 rounded-full transition-all duration-500'
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-2 mt-4'>
          {Object.entries(profile.profileCompletionStatus || {}).map(
            ([key, value]) => {
              if (key === 'overallPercentage') return null;
              return (
                <div key={key} className='flex items-center gap-2'>
                  {value ? (
                    <FiCheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <div className='h-4 w-4 rounded-full border-2 border-gray-300' />
                  )}
                  <span className='text-sm text-gray-600 capitalize'>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {reviewStatus?.status === 'rejected' && reviewStatus?.comments && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-red-900 mb-1'>
            Revision Required
          </h4>
          <p className='text-sm text-red-700'>{reviewStatus.comments}</p>
        </div>
      )}

      {/* Personal Details */}
      <ProfileSection
        id='personal'
        title='Personal Details'
        icon={FiUser}
        isComplete={profile.profileCompletionStatus?.personalInfo || false}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium text-gray-900 mb-3'>
              Basic Information
            </h4>
            <dl className='space-y-2'>
              <div>
                <dt className='text-sm text-gray-600'>Full Name</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.fullName?.firstName}{' '}
                  {profile.personalInfo?.fullName?.lastName}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Father's Name</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.fatherName || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Date of Birth</dt>
                <dd className='text-gray-900'>
                  {formatDate(profile.personalInfo?.dateOfBirth)}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Gender</dt>
                <dd className='text-gray-900 capitalize'>
                  {profile.personalInfo?.gender || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>CNIC</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.cnicNumber || '-'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 mb-3'>
              Contact & Address
            </h4>
            <dl className='space-y-2'>
              <div>
                <dt className='text-sm text-gray-600'>Phone</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.phone || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Email</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.email || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Address</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.permanentAddress?.street && (
                    <>
                      {profile.personalInfo.permanentAddress.street},{' '}
                      {profile.personalInfo.permanentAddress.city}
                      <br />
                      {profile.personalInfo.permanentAddress.provinceOfDomicile}
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Emergency Contact</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.emergencyContact?.name} (
                  {profile.personalInfo?.emergencyContact?.relation})
                  <br />
                  {profile.personalInfo?.emergencyContact?.phone}
                </dd>
              </div>
            </dl>
          </div>

          <div className='md:col-span-2'>
            <h4 className='font-medium text-gray-900 mb-3'>
              Passport Information
            </h4>
            <dl className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <dt className='text-sm text-gray-600'>Country</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.passportDetails?.passportCountry ||
                    '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Number</dt>
                <dd className='text-gray-900'>
                  {profile.personalInfo?.passportDetails?.passportNumber || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Expiry</dt>
                <dd className='text-gray-900'>
                  {formatDate(
                    profile.personalInfo?.passportDetails?.passportExpiry
                  )}
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
        <dl className='space-y-4'>
          <div>
            <dt className='text-sm text-gray-600'>Study Level</dt>
            <dd className='text-gray-900 capitalize'>
              {profile.educationalBackground?.studyLevel || '-'}
            </dd>
          </div>

          {profile.educationalBackground?.studyLevel === 'bachelor' && (
            <>
              {profile.educationalBackground?.matriculation && (
                <div>
                  <dt className='text-sm text-gray-600 font-medium'>
                    Matriculation
                  </dt>
                  <dd className='text-gray-900'>
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
                  <dt className='text-sm text-gray-600 font-medium'>
                    Intermediate
                  </dt>
                  <dd className='text-gray-900'>
                    {profile.educationalBackground.intermediate.board} (
                    {profile.educationalBackground.intermediate.year}) -{' '}
                    {profile.educationalBackground.intermediate.scorePercentage}
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
                <dt className='text-sm text-gray-600 font-medium'>
                  Bachelor's Degree
                </dt>
                <dd className='text-gray-900'>
                  {profile.educationalBackground.bachelorDegree.programName}
                  {profile.educationalBackground.bachelorDegree
                    .specialization &&
                    ` - ${profile.educationalBackground.bachelorDegree.specialization}`}
                  <br />
                  {
                    profile.educationalBackground.bachelorDegree.institution
                  }, {profile.educationalBackground.bachelorDegree.country}
                  <br />
                  CGPA:{' '}
                  {profile.educationalBackground.bachelorDegree.cgpaPercentage}
                </dd>
              </div>
            )}

          {profile.educationalBackground?.educationalGap && (
            <div>
              <dt className='text-sm text-gray-600'>Educational Gap</dt>
              <dd className='text-gray-900'>
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
        <div className='space-y-4'>
          {profile.testScores?.ieltsScores && (
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>IELTS</h4>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-sm'>
                <div className='bg-gray-50 p-2 rounded'>
                  <span className='text-gray-600'>Listening:</span>{' '}
                  {profile.testScores.ieltsScores.listening}
                </div>
                <div className='bg-gray-50 p-2 rounded'>
                  <span className='text-gray-600'>Reading:</span>{' '}
                  {profile.testScores.ieltsScores.reading}
                </div>
                <div className='bg-gray-50 p-2 rounded'>
                  <span className='text-gray-600'>Writing:</span>{' '}
                  {profile.testScores.ieltsScores.writing}
                </div>
                <div className='bg-gray-50 p-2 rounded'>
                  <span className='text-gray-600'>Speaking:</span>{' '}
                  {profile.testScores.ieltsScores.speaking}
                </div>
                <div className='bg-primary-50 p-2 rounded'>
                  <span className='text-gray-600'>Overall:</span>{' '}
                  <strong>{profile.testScores.ieltsScores.total}</strong>
                </div>
              </div>
            </div>
          )}

          {profile.testScores?.toeflScore && (
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>TOEFL</h4>
              <p className='text-gray-900'>
                Score: {profile.testScores.toeflScore}
              </p>
            </div>
          )}

          {(profile.testScores?.satScore ||
            profile.testScores?.greScore ||
            profile.testScores?.gmatScore) && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {profile.testScores.satScore && (
                <div className='bg-gray-50 p-3 rounded'>
                  <h4 className='font-medium text-gray-900'>SAT</h4>
                  <p className='text-2xl font-bold text-gray-900'>
                    {profile.testScores.satScore}
                  </p>
                </div>
              )}
              {profile.testScores.greScore && (
                <div className='bg-gray-50 p-3 rounded'>
                  <h4 className='font-medium text-gray-900'>GRE</h4>
                  <p className='text-2xl font-bold text-gray-900'>
                    {profile.testScores.greScore}
                  </p>
                </div>
              )}
              {profile.testScores.gmatScore && (
                <div className='bg-gray-50 p-3 rounded'>
                  <h4 className='font-medium text-gray-900'>GMAT</h4>
                  <p className='text-2xl font-bold text-gray-900'>
                    {profile.testScores.gmatScore}
                  </p>
                </div>
              )}
            </div>
          )}

          {profile.testScores?.workExperience && (
            <div>
              <dt className='text-sm text-gray-600'>Work Experience</dt>
              <dd className='text-gray-900'>
                {profile.testScores.workExperience}
              </dd>
            </div>
          )}
        </div>
      </ProfileSection>

      {/* Study studyPreferences */}
      <ProfileSection
        id='studyPreferences'
        title='Study studyPreferences'
        icon={FiGlobe}
        isComplete={profile.profileCompletionStatus?.studyPreferences || false}
      >
        <dl className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <dt className='text-sm text-gray-600'>Preferred Course</dt>
            <dd className='text-gray-900'>
              {profile.studyPreferences?.preferredCourse || '-'}
            </dd>
          </div>
          <div>
            <dt className='text-sm text-gray-600'>Specialization</dt>
            <dd className='text-gray-900'>
              {profile.studyPreferences?.specialization || '-'}
            </dd>
          </div>
          <div>
            <dt className='text-sm text-gray-600'>Country</dt>
            <dd className='text-gray-900'>
              {profile.studyPreferences?.preferredCountry || '-'}
            </dd>
          </div>
          <div>
            <dt className='text-sm text-gray-600'>Intake</dt>
            <dd className='text-gray-900'>
              {profile.studyPreferences?.intendedIntake?.season}{' '}
              {profile.studyPreferences?.intendedIntake?.year}
            </dd>
          </div>
          <div className='md:col-span-2'>
            <dt className='text-sm text-gray-600'>Selected Universities</dt>
            <dd className='text-gray-900'>
              {profile.studyPreferences?.preferredUniversities?.length || 0}{' '}
              universities selected
            </dd>
          </div>
          <div className='md:col-span-2'>
            <dt className='text-sm text-gray-600'>Study Motivation</dt>
            <dd className='text-gray-900'>
              {profile.studyPreferences?.studyReason || '-'}
            </dd>
          </div>
        </dl>
      </ProfileSection>

      {/* Financial Documentation */}
      <ProfileSection
        id='financial'
        title='Financial & Documentation'
        icon={FiDollarSign}
        isComplete={profile.profileCompletionStatus?.financialInfo || false}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium text-gray-900 mb-3'>
              Financial Information
            </h4>
            <dl className='space-y-2'>
              <div>
                <dt className='text-sm text-gray-600'>Funding Source</dt>
                <dd className='text-gray-900'>
                  {profile.financialInfo?.fundingSource || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-600'>Budget Range</dt>
                <dd className='text-gray-900'>
                  {profile.financialInfo?.budgetConstraints || '-'}
                </dd>
              </div>
              {profile.financialInfo?.sponsorDetails && (
                <div>
                  <dt className='text-sm text-gray-600'>Sponsor</dt>
                  <dd className='text-gray-900'>
                    {profile.financialInfo.sponsorDetails.sponsorName}(
                    {profile.financialInfo.sponsorDetails.sponsorRelation})
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 mb-3'>
              Documentation Status
            </h4>
            <div className='space-y-2'>
              {[
                { key: 'bankStatementsSubmitted', label: 'Bank Statements' },
                { key: 'financialAffidavit', label: 'Financial Affidavit' },
                {
                  key: 'policeClearanceCertificate',
                  label: 'Police Clearance',
                },
                { key: 'medicalClearance', label: 'Medical Clearance' },
                {
                  key: 'domicileCertificateSubmitted',
                  label: 'Domicile Certificate',
                },
              ].map((doc) => (
                <div key={doc.key} className='flex items-center gap-2'>
                  {profile.financialInfo?.[
                    doc.key as keyof typeof profile.financialInfo
                  ] ? (
                    <FiCheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <div className='h-4 w-4 rounded-full border-2 border-gray-300' />
                  )}
                  <span className='text-sm text-gray-700'>{doc.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProfileSection>

      {reviewStatus?.status !== 'pending' && (
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
            className='btn btn-primary'
          >
            Submit for Review
          </button>
        </div>
      )}
    </div>
  );
};
