// School module types aligned with backend Pydantic schemas

// Classes
export interface ClassRead {
  class_id: number;
  class_name: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface ClassCreate {
  class_name: string;
}

export interface ClassUpdate {
  class_name?: string;
}

export interface ClassWithSubjects extends ClassRead {
  subjects: string[];
}

// Sections
export interface SectionRead {
  section_id: number;
  class_id: number;
  section_name: string;
  current_enrollment: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SectionCreate {
  section_name: string;
  current_enrollment: number;
  is_active?: boolean;
}

export interface SectionUpdate {
  section_name?: string;
  current_enrollment?: number;
  is_active?: boolean;
}

// Subjects
export interface SubjectRead {
  subject_id: number;
  subject_name: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SubjectCreate {
  subject_name: string;
}

export interface SubjectUpdate {
  subject_name?: string;
}

// Class Subjects
export interface ClassSubjectRead {
  class_id: number;
  subject_id: number;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface ClassSubjectCreate {
  class_id: number;
  subject_id: number;
}

export interface ClassSubjectUpdate {
  class_id?: number;
  subject_id?: number;
}

// Tuition Fee Structures
export interface TuitionFeeStructureRead {
  fee_structure_id: number;
  class_id: number;
  book_fee: number;
  tuition_fee: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface TuitionFeeStructureCreate {
  class_id: number;
  book_fee: number;
  tuition_fee: number;
}

export interface TuitionFeeStructureUpdate {
  book_fee?: number;
  tuition_fee?: number;
}


