export interface StudentProfile {
  name: string;
  age: number;
  standard: string;
  country: string;
  board: string;
}

export type BoardDirectory = {
  label: string;
  boards: string[];
};

export const COUNTRY_BOARD_DIRECTORY: BoardDirectory[] = [
  { label: 'India', boards: ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'] },
  { label: 'United States', boards: ['Common Core', 'State Curriculum', 'AP Track', 'IB'] },
  { label: 'United Kingdom', boards: ['GCSE', 'A-Level', 'Cambridge', 'IB'] },
  { label: 'Pakistan', boards: ['Federal Board', 'Punjab Board', 'Sindh Board', 'Cambridge'] },
  { label: 'Bangladesh', boards: ['National Curriculum Board', 'English Version', 'Cambridge'] },
  { label: 'Nepal', boards: ['NEB', 'SEE Track', 'Cambridge'] },
  { label: 'Sri Lanka', boards: ['National Curriculum', 'O-Level', 'A-Level', 'Cambridge'] },
  { label: 'United Arab Emirates', boards: ['MOE Curriculum', 'CBSE', 'British Curriculum', 'IB'] },
  { label: 'Canada', boards: ['Provincial Curriculum', 'IB', 'AP Track'] },
  { label: 'Australia', boards: ['State Curriculum', 'ATAR Track', 'IB'] },
  { label: 'Singapore', boards: ['MOE Curriculum', 'O-Level', 'A-Level', 'IB'] },
];

export const DEFAULT_COUNTRY = COUNTRY_BOARD_DIRECTORY[0].label;

export function getBoardsForCountry(country: string): string[] {
  return COUNTRY_BOARD_DIRECTORY.find((entry) => entry.label === country)?.boards || ['National Curriculum'];
}

export function getDefaultBoard(country: string): string {
  return getBoardsForCountry(country)[0];
}

export function getStudentStage(standard: string): string {
  const numeric = Number.parseInt(standard, 10);

  if (!Number.isNaN(numeric)) {
    if (numeric <= 5) return 'upper-primary';
    if (numeric <= 8) return 'middle-school';
    if (numeric <= 10) return 'secondary';
    if (numeric <= 12) return 'senior-secondary';
  }

  const lower = standard.toLowerCase();
  if (lower.includes('college') || lower.includes('university')) return 'higher-education';
  return 'school';
}

export function getExamFocus(profile: StudentProfile): string {
  const stage = getStudentStage(profile.standard);

  switch (stage) {
    case 'upper-primary':
      return `Focus on clear concepts, memory anchors, and board-aligned fundamentals suitable for ${profile.board} students in standard ${profile.standard}.`;
    case 'middle-school':
      return `Prioritize exam-relevant concepts, worked examples, and syllabus coverage suitable for ${profile.board} students in standard ${profile.standard}.`;
    case 'secondary':
      return `Target board-exam depth for ${profile.board} students in standard ${profile.standard}, with likely exam patterns, precise terminology, and high-yield examples.`;
    case 'senior-secondary':
      return `Aim for rigorous board-exam readiness for ${profile.board} students in standard ${profile.standard}, including derivations, application-style questions, and common traps.`;
    case 'higher-education':
      return `Keep the explanation academically rigorous, but still structured for exam performance and revision discipline.`;
    default:
      return `Tailor the answer to the student’s level and likely examination demands.`;
  }
}

export function formatStudentContext(profile?: StudentProfile | null): string {
  if (!profile) {
    return 'No student profile is available. Keep the output generally accessible.';
  }

  return `Student profile:
- Name: ${profile.name}
- Age: ${profile.age}
- Standard: ${profile.standard}
- Country: ${profile.country}
- Board of study: ${profile.board}
- Examination focus: ${getExamFocus(profile)}`;
}
