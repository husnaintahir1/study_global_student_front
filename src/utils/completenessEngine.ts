// Profile Completeness Service
// This service calculates profile completion based on the 5-step form structure

export interface ProfileCompletenessResult {
  overallPercentage: number;
  sectionCompleteness: {
    personalInfo: number;
    educationalBackground: number;
    testScores: number;
    studyPreferences: number;
    financialInfo: number;
  };
  missingSections: string[];
  missingFields: {
    [sectionName: string]: string[];
  };
}

export class ProfileCompletenessService {
  // Define required fields for each section based on your form steps
  private static readonly REQUIRED_FIELDS = {
    personalInfo: {
      essential: [
        'fullName.firstName',
        'fullName.lastName',
        'fatherName',
        'dateOfBirth',
        'gender',
        'cnicNumber',
        'phone',
        'email',
        'permanentAddress.street',
        'permanentAddress.city',
        'permanentAddress.provinceOfDomicile',
        'permanentAddress.postalCode',
        'residenceCountry',
        'emergencyContact.name',
        'emergencyContact.relation',
        'emergencyContact.phone',
        'passportDetails.passportCountry',
        'passportDetails.passportNumber',
        'passportDetails.passportExpiry',
      ],
      optional: [
        'religion',
        'profilePicture',
        'socialLinks.linkedin',
        'socialLinks.facebook',
        'socialLinks.instagram',
      ],
    },
    educationalBackground: {
      essential: ['studyLevel', 'admissionYear'],
      conditional: {
        // For bachelor level students
        bachelor: [
          'matriculation.year',
          'matriculation.board',
          'matriculation.gradingSystem',
          'matriculation.scorePercentage',
          'intermediate.year',
          'intermediate.board',
          'intermediate.gradingSystem',
          'intermediate.scorePercentage',
          'intermediate.preEngineeringOrPreMedical',
        ],
        // For master/phd level students
        master: [
          'bachelorDegree.programName',
          'bachelorDegree.institution',
          'bachelorDegree.country',
          'bachelorDegree.startDate',
          'bachelorDegree.endDate',
          'bachelorDegree.cgpaPercentage',
        ],
        phd: [
          'bachelorDegree.programName',
          'bachelorDegree.institution',
          'bachelorDegree.country',
          'bachelorDegree.startDate',
          'bachelorDegree.endDate',
          'bachelorDegree.cgpaPercentage',
          'masterDegree.programName',
          'masterDegree.institution',
          'masterDegree.country',
          'masterDegree.startDate',
          'masterDegree.endDate',
          'masterDegree.cgpaPercentage',
        ],
      },
      optional: [
        'educationalGap',
        'additionalCertification',
        'diploma.programName',
        'diploma.institution',
        'diploma.year',
        'hecEquivalenceStatus.applied',
        'workExperience',
      ],
    },
    testScores: {
      essential: [
        // At least one English proficiency test should be present
      ],
      optional: [
        'ieltsScores.listening',
        'ieltsScores.reading',
        'ieltsScores.writing',
        'ieltsScores.speaking',
        'ieltsScores.total',
        'ieltsScores.testDate',
        'toeflScore.total',
        'toeflScore.testDate',
        'pteScore.total',
        'pteScore.testDate',
        'duolingoScore.total',
        'duolingoScore.testDate',
        'satScore.total',
        'satScore.testDate',
        'actScore.composite',
        'actScore.testDate',
        'greScore.verbal',
        'greScore.quantitative',
        'greScore.analytical',
        'greScore.testDate',
        'gmatScore.total',
        'gmatScore.testDate',
        'neetScore.total',
        'neetScore.testDate',
        'mcatScore.total',
        'mcatScore.testDate',
        'partTimeWork',
        'backlogs',
        'workExperience',
      ],
    },
    studyPreferences: {
      essential: [
        'preferredCourse',
        'preferredCountry',
        'intendedIntake.season',
        'intendedIntake.year',
        'studyReason',
        'careerGoals',
      ],
      optional: [
        'specialization',
        'preferredUniversities',
        'scholarshipInterest',
        'coOpInterest',
        'familyAbroad',
        'accommodationSupport',
      ],
    },
    financialInfo: {
      essential: ['fundingSource', 'budgetConstraints', 'travelHistory'],
      conditional: {
        // If funding source is family/third party sponsor
        sponsorRequired: [
          'sponsorDetails.sponsorName',
          'sponsorDetails.sponsorRelation',
          'sponsorDetails.sponsorCnic',
          'sponsorDetails.sponsorAnnualIncome',
        ],
      },
      optional: [
        'bankStatementsSubmitted',
        'financialAffidavit',
        'visaRejections',
        'policeClearanceCertificate',
        'medicalClearance',
        'medicalConditions',
        'domicileCertificateSubmitted',
        'nocRequired',
        'additionalInfo',
      ],
    },
  };

  // Section weights (should add up to 100)
  private static readonly SECTION_WEIGHTS = {
    personalInfo: 25,
    educationalBackground: 25,
    testScores: 20,
    studyPreferences: 15,
    financialInfo: 15,
  };

  /**
   * Calculate overall profile completeness
   */
  public static calculateCompleteness(profile: any): ProfileCompletenessResult {
    const sectionCompleteness = {
      personalInfo: this.calculatePersonalInfoCompleteness(
        profile.personalInfo
      ),
      educationalBackground: this.calculateEducationalBackgroundCompleteness(
        profile.educationalBackground
      ),
      testScores: this.calculateTestScoresCompleteness(profile.testScores),
      studyPreferences: this.calculateStudyPreferencesCompleteness(
        profile.studyPreferences
      ),
      financialInfo: this.calculateFinancialInfoCompleteness(
        profile.financialInfo
      ),
    };

    // Calculate weighted overall percentage
    const overallPercentage = Math.round(
      (sectionCompleteness.personalInfo * this.SECTION_WEIGHTS.personalInfo +
        sectionCompleteness.educationalBackground *
          this.SECTION_WEIGHTS.educationalBackground +
        sectionCompleteness.testScores * this.SECTION_WEIGHTS.testScores +
        sectionCompleteness.studyPreferences *
          this.SECTION_WEIGHTS.studyPreferences +
        sectionCompleteness.financialInfo *
          this.SECTION_WEIGHTS.financialInfo) /
        100
    );

    // Find missing sections (less than 50% complete)
    const missingSections = Object.entries(sectionCompleteness)
      .filter(([_, percentage]) => percentage < 50)
      .map(([section, _]) => section);

    // Get missing fields for each section
    const missingFields = {
      personalInfo: this.getMissingPersonalInfoFields(profile.personalInfo),
      educationalBackground: this.getMissingEducationalBackgroundFields(
        profile.educationalBackground
      ),
      testScores: this.getMissingTestScoresFields(profile.testScores),
      studyPreferences: this.getMissingStudyPreferencesFields(
        profile.studyPreferences
      ),
      financialInfo: this.getMissingFinancialInfoFields(profile.financialInfo),
    };

    return {
      overallPercentage,
      sectionCompleteness,
      missingSections,
      missingFields,
    };
  }

  /**
   * Calculate Personal Info section completeness
   */
  private static calculatePersonalInfoCompleteness(personalInfo: any): number {
    if (!personalInfo) return 0;

    const essentialFields = this.REQUIRED_FIELDS.personalInfo.essential;
    const optionalFields = this.REQUIRED_FIELDS.personalInfo.optional;

    const essentialScore = this.calculateFieldScore(
      personalInfo,
      essentialFields,
      80
    ); // 80% weight for essential
    const optionalScore = this.calculateFieldScore(
      personalInfo,
      optionalFields,
      20
    ); // 20% weight for optional

    return Math.min(100, essentialScore + optionalScore);
  }

  /**
   * Calculate Educational Background section completeness
   */
  private static calculateEducationalBackgroundCompleteness(
    educationalBackground: any
  ): number {
    if (!educationalBackground) return 0;

    let requiredFields = [
      ...this.REQUIRED_FIELDS.educationalBackground.essential,
    ];

    // Add conditional fields based on study level
    const studyLevel = educationalBackground.studyLevel;
    if (
      studyLevel &&
      this.REQUIRED_FIELDS.educationalBackground.conditional[studyLevel]
    ) {
      requiredFields = requiredFields.concat(
        this.REQUIRED_FIELDS.educationalBackground.conditional[studyLevel]
      );
    }

    const essentialScore = this.calculateFieldScore(
      educationalBackground,
      requiredFields,
      85
    );
    const optionalScore = this.calculateFieldScore(
      educationalBackground,
      this.REQUIRED_FIELDS.educationalBackground.optional,
      15
    );

    return Math.min(100, essentialScore + optionalScore);
  }

  /**
   * Calculate Test Scores section completeness
   */
  private static calculateTestScoresCompleteness(testScores: any): number {
    if (!testScores) return 0;

    // Check if at least one English proficiency test is present
    const hasEnglishTest = !!(
      testScores.ieltsScores?.total ||
      testScores.toeflScore?.total ||
      testScores.pteScore?.total ||
      testScores.duolingoScore?.total
    );

    let score = 0;

    // English proficiency test is worth 60% of this section
    if (hasEnglishTest) {
      score += 60;
    }

    // Additional tests and information worth 40%
    const additionalFields = [
      'greScore.verbal',
      'greScore.quantitative',
      'greScore.analytical',
      'satScore.total',
      'gmatScore.total',
      'actScore.composite',
      'neetScore.total',
      'mcatScore.total',
      'workExperience',
      'partTimeWork',
    ];

    const additionalScore = this.calculateFieldScore(
      testScores,
      additionalFields,
      40
    );
    score += additionalScore;

    return Math.min(100, score);
  }

  /**
   * Calculate Study Preferences section completeness
   */
  private static calculateStudyPreferencesCompleteness(
    studyPreferences: any
  ): number {
    if (!studyPreferences) return 0;

    const essentialFields = this.REQUIRED_FIELDS.studyPreferences.essential;
    const optionalFields = this.REQUIRED_FIELDS.studyPreferences.optional;

    const essentialScore = this.calculateFieldScore(
      studyPreferences,
      essentialFields,
      80
    );
    const optionalScore = this.calculateFieldScore(
      studyPreferences,
      optionalFields,
      20
    );

    return Math.min(100, essentialScore + optionalScore);
  }

  /**
   * Calculate Financial Info section completeness
   */
  private static calculateFinancialInfoCompleteness(
    financialInfo: any
  ): number {
    if (!financialInfo) return 0;

    let requiredFields = [...this.REQUIRED_FIELDS.financialInfo.essential];

    // Add sponsor details if funding source requires it
    const fundingSource = financialInfo.fundingSource;
    if (
      fundingSource === 'Family Sponsor' ||
      fundingSource === 'Third Party Sponsor'
    ) {
      requiredFields = requiredFields.concat(
        this.REQUIRED_FIELDS.financialInfo.conditional.sponsorRequired
      );
    }

    const essentialScore = this.calculateFieldScore(
      financialInfo,
      requiredFields,
      70
    );
    const optionalScore = this.calculateFieldScore(
      financialInfo,
      this.REQUIRED_FIELDS.financialInfo.optional,
      30
    );

    return Math.min(100, essentialScore + optionalScore);
  }

  /**
   * Helper method to calculate field score
   */
  private static calculateFieldScore(
    data: any,
    fields: string[],
    maxScore: number
  ): number {
    if (!data || fields.length === 0) return 0;

    const filledFields = fields.filter((field) =>
      this.getNestedValue(data, field)
    );
    return (filledFields.length / fields.length) * maxScore;
  }

  /**
   * Get missing fields for each section
   */
  private static getMissingPersonalInfoFields(personalInfo: any): string[] {
    return this.REQUIRED_FIELDS.personalInfo.essential.filter(
      (field) => !this.getNestedValue(personalInfo, field)
    );
  }

  private static getMissingEducationalBackgroundFields(
    educationalBackground: any
  ): string[] {
    let requiredFields = [
      ...this.REQUIRED_FIELDS.educationalBackground.essential,
    ];

    const studyLevel = educationalBackground?.studyLevel;
    if (
      studyLevel &&
      this.REQUIRED_FIELDS.educationalBackground.conditional[studyLevel]
    ) {
      requiredFields = requiredFields.concat(
        this.REQUIRED_FIELDS.educationalBackground.conditional[studyLevel]
      );
    }

    return requiredFields.filter(
      (field) => !this.getNestedValue(educationalBackground, field)
    );
  }

  private static getMissingTestScoresFields(testScores: any): string[] {
    const missingFields = [];

    // Check for English proficiency test
    const hasEnglishTest = !!(
      testScores?.ieltsScores?.total ||
      testScores?.toeflScore?.total ||
      testScores?.pteScore?.total ||
      testScores?.duolingoScore?.total
    );

    if (!hasEnglishTest) {
      missingFields.push('English Proficiency Test (IELTS/TOEFL/PTE/Duolingo)');
    }

    return missingFields;
  }

  private static getMissingStudyPreferencesFields(
    studyPreferences: any
  ): string[] {
    return this.REQUIRED_FIELDS.studyPreferences.essential.filter(
      (field) => !this.getNestedValue(studyPreferences, field)
    );
  }

  private static getMissingFinancialInfoFields(financialInfo: any): string[] {
    let requiredFields = [...this.REQUIRED_FIELDS.financialInfo.essential];

    const fundingSource = financialInfo?.fundingSource;
    if (
      fundingSource === 'Family Sponsor' ||
      fundingSource === 'Third Party Sponsor'
    ) {
      requiredFields = requiredFields.concat(
        this.REQUIRED_FIELDS.financialInfo.conditional.sponsorRequired
      );
    }

    return requiredFields.filter(
      (field) => !this.getNestedValue(financialInfo, field)
    );
  }

  /**
   * Helper method to get nested object values safely
   */
  private static getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return null;

    return path.split('.').reduce((current, key) => {
      return current &&
        current[key] !== undefined &&
        current[key] !== null &&
        current[key] !== ''
        ? current[key]
        : null;
    }, obj);
  }

  /**
   * Get completion status for dashboard
   */
  public static getCompletionStatus(profile: any): {
    isComplete: boolean;
    completionPercentage: number;
    nextSteps: string[];
  } {
    const completeness = this.calculateCompleteness(profile);

    const nextSteps = [];
    Object.entries(completeness.missingFields).forEach(([section, fields]) => {
      if (fields.length > 0) {
        nextSteps.push(
          `Complete ${section.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        );
      }
    });

    return {
      isComplete: completeness.overallPercentage >= 90,
      completionPercentage: completeness.overallPercentage,
      nextSteps: nextSteps.slice(0, 3), // Show top 3 next steps
    };
  }

  /**
   * Get section-wise completion for progress tracking
   */
  public static getSectionProgress(profile: any): Array<{
    section: string;
    title: string;
    percentage: number;
    status: 'complete' | 'incomplete' | 'partial';
    missingFields: string[];
  }> {
    const completeness = this.calculateCompleteness(profile);

    const sections = [
      { section: 'personalInfo', title: 'Personal Information' },
      { section: 'educationalBackground', title: 'Academic Background' },
      { section: 'testScores', title: 'Test Scores' },
      { section: 'studyPreferences', title: 'Study Preferences' },
      { section: 'financialInfo', title: 'Financial Information' },
    ];

    return sections.map(({ section, title }) => {
      const percentage = completeness.sectionCompleteness[section];
      let status: 'complete' | 'incomplete' | 'partial' = 'incomplete';

      if (percentage >= 90) status = 'complete';
      else if (percentage >= 30) status = 'partial';

      return {
        section,
        title,
        percentage,
        status,
        missingFields: completeness.missingFields[section] || [],
      };
    });
  }
}
