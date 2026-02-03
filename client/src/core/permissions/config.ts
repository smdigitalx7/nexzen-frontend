import { ROLES, type UserRole } from "@/common/constants";

/**
 * Action types that can be controlled by permissions
 */
export type ActionType = "create" | "edit" | "delete" | "view" | "export" | "import";

/**
 * UI Component types that can be controlled by permissions
 */
export type UIComponentType = "tab" | "section" | "button" | "card" | "feature";

/**
 * Permission configuration for a specific resource
 */
export interface ResourcePermission {
  /** Resource identifier (e.g., 'students', 'fees', 'reservations') */
  resource: string;
  /** Actions allowed for this resource */
  actions: {
    [K in ActionType]?: UserRole[];
  };
  /** UI components visibility */
  ui?: {
    /** Tabs configuration - which tabs are visible to which roles */
    tabs?: {
      [tabId: string]: UserRole[];
    };
    /** Sections configuration - which sections are visible to which roles */
    sections?: {
      [sectionId: string]: UserRole[];
    };
    /** Buttons configuration - which buttons are visible to which roles */
    buttons?: {
      [buttonId: string]: UserRole[];
    };
  };
}

/**
 * Global Permissions Configuration
 * 
 * This file centralizes all permission rules for the application.
 * Configure which UI components and actions are available to each user role.
 * 
 * Example:
 * - Students module has 3 tabs: all for ADMIN, 2 for ACCOUNTANT, 1 for ACADEMIC
 * - Create/Edit/Delete actions are maximum for ADMIN only
 */
export const GLOBAL_PERMISSIONS: Record<string, ResourcePermission> = {
  // ==================== STUDENTS MODULE ====================
  students: {
    resource: "students",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
    ui: {
      tabs: {
        // Section Mapping: ADMIN, INSTITUTE_ADMIN, ACADEMIC (same as ACCOUNTANT permissions)
        "section-mapping": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
        // Enrollments: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT, ACADEMIC
        "enrollments": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
        // Transport: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT, ACADEMIC (but no edit/delete for ACCOUNTANT/ACADEMIC)
        "transport": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
        "promotion-dropout": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
      },
      buttons: {
        // Transport tab specific buttons
        "transport-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "transport-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== RESERVATIONS MODULE ====================
  reservations: {
    resource: "reservations",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      // Delete: Only ADMIN/INSTITUTE_ADMIN (ACCOUNTANT cannot delete)
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
    ui: {
      tabs: {
        "all": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
        "status": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
      buttons: {
        // Delete button in reservations table
        "reservation-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== FEES MODULE ====================
  fees: {
    resource: "fees",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
  },

  // ==================== ATTENDANCE MODULE ====================
  attendance: {
    resource: "attendance",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
  },

  // ==================== MARKS MODULE ====================
  marks: {
    resource: "marks",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      tabs: {
        // Only show Marks, Tests, Student view for ACADEMIC. No Reports Module
        "exam-marks": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
        "test-marks": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
        "student-views": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
        // Reports tab: Only ADMIN, INSTITUTE_ADMIN (hidden from ACADEMIC)
        "reports": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== ADMISSIONS MODULE ====================
  admissions: {
    resource: "admissions",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
    ui: {
      tabs: {
        // Student Admissions: All roles including ACADEMIC
        "admissions": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
        // Confirmed Reservations: Only ADMIN, INSTITUTE_ADMIN, ACCOUNTANT (hidden from ACADEMIC)
        "reservations": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
    },
  },

  // ==================== FINANCIAL REPORTS MODULE ====================
  financial_reports: {
    resource: "financial_reports",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
    ui: {
      tabs: {
        // Financial reports may have multiple tabs (income, expenditure, etc.)
        "expenditure": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
      buttons: {
        // Expenditure tab edit/delete buttons (ACCOUNTANT cannot edit/delete)
        "expenditure-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "expenditure-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== INCOME MODULE ====================
  income: {
    resource: "income",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
  },

  // ==================== EXPENDITURE MODULE ====================
  expenditure: {
    resource: "expenditure",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      // Edit: Only ADMIN/INSTITUTE_ADMIN (ACCOUNTANT cannot edit)
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      // Delete: Only ADMIN/INSTITUTE_ADMIN (ACCOUNTANT cannot delete)
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
    ui: {
      buttons: {
        // Expenditure tab specific buttons in Financial Reports
        "expenditure-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "expenditure-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== ANNOUNCEMENTS MODULE ====================
  announcements: {
    resource: "announcements",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
  },

  // ==================== USER MANAGEMENT MODULE ====================
  users: {
    resource: "users",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
  },

  // ==================== EMPLOYEE MANAGEMENT MODULE ====================
  employees: {
    resource: "employees",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
    ui: {
      buttons: {
        "employee-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "employee-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "employee-update-status": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== EMPLOYEE LEAVE MODULE ====================
  employee_leaves: {
    resource: "employee_leaves",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
    ui: {
      buttons: {
        "leave-approve": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "leave-reject": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "leave-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== EMPLOYEE ADVANCES MODULE ====================
  employee_advances: {
    resource: "employee_advances",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
    ui: {
      buttons: {
        "advance-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "advance-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "advance-change-status": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "advance-update-amount": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== EMPLOYEE ATTENDANCE MODULE ====================
  employee_attendance: {
    resource: "employee_attendance",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
    ui: {
      buttons: {
        "attendance-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "attendance-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== PAYROLL MODULE ====================
  payroll: {
    resource: "payroll",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
  },

  // ==================== TRANSPORT MODULE ====================
  transport: {
    resource: "transport",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    },
  },

  // ==================== REPORTS MODULE ====================
  reports: {
    resource: "reports",
    actions: {
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC, ROLES.ACCOUNTANT],
      export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC, ROLES.ACCOUNTANT],
    },
  },

  // ==================== CLASSES MODULE ====================
  classes: {
    resource: "classes",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // No Add class button for ACADEMIC
        "class-add": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        // No Edit button for ACADEMIC
        "class-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== SUBJECTS MODULE ====================
  subjects: {
    resource: "subjects",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // Only Edit and Add for ACADEMIC, No Delete
        "subject-add": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
        "subject-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
        "subject-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== SECTIONS MODULE ====================
  sections: {
    resource: "sections",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // No delete button for ACADEMIC
        "section-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== TEACHERS MODULE ====================
  teachers: {
    resource: "teachers",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // Teacher Assignments subtab: No Add Subject button, No delete subject button
        "teacher-assignment-add-subject": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "teacher-assignment-delete-subject": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        // Class Teachers subtab: No assign class teacher button, No delete button
        "class-teacher-assign": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "class-teacher-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== EXAMS MODULE ====================
  exams: {
    resource: "exams",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // No Delete button and No Add Exam button for ACADEMIC
        "exam-add": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "exam-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== TESTS MODULE ====================
  tests: {
    resource: "tests",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // No Delete button for ACADEMIC
        "test-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== GRADES MODULE ====================
  grades: {
    resource: "grades",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // No Delete button for ACADEMIC
        "grade-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },

  // ==================== ACADEMIC YEARS MODULE ====================
  academic_years: {
    resource: "academic_years",
    actions: {
      create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
    },
    ui: {
      buttons: {
        // No Add academic year button, No edit, No delete for ACADEMIC
        "academic-year-add": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "academic-year-edit": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
        "academic-year-delete": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      },
    },
  },
};

/**
 * Default action permissions for resources not explicitly configured
 * ADMIN and INSTITUTE_ADMIN have all permissions by default
 */
export const DEFAULT_ACTION_PERMISSIONS: Record<ActionType, UserRole[]> = {
  create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
  edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
  delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
  view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
  export: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
  import: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
};

