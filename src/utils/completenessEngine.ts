// Enhanced Profile Completeness Service
// Handles dynamic form structure with conditional requirements

export interface ProfileCompletenessResult {
  overallPercentage: number;
  sectionCompleteness: {
    personalInfo: number;
    educationalBackground: number;
    testScores: number;
    studyPreferences: number;
    financialInfo: number;
  };
  sectionDetails: {
    [sectionName: string]: {
      essentialFields: { total: number; completed: number };
      optionalFields: { total: number; completed: number };
      conditionalFields: { total: number; completed: number };
      missingCriticalFields: string[];
    };
  };
  missingSections: string[];
  recommendations: string[];
  isSubmissionReady: boolean;
}

interface FieldDefinition {
  path: string;
  weight: number;
  condition?: (data: any) => boolean;
  validator?: (value: any) => boolean;
  description?: string;
}

interface SectionConfig {
  essential: FieldDefinition[];
  optional: FieldDefinition[];
  conditional: {
    [key: string]: FieldDefinition[];
  };
  validators?: {
    [key: string]: (data: any) => boolean;
  };
}

export class ProfileCompletenessService {
  // Section weights - should total 100
  private static readonly SECTION_WEIGHTS = {
    personalInfo: 25,
    educationalBackground: 30,
    testScores: 20,
    studyPreferences: 15,
    financialInfo: 10,
  };

  // Minimum completion thresholds
  private static readonly COMPLETION_THRESHOLDS = {
    excellent: 95,
    good: 85,
    fair: 70,
    poor: 50,
    incomplete: 30,
  };

  /**
   * Personal Information Section Configuration
   */
  private static readonly PERSONAL_INFO_CONFIG: SectionConfig = {
    essential: [
      { path: 'fullName.firstName', weight: 5, description: 'First Name' },
      { path: 'fullName.lastName', weight: 5, description: 'Last Name' },
      { path: 'fatherName', weight: 3, description: "Father's Name" },
      {
        path: 'dateOfBirth',
        weight: 4,
        description: 'Date of Birth',
        validator: (value) => this.isValidDate(value),
      },
      { path: 'gender', weight: 3, description: 'Gender' },
      {
        path: 'cnicNumber',
        weight: 5,
        description: 'CNIC Number',
        validator: (value) => this.isValidCNIC(value),
      },
      {
        path: 'phone',
        weight: 4,
        description: 'Phone Number',
        validator: (value) => this.isValidPhone(value),
      },
      {
        path: 'email',
        weight: 5,
        description: 'Email Address',
        validator: (value) => this.isValidEmail(value),
      },
      {
        path: 'permanentAddress.street',
        weight: 3,
        description: 'Street Address',
      },
      { path: 'permanentAddress.city', weight: 3, description: 'City' },
      {
        path: 'permanentAddress.provinceOfDomicile',
        weight: 3,
        description: 'Province',
      },
      {
        path: 'permanentAddress.postalCode',
        weight: 2,
        description: 'Postal Code',
      },
      {
        path: 'residenceCountry',
        weight: 3,
        description: 'Country of Residence',
      },
      {
        path: 'emergencyContact.name',
        weight: 3,
        description: 'Emergency Contact Name',
      },
      {
        path: 'emergencyContact.relation',
        weight: 2,
        description: 'Emergency Contact Relation',
      },
      {
        path: 'emergencyContact.phone',
        weight: 3,
        description: 'Emergency Contact Phone',
      },
      {
        path: 'passportDetails.passportCountry',
        weight: 4,
        description: 'Passport Country',
      },
      {
        path: 'passportDetails.passportNumber',
        weight: 4,
        description: 'Passport Number',
      },
      {
        path: 'passportDetails.passportExpiry',
        weight: 4,
        description: 'Passport Expiry',
        validator: (value) => this.isFutureDate(value),
      },
    ],
    optional: [
      { path: 'religion', weight: 1, description: 'Religion' },
      { path: 'profilePicture', weight: 2, description: 'Profile Picture' },
      {
        path: 'socialLinks.linkedin',
        weight: 1,
        description: 'LinkedIn Profile',
      },
      {
        path: 'socialLinks.facebook',
        weight: 1,
        description: 'Facebook Profile',
      },
      {
        path: 'socialLinks.instagram',
        weight: 1,
        description: 'Instagram Profile',
      },
    ],
    conditional: {},
    validators: {
      addressComplete: (data) =>
        !!(
          data?.permanentAddress?.street &&
          data?.permanentAddress?.city &&
          data?.permanentAddress?.provinceOfDomicile
        ),
      emergencyContactComplete: (data) =>
        !!(
          data?.emergencyContact?.name &&
          data?.emergencyContact?.relation &&
          data?.emergencyContact?.phone
        ),
      passportComplete: (data) =>
        !!(
          data?.passportDetails?.passportCountry &&
          data?.passportDetails?.passportNumber &&
          data?.passportDetails?.passportExpiry
        ),
    },
  };

  /**
   * Educational Background Section Configuration
   */
  private static readonly EDUCATIONAL_BACKGROUND_CONFIG: SectionConfig = {
    essential: [
      { path: 'studyLevel', weight: 8, description: 'Study Level' },
      { path: 'admissionYear', weight: 5, description: 'Admission Year' },
    ],
    optional: [
      {
        path: 'educationalGap',
        weight: 2,
        description: 'Educational Gap Explanation',
      },
      {
        path: 'additionalCertification',
        weight: 1,
        description: 'Additional Certifications',
      },
      {
        path: 'hecEquivalenceStatus.applied',
        weight: 2,
        description: 'HEC Equivalence Status',
      },
    ],
    conditional: {
      bachelor: [
        // Matriculation fields
        {
          path: 'matriculation.year',
          weight: 6,
          description: 'Matriculation Year',
        },
        {
          path: 'matriculation.board',
          weight: 4,
          description: 'Matriculation Board',
        },
        {
          path: 'matriculation.gradingSystem',
          weight: 3,
          description: 'Matriculation Grading System',
        },
        {
          path: 'matriculation.scorePercentage',
          weight: 5,
          description: 'Matriculation Percentage',
          condition: (data) =>
            data?.matriculation?.gradingSystem === 'percentage',
        },
        {
          path: 'matriculation.grades',
          weight: 5,
          description: 'Matriculation Grades',
          condition: (data) => data?.matriculation?.gradingSystem === 'grades',
          validator: (value) =>
            Array.isArray(value) &&
            value.length >= 3 &&
            value.every((g) => g.subject && g.grade),
        },
        // Intermediate fields
        {
          path: 'intermediate.year',
          weight: 6,
          description: 'Intermediate Year',
        },
        {
          path: 'intermediate.board',
          weight: 4,
          description: 'Intermediate Board',
        },
        {
          path: 'intermediate.gradingSystem',
          weight: 3,
          description: 'Intermediate Grading System',
        },
        {
          path: 'intermediate.scorePercentage',
          weight: 5,
          description: 'Intermediate Percentage',
          condition: (data) =>
            data?.intermediate?.gradingSystem === 'percentage',
        },
        {
          path: 'intermediate.grades',
          weight: 5,
          description: 'Intermediate Grades',
          condition: (data) => data?.intermediate?.gradingSystem === 'grades',
          validator: (value) =>
            Array.isArray(value) &&
            value.length >= 3 &&
            value.every((g) => g.subject && g.grade),
        },
        {
          path: 'intermediate.preEngineeringOrPreMedical',
          weight: 3,
          description: 'Intermediate Program',
        },
      ],
      master: [
        {
          path: 'bachelorDegree.programName',
          weight: 8,
          description: "Bachelor's Program",
        },
        {
          path: 'bachelorDegree.institution',
          weight: 6,
          description: "Bachelor's Institution",
        },
        {
          path: 'bachelorDegree.country',
          weight: 4,
          description: "Bachelor's Country",
        },
        {
          path: 'bachelorDegree.startDate',
          weight: 3,
          description: "Bachelor's Start Date",
        },
        {
          path: 'bachelorDegree.endDate',
          weight: 3,
          description: "Bachelor's End Date",
        },
        {
          path: 'bachelorDegree.cgpaPercentage',
          weight: 6,
          description: "Bachelor's CGPA",
        },
        // Work experience for master's
        {
          path: 'workExperience',
          weight: 8,
          description: 'Work Experience',
          validator: (value) =>
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((exp) => exp.company && exp.position && exp.startDate),
        },
      ],
      phd: [
        {
          path: 'bachelorDegree.programName',
          weight: 6,
          description: "Bachelor's Program",
        },
        {
          path: 'bachelorDegree.institution',
          weight: 4,
          description: "Bachelor's Institution",
        },
        {
          path: 'bachelorDegree.country',
          weight: 3,
          description: "Bachelor's Country",
        },
        {
          path: 'bachelorDegree.startDate',
          weight: 2,
          description: "Bachelor's Start Date",
        },
        {
          path: 'bachelorDegree.endDate',
          weight: 2,
          description: "Bachelor's End Date",
        },
        {
          path: 'bachelorDegree.cgpaPercentage',
          weight: 4,
          description: "Bachelor's CGPA",
        },
        {
          path: 'masterDegree.programName',
          weight: 8,
          description: "Master's Program",
        },
        {
          path: 'masterDegree.institution',
          weight: 6,
          description: "Master's Institution",
        },
        {
          path: 'masterDegree.country',
          weight: 4,
          description: "Master's Country",
        },
        {
          path: 'masterDegree.startDate',
          weight: 3,
          description: "Master's Start Date",
        },
        {
          path: 'masterDegree.endDate',
          weight: 3,
          description: "Master's End Date",
        },
        {
          path: 'masterDegree.cgpaPercentage',
          weight: 6,
          description: "Master's CGPA",
        },
      ],
      diploma: [
        {
          path: 'diploma.programName',
          weight: 10,
          description: 'Diploma Program',
        },
        {
          path: 'diploma.institution',
          weight: 8,
          description: 'Diploma Institution',
        },
        { path: 'diploma.year', weight: 5, description: 'Diploma Year' },
      ],
      // Additional certification fields
      additionalCertEnabled: [
        {
          path: 'diploma.programName',
          weight: 5,
          description: 'Additional Certification Program',
          condition: (data) => data?.additionalCertification === true,
        },
        {
          path: 'diploma.institution',
          weight: 4,
          description: 'Additional Certification Institution',
          condition: (data) => data?.additionalCertification === true,
        },
        {
          path: 'diploma.year',
          weight: 3,
          description: 'Additional Certification Year',
          condition: (data) => data?.additionalCertification === true,
        },
      ],
      // HEC equivalence fields
      hecEquivalenceEnabled: [
        {
          path: 'hecEquivalenceStatus.obtainedDate',
          weight: 5,
          description: 'HEC Equivalence Date',
          condition: (data) => data?.hecEquivalenceStatus?.applied === true,
        },
      ],
    },
    validators: {
      matriculationComplete: (data) => {
        if (data?.studyLevel !== 'bachelor') return true;
        const matric = data?.matriculation;
        if (!matric) return false;

        const basicFields = matric.year && matric.board && matric.gradingSystem;
        if (!basicFields) return false;

        if (matric.gradingSystem === 'percentage') {
          return !!matric.scorePercentage;
        } else if (matric.gradingSystem === 'grades') {
          return Array.isArray(matric.grades) && matric.grades.length >= 3;
        }
        return false;
      },
      intermediateComplete: (data) => {
        if (data?.studyLevel !== 'bachelor') return true;
        const inter = data?.intermediate;
        if (!inter) return false;

        const basicFields =
          inter.year &&
          inter.board &&
          inter.gradingSystem &&
          inter.preEngineeringOrPreMedical;
        if (!basicFields) return false;

        if (inter.gradingSystem === 'percentage') {
          return !!inter.scorePercentage;
        } else if (inter.gradingSystem === 'grades') {
          return Array.isArray(inter.grades) && inter.grades.length >= 3;
        }
        return false;
      },
      bachelorDegreeComplete: (data) => {
        if (!['master', 'phd'].includes(data?.studyLevel)) return true;
        const bachelor = data?.bachelorDegree;
        return !!(
          bachelor?.programName &&
          bachelor?.institution &&
          bachelor?.country &&
          bachelor?.startDate &&
          bachelor?.endDate &&
          bachelor?.cgpaPercentage
        );
      },
      masterDegreeComplete: (data) => {
        if (data?.studyLevel !== 'phd') return true;
        const master = data?.masterDegree;
        return !!(
          master?.programName &&
          master?.institution &&
          master?.country &&
          master?.startDate &&
          master?.endDate &&
          master?.cgpaPercentage
        );
      },
    },
  };

  /**
   * Test Scores Section Configuration
   */
  private static readonly TEST_SCORES_CONFIG: SectionConfig = {
    essential: [
      // At least one English proficiency test is essential
    ],
    optional: [
      {
        path: 'partTimeWork',
        weight: 2,
        description: 'Part-time Work Interest',
      },
      { path: 'backlogs', weight: 3, description: 'Academic Backlogs' },
      {
        path: 'workExperience',
        weight: 5,
        description: 'Work Experience Details',
      },
    ],
    conditional: {
      // English Proficiency Tests (at least one required)
      ielts: [
        {
          path: 'ieltsScores.listening',
          weight: 4,
          description: 'IELTS Listening Score',
        },
        {
          path: 'ieltsScores.reading',
          weight: 4,
          description: 'IELTS Reading Score',
        },
        {
          path: 'ieltsScores.writing',
          weight: 4,
          description: 'IELTS Writing Score',
        },
        {
          path: 'ieltsScores.speaking',
          weight: 4,
          description: 'IELTS Speaking Score',
        },
        {
          path: 'ieltsScores.total',
          weight: 6,
          description: 'IELTS Overall Band',
        },
        {
          path: 'ieltsScores.testDate',
          weight: 3,
          description: 'IELTS Test Date',
        },
      ],
      toefl: [
        {
          path: 'toeflScore.total',
          weight: 15,
          description: 'TOEFL Total Score',
        },
        {
          path: 'toeflScore.testDate',
          weight: 5,
          description: 'TOEFL Test Date',
        },
      ],
      pte: [
        { path: 'pteScore.total', weight: 15, description: 'PTE Total Score' },
        { path: 'pteScore.testDate', weight: 5, description: 'PTE Test Date' },
      ],
      duolingo: [
        {
          path: 'duolingoScore.total',
          weight: 15,
          description: 'Duolingo Total Score',
        },
        {
          path: 'duolingoScore.testDate',
          weight: 5,
          description: 'Duolingo Test Date',
        },
      ],
      // Standardized Tests (optional but valuable)
      sat: [
        { path: 'satScore.total', weight: 10, description: 'SAT Total Score' },
        { path: 'satScore.testDate', weight: 3, description: 'SAT Test Date' },
      ],
      act: [
        {
          path: 'actScore.composite',
          weight: 10,
          description: 'ACT Composite Score',
        },
        { path: 'actScore.testDate', weight: 3, description: 'ACT Test Date' },
      ],
      gre: [
        { path: 'greScore.verbal', weight: 4, description: 'GRE Verbal Score' },
        {
          path: 'greScore.quantitative',
          weight: 4,
          description: 'GRE Quantitative Score',
        },
        {
          path: 'greScore.analytical',
          weight: 4,
          description: 'GRE Analytical Score',
        },
        { path: 'greScore.testDate', weight: 3, description: 'GRE Test Date' },
      ],
      gmat: [
        {
          path: 'gmatScore.total',
          weight: 12,
          description: 'GMAT Total Score',
        },
        {
          path: 'gmatScore.testDate',
          weight: 3,
          description: 'GMAT Test Date',
        },
      ],
      neet: [
        { path: 'neetScore.total', weight: 12, description: 'NEET Score' },
        {
          path: 'neetScore.testDate',
          weight: 3,
          description: 'NEET Test Date',
        },
      ],
      mcat: [
        {
          path: 'mcatScore.total',
          weight: 12,
          description: 'MCAT Total Score',
        },
        {
          path: 'mcatScore.testDate',
          weight: 3,
          description: 'MCAT Test Date',
        },
      ],
    },
    validators: {
      hasEnglishProficiencyTest: (data) =>
        !!(
          data?.ieltsScores?.total ||
          data?.toeflScore?.total ||
          data?.pteScore?.total ||
          data?.duolingoScore?.total
        ),
      ieltsComplete: (data) => {
        const ielts = data?.ieltsScores;
        return !!(
          ielts?.listening &&
          ielts?.reading &&
          ielts?.writing &&
          ielts?.speaking &&
          ielts?.total &&
          ielts?.testDate
        );
      },
      testScoresValidDates: (data) => {
        const tests = [
          'ieltsScores',
          'toeflScore',
          'pteScore',
          'duolingoScore',
          'satScore',
          'actScore',
          'greScore',
          'gmatScore',
          'neetScore',
          'mcatScore',
        ];

        return tests.every((test) => {
          const testData = data?.[test];
          if (!testData?.testDate) return true; // If no test, skip validation
          return this.isValidTestDate(testData.testDate);
        });
      },
    },
  };

  /**
   * Study Preferences Section Configuration
   */
  private static readonly STUDY_PREFERENCES_CONFIG: SectionConfig = {
    essential: [
      { path: 'preferredCourse', weight: 15, description: 'Field of Study' },
      {
        path: 'preferredCountry',
        weight: 15,
        description: 'Preferred Country',
      },
      {
        path: 'intendedIntake.season',
        weight: 8,
        description: 'Intake Season',
      },
      { path: 'intendedIntake.year', weight: 8, description: 'Intake Year' },
      {
        path: 'studyReason',
        weight: 12,
        description: 'Study Motivation',
        validator: (value) => value && value.length >= 50,
      },
      {
        path: 'careerGoals',
        weight: 12,
        description: 'Career Goals',
        validator: (value) => value && value.length >= 50,
      },
    ],
    optional: [
      { path: 'specialization', weight: 5, description: 'Specialization' },
      {
        path: 'preferredUniversities',
        weight: 8,
        description: 'Preferred Universities',
        validator: (value) => Array.isArray(value) && value.length > 0,
      },
      {
        path: 'scholarshipInterest',
        weight: 3,
        description: 'Scholarship Interest',
      },
      { path: 'coOpInterest', weight: 3, description: 'Co-op Interest' },
      { path: 'familyAbroad', weight: 2, description: 'Family Abroad' },
      {
        path: 'accommodationSupport',
        weight: 2,
        description: 'Accommodation Support',
      },
    ],
    conditional: {},
    validators: {
      intakeComplete: (data) =>
        !!(data?.intendedIntake?.season && data?.intendedIntake?.year),
      motivationComplete: (data) =>
        !!(data?.studyReason?.length >= 50 && data?.careerGoals?.length >= 50),
      hasUniversitySelection: (data) =>
        Array.isArray(data?.preferredUniversities) &&
        data.preferredUniversities.length > 0,
    },
  };

  /**
   * Financial Info Section Configuration
   */
  private static readonly FINANCIAL_INFO_CONFIG: SectionConfig = {
    essential: [
      { path: 'fundingSource', weight: 15, description: 'Funding Source' },
      { path: 'budgetConstraints', weight: 12, description: 'Budget Range' },
      { path: 'travelHistory', weight: 8, description: 'Travel History' },
    ],
    optional: [
      {
        path: 'bankStatementsSubmitted',
        weight: 5,
        description: 'Bank Statements',
      },
      {
        path: 'financialAffidavit',
        weight: 5,
        description: 'Financial Affidavit',
      },
      {
        path: 'visaRejections',
        weight: 3,
        description: 'Visa Rejection History',
      },
      {
        path: 'policeClearanceCertificate',
        weight: 4,
        description: 'Police Clearance',
      },
      { path: 'medicalClearance', weight: 4, description: 'Medical Clearance' },
      {
        path: 'domicileCertificateSubmitted',
        weight: 3,
        description: 'Domicile Certificate',
      },
      { path: 'nocRequired', weight: 3, description: 'NOC Certificate' },
      {
        path: 'additionalInfo',
        weight: 2,
        description: 'Additional Information',
      },
    ],
    conditional: {
      sponsorRequired: [
        {
          path: 'sponsorDetails.sponsorName',
          weight: 10,
          description: 'Sponsor Name',
          condition: (data) =>
            ['Family Sponsor', 'Third Party Sponsor'].includes(
              data?.fundingSource
            ),
        },
        {
          path: 'sponsorDetails.sponsorRelation',
          weight: 8,
          description: 'Sponsor Relationship',
          condition: (data) =>
            ['Family Sponsor', 'Third Party Sponsor'].includes(
              data?.fundingSource
            ),
        },
        {
          path: 'sponsorDetails.sponsorCnic',
          weight: 8,
          description: 'Sponsor CNIC',
          condition: (data) =>
            ['Family Sponsor', 'Third Party Sponsor'].includes(
              data?.fundingSource
            ),
          validator: (value) => this.isValidCNIC(value),
        },
        {
          path: 'sponsorDetails.sponsorAnnualIncome',
          weight: 10,
          description: 'Sponsor Income',
          condition: (data) =>
            ['Family Sponsor', 'Third Party Sponsor'].includes(
              data?.fundingSource
            ),
        },
      ],
      medicalConditions: [
        {
          path: 'medicalConditions',
          weight: 5,
          description: 'Medical Conditions Details',
          condition: (data) => data?.medicalClearance === true,
        },
      ],
    },
    validators: {
      sponsorDetailsComplete: (data) => {
        const needsSponsor = ['Family Sponsor', 'Third Party Sponsor'].includes(
          data?.fundingSource
        );
        if (!needsSponsor) return true;

        const sponsor = data?.sponsorDetails;
        return !!(
          sponsor?.sponsorName &&
          sponsor?.sponsorRelation &&
          sponsor?.sponsorCnic &&
          sponsor?.sponsorAnnualIncome
        );
      },
      documentationAdequate: (data) => {
        const hasDocuments =
          data?.bankStatementsSubmitted || data?.financialAffidavit;
        return !!hasDocuments;
      },
    },
  };

  /**
   * Main calculation method
   */
  public static calculateCompleteness(profile: any): ProfileCompletenessResult {
    const sectionResults = {
      personalInfo: this.calculateSectionCompleteness(
        profile.personalInfo,
        this.PERSONAL_INFO_CONFIG
      ),
      educationalBackground: this.calculateSectionCompleteness(
        profile.educationalBackground,
        this.EDUCATIONAL_BACKGROUND_CONFIG
      ),
      testScores: this.calculateSectionCompleteness(
        profile.testScores,
        this.TEST_SCORES_CONFIG
      ),
      studyPreferences: this.calculateSectionCompleteness(
        profile.studyPreferences,
        this.STUDY_PREFERENCES_CONFIG
      ),
      financialInfo: this.calculateSectionCompleteness(
        profile.financialInfo,
        this.FINANCIAL_INFO_CONFIG
      ),
    };

    // Calculate weighted overall percentage
    const overallPercentage = Math.round(
      (sectionResults.personalInfo.percentage *
        this.SECTION_WEIGHTS.personalInfo +
        sectionResults.educationalBackground.percentage *
          this.SECTION_WEIGHTS.educationalBackground +
        sectionResults.testScores.percentage * this.SECTION_WEIGHTS.testScores +
        sectionResults.studyPreferences.percentage *
          this.SECTION_WEIGHTS.studyPreferences +
        sectionResults.financialInfo.percentage *
          this.SECTION_WEIGHTS.financialInfo) /
        100
    );

    // Extract section completeness percentages
    const sectionCompleteness = {
      personalInfo: sectionResults.personalInfo.percentage,
      educationalBackground: sectionResults.educationalBackground.percentage,
      testScores: sectionResults.testScores.percentage,
      studyPreferences: sectionResults.studyPreferences.percentage,
      financialInfo: sectionResults.financialInfo.percentage,
    };

    // Find missing sections
    const missingSections = Object.entries(sectionCompleteness)
      .filter(([_, percentage]) => percentage < this.COMPLETION_THRESHOLDS.fair)
      .map(([section, _]) => section);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      profile,
      sectionResults
    );

    // Check if ready for submission
    const isSubmissionReady = this.checkSubmissionReadiness(
      profile,
      sectionResults
    );

    return {
      overallPercentage,
      sectionCompleteness,
      sectionDetails: {
        personalInfo: sectionResults.personalInfo,
        educationalBackground: sectionResults.educationalBackground,
        testScores: sectionResults.testScores,
        studyPreferences: sectionResults.studyPreferences,
        financialInfo: sectionResults.financialInfo,
      },
      missingSections,
      recommendations,
      isSubmissionReady,
    };
  }

  /**
   * Calculate completeness for a specific section
   */
  private static calculateSectionCompleteness(
    sectionData: any,
    config: SectionConfig
  ): {
    percentage: number;
    essentialFields: { total: number; completed: number };
    optionalFields: { total: number; completed: number };
    conditionalFields: { total: number; completed: number };
    missingCriticalFields: string[];
  } {
    // Calculate essential fields
    const essentialResult = this.calculateFieldGroupCompleteness(
      sectionData,
      config.essential
    );

    // Calculate optional fields
    const optionalResult = this.calculateFieldGroupCompleteness(
      sectionData,
      config.optional
    );

    // Calculate conditional fields
    const conditionalFields = this.getConditionalFields(sectionData, config);
    const conditionalResult = this.calculateFieldGroupCompleteness(
      sectionData,
      conditionalFields
    );

    // Calculate overall section percentage
    const essentialWeight = 70; // Essential fields are 70% of the section
    const conditionalWeight = 20; // Conditional fields are 20% of the section
    const optionalWeight = 10; // Optional fields are 10% of the section

    const percentage = Math.round(
      (essentialResult.percentage * essentialWeight +
        conditionalResult.percentage * conditionalWeight +
        optionalResult.percentage * optionalWeight) /
        100
    );

    // Find missing critical fields
    const missingCriticalFields = this.findMissingCriticalFields(
      sectionData,
      config
    );

    return {
      percentage,
      essentialFields: {
        total: config.essential.length,
        completed: essentialResult.completed,
      },
      optionalFields: {
        total: config.optional.length,
        completed: optionalResult.completed,
      },
      conditionalFields: {
        total: conditionalFields.length,
        completed: conditionalResult.completed,
      },
      missingCriticalFields,
    };
  }

  /**
   * Calculate completeness for a group of fields
   */
  private static calculateFieldGroupCompleteness(
    data: any,
    fields: FieldDefinition[]
  ): {
    percentage: number;
    completed: number;
    totalWeight: number;
    completedWeight: number;
  } {
    if (fields.length === 0) {
      return {
        percentage: 100,
        completed: 0,
        totalWeight: 0,
        completedWeight: 0,
      };
    }

    let totalWeight = 0;
    let completedWeight = 0;
    let completed = 0;

    for (const field of fields) {
      // Check if field condition is met (if any)
      if (field.condition && !field.condition(data)) {
        continue; // Skip fields that don't meet their conditions
      }

      totalWeight += field.weight;
      const value = this.getNestedValue(data, field.path);

      // Check if field is completed
      const isCompleted = this.isFieldCompleted(value, field);
      if (isCompleted) {
        completedWeight += field.weight;
        completed++;
      }
    }

    const percentage =
      totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 100;

    return {
      percentage,
      completed,
      totalWeight,
      completedWeight,
    };
  }

  /**
   * Get conditional fields that apply to current data
   */
  private static getConditionalFields(
    data: any,
    config: SectionConfig
  ): FieldDefinition[] {
    const conditionalFields: FieldDefinition[] = [];

    // Handle educational background conditionals
    if (config === this.EDUCATIONAL_BACKGROUND_CONFIG) {
      const studyLevel = data?.studyLevel;
      if (studyLevel && config.conditional[studyLevel]) {
        conditionalFields.push(...config.conditional[studyLevel]);
      }

      // Additional certification fields
      if (
        data?.additionalCertification === true &&
        config.conditional.additionalCertEnabled
      ) {
        conditionalFields.push(...config.conditional.additionalCertEnabled);
      }

      // HEC equivalence fields
      if (
        data?.hecEquivalenceStatus?.applied === true &&
        config.conditional.hecEquivalenceEnabled
      ) {
        conditionalFields.push(...config.conditional.hecEquivalenceEnabled);
      }
    }

    // Handle test scores conditionals
    if (config === this.TEST_SCORES_CONFIG) {
      const testTypes = [
        'ielts',
        'toefl',
        'pte',
        'duolingo',
        'sat',
        'act',
        'gre',
        'gmat',
        'neet',
        'mcat',
      ];

      for (const testType of testTypes) {
        const hasTest = this.hasTestScore(data, testType);
        if (hasTest && config.conditional[testType]) {
          conditionalFields.push(...config.conditional[testType]);
        }
      }
    }

    // Handle financial info conditionals
    if (config === this.FINANCIAL_INFO_CONFIG) {
      // Sponsor details
      const needsSponsor = ['Family Sponsor', 'Third Party Sponsor'].includes(
        data?.fundingSource
      );
      if (needsSponsor && config.conditional.sponsorRequired) {
        conditionalFields.push(...config.conditional.sponsorRequired);
      }

      // Medical conditions
      if (
        data?.medicalClearance === true &&
        config.conditional.medicalConditions
      ) {
        conditionalFields.push(...config.conditional.medicalConditions);
      }
    }

    return conditionalFields;
  }

  /**
   * Check if a field is completed
   */
  private static isFieldCompleted(value: any, field: FieldDefinition): boolean {
    // Check if value exists and is not empty
    if (value === null || value === undefined || value === '') {
      return false;
    }

    // For arrays, check if not empty
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    // For objects, check if not empty
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return false;
    }

    // Apply custom validator if provided
    if (field.validator) {
      return field.validator(value);
    }

    return true;
  }

  /**
   * Find missing critical fields
   */
  private static findMissingCriticalFields(
    data: any,
    config: SectionConfig
  ): string[] {
    const missingFields: string[] = [];

    // Check essential fields
    for (const field of config.essential) {
      const value = this.getNestedValue(data, field.path);
      if (!this.isFieldCompleted(value, field)) {
        missingFields.push(field.description || field.path);
      }
    }

    // Check conditional fields
    const conditionalFields = this.getConditionalFields(data, config);
    for (const field of conditionalFields) {
      if (field.condition && !field.condition(data)) continue;

      const value = this.getNestedValue(data, field.path);
      if (!this.isFieldCompleted(value, field)) {
        missingFields.push(field.description || field.path);
      }
    }

    return missingFields;
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    profile: any,
    sectionResults: any
  ): string[] {
    const recommendations: string[] = [];

    // Personal Info recommendations
    if (
      sectionResults.personalInfo.percentage < this.COMPLETION_THRESHOLDS.good
    ) {
      if (
        sectionResults.personalInfo.missingCriticalFields.includes(
          'Profile Picture'
        )
      ) {
        recommendations.push(
          'Add a professional profile picture to enhance your application'
        );
      }
      if (
        sectionResults.personalInfo.missingCriticalFields.includes(
          'Passport Expiry'
        )
      ) {
        recommendations.push(
          'Ensure your passport is valid for at least 6 months beyond your intended travel date'
        );
      }
    }

    // Educational Background recommendations
    if (
      sectionResults.educationalBackground.percentage <
      this.COMPLETION_THRESHOLDS.good
    ) {
      const studyLevel = profile.educationalBackground?.studyLevel;
      if (studyLevel === 'bachelor') {
        recommendations.push(
          'Complete your matriculation and intermediate education details'
        );
      } else if (studyLevel === 'master') {
        recommendations.push(
          "Add your bachelor's degree information and relevant work experience"
        );
      }
    }

    // Test Scores recommendations
    if (
      sectionResults.testScores.percentage < this.COMPLETION_THRESHOLDS.good
    ) {
      const hasEnglishTest =
        this.TEST_SCORES_CONFIG.validators?.hasEnglishProficiencyTest(
          profile.testScores
        );
      if (!hasEnglishTest) {
        recommendations.push(
          'Add English proficiency test scores (IELTS, TOEFL, PTE, or Duolingo)'
        );
      }

      const studyLevel = profile.educationalBackground?.studyLevel;
      if (['master', 'phd'].includes(studyLevel)) {
        recommendations.push(
          'Consider adding GRE or GMAT scores to strengthen your application'
        );
      }
    }

    // Study Preferences recommendations
    if (
      sectionResults.studyPreferences.percentage <
      this.COMPLETION_THRESHOLDS.good
    ) {
      if (!profile.studyPreferences?.preferredUniversities?.length) {
        recommendations.push(
          'Select preferred universities to help us match you with suitable programs'
        );
      }
      if (
        !profile.studyPreferences?.studyReason ||
        profile.studyPreferences.studyReason.length < 50
      ) {
        recommendations.push(
          'Provide a detailed explanation of why you want to study abroad'
        );
      }
    }

    // Financial Info recommendations
    if (
      sectionResults.financialInfo.percentage < this.COMPLETION_THRESHOLDS.good
    ) {
      const needsSponsor = ['Family Sponsor', 'Third Party Sponsor'].includes(
        profile.financialInfo?.fundingSource
      );
      if (
        needsSponsor &&
        !sectionResults.financialInfo.validators?.sponsorDetailsComplete
      ) {
        recommendations.push(
          'Complete sponsor details including income information'
        );
      }

      if (
        !profile.financialInfo?.bankStatementsSubmitted &&
        !profile.financialInfo?.financialAffidavit
      ) {
        recommendations.push(
          'Upload financial documents such as bank statements or affidavit'
        );
      }
    }

    // Overall recommendations
    if (
      sectionResults.personalInfo.percentage >=
        this.COMPLETION_THRESHOLDS.excellent &&
      sectionResults.educationalBackground.percentage >=
        this.COMPLETION_THRESHOLDS.excellent
    ) {
      recommendations.push(
        'Great progress! Consider upgrading to premium for advanced university matching'
      );
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Check if profile is ready for submission
   */
  private static checkSubmissionReadiness(
    profile: any,
    sectionResults: any
  ): boolean {
    // Must have at least 70% completion in essential sections
    const essentialSections = [
      'personalInfo',
      'educationalBackground',
      'studyPreferences',
    ];
    const essentialComplete = essentialSections.every(
      (section) =>
        sectionResults[section].percentage >= this.COMPLETION_THRESHOLDS.fair
    );

    // Must have English proficiency test
    const hasEnglishTest =
      this.TEST_SCORES_CONFIG.validators?.hasEnglishProficiencyTest(
        profile.testScores
      );

    // Must have basic financial info
    const hasBasicFinancialInfo = !!(
      profile.financialInfo?.fundingSource &&
      profile.financialInfo?.budgetConstraints
    );

    return essentialComplete && hasEnglishTest && hasBasicFinancialInfo;
  }

  /**
   * Helper method to check if a test score exists
   */
  private static hasTestScore(data: any, testType: string): boolean {
    if (testType === 'ielts') {
      return !!data?.ieltsScores?.total;
    }
    return !!(
      data?.[`${testType}Score`]?.total || data?.[`${testType}Score`]?.composite
    );
  }

  /**
   * Helper method to get nested object values safely
   */
  private static getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return null;

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined && current[key] !== null
        ? current[key]
        : null;
    }, obj);
  }

  /**
   * Validation helper methods
   */
  private static isValidDate(value: string): boolean {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) && date < new Date();
  }

  private static isFutureDate(value: string): boolean {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
  }

  private static isValidTestDate(value: string): boolean {
    if (!value) return false;
    const date = new Date(value);
    const now = new Date();
    const fiveYearsAgo = new Date(
      now.getFullYear() - 5,
      now.getMonth(),
      now.getDate()
    );

    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      date >= fiveYearsAgo &&
      date <= now
    );
  }

  private static isValidEmail(value: string): boolean {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private static isValidPhone(value: string): boolean {
    if (!value) return false;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value);
  }

  private static isValidCNIC(value: string): boolean {
    if (!value) return false;
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return cnicRegex.test(value);
  }

  /**
   * Public methods for dashboard integration
   */

  /**
   * Get completion status for dashboard
   */
  public static getCompletionStatus(profile: any): {
    isComplete: boolean;
    completionPercentage: number;
    nextSteps: string[];
    completionLevel: string;
  } {
    const completeness = this.calculateCompleteness(profile);

    let completionLevel = 'incomplete';
    if (
      completeness.overallPercentage >= this.COMPLETION_THRESHOLDS.excellent
    ) {
      completionLevel = 'excellent';
    } else if (
      completeness.overallPercentage >= this.COMPLETION_THRESHOLDS.good
    ) {
      completionLevel = 'good';
    } else if (
      completeness.overallPercentage >= this.COMPLETION_THRESHOLDS.fair
    ) {
      completionLevel = 'fair';
    } else if (
      completeness.overallPercentage >= this.COMPLETION_THRESHOLDS.poor
    ) {
      completionLevel = 'poor';
    }

    return {
      isComplete:
        completeness.overallPercentage >= this.COMPLETION_THRESHOLDS.excellent,
      completionPercentage: completeness.overallPercentage,
      nextSteps: completeness.recommendations,
      completionLevel,
    };
  }

  /**
   * Get section-wise progress for step indicator
   */
  public static getSectionProgress(profile: any): Array<{
    section: string;
    title: string;
    percentage: number;
    status: 'complete' | 'incomplete' | 'partial';
    missingFields: string[];
    isBlocking: boolean;
  }> {
    const completeness = this.calculateCompleteness(profile);

    const sections = [
      {
        section: 'personalInfo',
        title: 'Personal Information',
        isBlocking: true,
      },
      {
        section: 'educationalBackground',
        title: 'Academic Background',
        isBlocking: true,
      },
      { section: 'testScores', title: 'Test Scores', isBlocking: false },
      {
        section: 'studyPreferences',
        title: 'Study Preferences',
        isBlocking: true,
      },
      {
        section: 'financialInfo',
        title: 'Financial Information',
        isBlocking: false,
      },
    ];

    return sections.map(({ section, title, isBlocking }) => {
      const percentage = completeness.sectionCompleteness[section];
      let status: 'complete' | 'incomplete' | 'partial' = 'incomplete';

      if (percentage >= this.COMPLETION_THRESHOLDS.excellent) {
        status = 'complete';
      } else if (percentage >= this.COMPLETION_THRESHOLDS.poor) {
        status = 'partial';
      }

      return {
        section,
        title,
        percentage,
        status,
        missingFields:
          completeness.sectionDetails[section]?.missingCriticalFields || [],
        isBlocking,
      };
    });
  }

  /**
   * Get detailed section analysis
   */
  public static getSectionAnalysis(
    profile: any,
    sectionName: string
  ): {
    percentage: number;
    missingFields: string[];
    recommendations: string[];
    fieldBreakdown: {
      essential: { completed: number; total: number };
      optional: { completed: number; total: number };
      conditional: { completed: number; total: number };
    };
  } {
    const completeness = this.calculateCompleteness(profile);
    const sectionData = completeness.sectionDetails[sectionName];

    if (!sectionData) {
      throw new Error(`Invalid section name: ${sectionName}`);
    }

    return {
      percentage: completeness.sectionCompleteness[sectionName],
      missingFields: sectionData.missingCriticalFields,
      recommendations: completeness.recommendations.filter((rec) =>
        rec.toLowerCase().includes(sectionName.toLowerCase())
      ),
      fieldBreakdown: {
        essential: sectionData.essentialFields,
        optional: sectionData.optionalFields,
        conditional: sectionData.conditionalFields,
      },
    };
  }
}
