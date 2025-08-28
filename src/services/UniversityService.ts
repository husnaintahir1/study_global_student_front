import { api } from './api';

export interface Program {
  id: number;
  name: string;
  fees: string;
  duration: string;
  intakes: string[];
}

export interface University {
  id: number;
  universityName: string;
  country: string;
  programs: Program[];
}

export interface UniversityFilters {
  country?: string;
  program?: string;
}

export interface UniversitySearchParams {
  country?: string;
  program?: string;
  page?: number;
  limit?: number;
}

// Additional interfaces for the new API endpoints
export interface Course {
  id: number;
  name: string;
  fees: string;
  duration: string;
  intakes: string[];
  universityId?: number;
}

export interface CreateUniversityRequest {
  universityName: string;
  country: string;
  programs?: Program[];
}

export interface UpdateUniversityRequest {
  universityName?: string;
  country?: string;
  programs?: Program[];
}

class UniversityService {
  // Existing methods for student applications
  async getUniversities(filters?: UniversityFilters): Promise<{
    message: string;
    universities: University[];
  }> {
    const params = new URLSearchParams();

    if (filters?.country) {
      params.append('country', filters.country);
    }

    if (filters?.program) {
      params.append('program', filters.program);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/applications/student/universities?${queryString}`
      : '/applications/student/universities';

    return api.get<{
      message: string;
      universities: University[];
    }>(url);
  }

  async getAllUniversities(): Promise<{
    message: string;
    universities: University[];
  }> {
    return this.getUniversities();
  }

  async getUniversitiesByCountry(country: string): Promise<{
    message: string;
    universities: University[];
  }> {
    return this.getUniversities({ country });
  }

  async getUniversitiesByProgram(program: string): Promise<{
    message: string;
    universities: University[];
  }> {
    return this.getUniversities({ program });
  }

  async searchUniversities(
    country?: string,
    program?: string
  ): Promise<{
    message: string;
    universities: University[];
  }> {
    return this.getUniversities({ country, program });
  }

  // New API v1 methods for university management
  async createUniversity(
    universityData: CreateUniversityRequest
  ): Promise<University> {
    return api.post<University>('/universities', universityData);
  }

  async getAllUniversitiesV1(): Promise<University[]> {
    return api.get<University[]>('/universities');
  }

  async getUnassignedCourses(): Promise<Course[]> {
    return api.get<Course[]>('/universities/unassigned');
  }

  async getUniversityById(id: number): Promise<University> {
    return api.get<University>(`/universities/${id}`);
  }

  async updateUniversityById(
    id: number,
    updateData: UpdateUniversityRequest
  ): Promise<University> {
    return api.put<University>(`/universities/${id}`, updateData);
  }

  async deleteUniversityById(id: number): Promise<{ message: string }> {
    return api.delete(`/universities/${id}`);
  }

  async getUniversityCourses(id: number): Promise<Course[]> {
    return api.get<Course[]>(`/universities/${id}/courses`);
  }

  // Helper methods (existing)
  getUniqueCountries(universities: University[]): string[] {
    const countries = universities.map((uni) => uni.country);
    return [...new Set(countries)].sort();
  }

  getUniquePrograms(universities: University[]): string[] {
    const programs = universities.flatMap((uni) =>
      uni.programs.map((program) => program.name)
    );
    return [...new Set(programs)].sort();
  }

  getUniversityByIdLocal(
    universities: University[],
    id: number
  ): University | undefined {
    return universities.find((uni) => uni.id === id);
  }

  getProgramById(
    university: University,
    programId: number
  ): Program | undefined {
    return university.programs.find((program) => program.id === programId);
  }

  filterUniversitiesByCountry(
    universities: University[],
    country: string
  ): University[] {
    if (!country) return universities;
    return universities.filter((uni) =>
      uni.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  filterUniversitiesByProgram(
    universities: University[],
    program: string
  ): University[] {
    if (!program) return universities;
    return universities.filter((uni) =>
      uni.programs.some((p) =>
        p.name.toLowerCase().includes(program.toLowerCase())
      )
    );
  }

  searchUniversitiesLocally(
    universities: University[],
    searchTerm: string
  ): University[] {
    if (!searchTerm) return universities;

    const term = searchTerm.toLowerCase();
    return universities.filter(
      (uni) =>
        uni.universityName.toLowerCase().includes(term) ||
        uni.country.toLowerCase().includes(term) ||
        uni.programs.some((program) =>
          program.name.toLowerCase().includes(term)
        )
    );
  }

  sortUniversitiesByName(universities: University[]): University[] {
    return [...universities].sort((a, b) =>
      a.universityName.localeCompare(b.universityName)
    );
  }

  sortUniversitiesByCountry(universities: University[]): University[] {
    return [...universities].sort((a, b) => a.country.localeCompare(b.country));
  }

  getUniversityDisplayName(university: University): string {
    return `${university.universityName}, ${university.country}`;
  }

  getProgramDisplayName(program: Program): string {
    return `${program.name} (${program.duration})`;
  }

  formatFees(fees: string): string {
    // Handle different fee formats
    if (fees.startsWith('$')) {
      return fees;
    }
    return `$${fees}`;
  }

  getAvailableIntakes(program: Program): string {
    return program.intakes.join(', ');
  }

  isProgramAvailableForIntake(program: Program, intake: string): boolean {
    return program.intakes.some(
      (availableIntake) =>
        availableIntake.toLowerCase() === intake.toLowerCase()
    );
  }

  validateUniversitySelection(
    university: University,
    programId: number,
    selectedIntake: string
  ): { valid: boolean; error?: string } {
    const program = this.getProgramById(university, programId);

    if (!program) {
      return { valid: false, error: 'Program not found' };
    }

    if (!this.isProgramAvailableForIntake(program, selectedIntake)) {
      return {
        valid: false,
        error: `${selectedIntake} intake not available for this program`,
      };
    }

    return { valid: true };
  }

  createUniversitySelection(
    university: University,
    program: Program,
    selectedIntake: string,
    priority: number
  ) {
    return {
      universityId: university.id,
      universityName: university.universityName,
      programId: program.id,
      programName: program.name,
      country: university.country,
      fees: program.fees,
      duration: program.duration,
      intakes: program.intakes,
      selectedIntake,
      priority,
    };
  }

  // Additional helper methods for courses
  getUniqueCourseNames(courses: Course[]): string[] {
    const courseNames = courses.map((course) => course.name);
    return [...new Set(courseNames)].sort();
  }

  getCourseById(courses: Course[], id: number): Course | undefined {
    return courses.find((course) => course.id === id);
  }

  filterCoursesByName(courses: Course[], name: string): Course[] {
    if (!name) return courses;
    return courses.filter((course) =>
      course.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  sortCoursesByName(courses: Course[]): Course[] {
    return [...courses].sort((a, b) => a.name.localeCompare(b.name));
  }

  getCourseDisplayName(course: Course): string {
    return `${course.name} (${course.duration})`;
  }
}

export const universityService = new UniversityService();
