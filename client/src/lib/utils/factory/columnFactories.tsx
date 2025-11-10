import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX, 
  Building2, 
  BookOpen, 
  FileText, 
  Award,
  Calendar,
} from "lucide-react";
import { Icon } from "@radix-ui/react-select";

// ============================================================================
// COLUMN FACTORY TYPES
// ============================================================================

export interface ColumnFactoryConfig {
  header?: string;
  className?: string;
  icon?: React.ComponentType<any>;
  fallback?: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}


// ============================================================================
// TEXT COLUMN FACTORIES
// ============================================================================

/**
 * Creates a simple text column
 */
export const createTextColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => (
    <span className={config.className}>
      {String(row.original[accessorKey] || config.fallback || "-")}
    </span>
  ),
});

/**
 * Creates a text column with icon
 */
export const createIconTextColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => {
  const Icon = config.icon;
  return {
    accessorKey: accessorKey as string,
    header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="font-medium">{String(row.original[accessorKey] || config.fallback || "-")}</span>
      </div>
    ),
  };
};

/**
 * Creates a truncated text column
 */
export const createTruncatedTextColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => (
    <span className={`max-w-xs truncate ${config.className || ""}`}>
      {String(row.original[accessorKey] || config.fallback || "No data")}
    </span>
  ),
});

// ============================================================================
// BADGE COLUMN FACTORIES
// ============================================================================

/**
 * Creates a badge column
 */
export const createBadgeColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => (
    <Badge variant={config.variant || "outline"}>
      {String(row.original[accessorKey] || config.fallback || "N/A")}
    </Badge>
  ),
});

/**
 * Creates a count badge column
 */
export const createCountBadgeColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => (
    <Badge variant={config.variant || "secondary"}>
      {String(row.original[accessorKey] || 0)} {config.fallback || "items"}
    </Badge>
  ),
});

// ============================================================================
// FORMATTED COLUMN FACTORIES
// ============================================================================

/**
 * Creates a currency column
 */
export const createCurrencyColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => (
    <span className={`font-medium ${config.className || ""}`}>
      {formatCurrency(row.original[accessorKey] as number || 0)}
    </span>
  ),
});

/**
 * Creates a date column
 */
export const createDateColumn = <T,>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => {
    const dateValue = row.original[accessorKey];
    if (!dateValue) return <span>{config.fallback || "Not set"}</span>;
    
    return (
      <span>
        {typeof dateValue === 'string' 
          ? formatDate(dateValue) 
          : new Date(dateValue as string | number | Date).toLocaleDateString()
        }
      </span>
    );
  },
});

// ============================================================================
// STATUS COLUMN FACTORIES
// ============================================================================

/**
 * Creates a status column with icon and badge
 */
export const createStatusColumn = <T,>(
  accessorKey: keyof T,
  getStatusColor: (status: string) => string,
  getStatusIcon: (status: string) => React.ReactNode,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || "Status",
  cell: ({ row }) => {
    const status = row.original[accessorKey] as string;
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(status)}
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
      </div>
    );
  },
});

// ============================================================================
// AVATAR COLUMN FACTORIES
// ============================================================================

/**
 * Creates an avatar column with name and subtitle
 */
export const createAvatarColumn = <T,>(
  nameKey: keyof T,
  subtitleKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: nameKey as string,
  header: config.header || "Name",
  cell: ({ row }) => {
    const name = row.original[nameKey] as string;
    const subtitle = row.original[subtitleKey] as string;
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A';
    
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{name || config.fallback || "N/A"}</div>
          <div className="text-sm text-muted-foreground">{subtitle || ""}</div>
        </div>
      </div>
    );
  },
});


// ============================================================================
// COMMON COLUMN CONFIGURATIONS
// ============================================================================

/**
 * Common column configurations for different entity types
 */
export const CommonColumnConfigs = {
  // Employee columns
  employee: {
    name: { icon: UserCheck, header: "Employee" },
    designation: { header: "Designation" },
    department: { header: "Department", fallback: "-" },
    salary: { header: "Salary" },
    dateOfJoining: { header: "Joining Date" },
    status: { header: "Status" }
  },
  
  // Branch columns
  branch: {
    name: { icon: Building2, header: "Branch Name" },
    type: { header: "Type", variant: "outline" as const },
    address: { header: "Address", fallback: "No address" },
    email: { header: "Email", fallback: "No email" },
    phone: { header: "Phone", fallback: "No phone" }
  },
  
  // Academic columns
  subject: {
    name: { icon: BookOpen, header: "Subject Name" },
    code: { header: "Code", variant: "outline" as const },
    description: { header: "Description", fallback: "No description" },
    classesCount: { header: "Classes", fallback: "classes" }
  },
  
  test: {
    name: { icon: FileText, header: "Test Name" },
    date: { header: "Date", fallback: "Not set" },
    marks: { header: "Total Marks", fallback: "marks" },
    description: { header: "Description", fallback: "No description" }
  },
  
  exam: {
    name: { icon: Award, header: "Exam Name" },
    date: { header: "Date", fallback: "Not set" },
    marks: { header: "Total Marks", fallback: "marks" },
    description: { header: "Description", fallback: "No description" }
  }
};

// ============================================================================
// STATUS UTILITIES
// ============================================================================

/**
 * Common status color functions
 */
export const StatusColors = {
  employee: (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
      case "TERMINATED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  },
  
  general: (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }
};

/**
 * Common status icon functions
 */
export const StatusIcons = {
  employee: (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE": return <UserCheck className="h-4 w-4" />;
      case "INACTIVE": return <UserX className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  }
};

// ============================================================================
// SPECIALIZED COLUMN FACTORIES
// ============================================================================

/**
 * Creates a capacity/strength column with status indicators.
 */
export const createCapacityColumn = <T extends Record<string, any>>(
  currentKey: keyof T,
  capacityKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: currentKey as string,
  header: config.header || "Students",
  cell: ({ row }) => {
    const current = Number(row.original[currentKey] || 0);
    const capacity = Number(row.original[capacityKey] || 0);
    
    let statusColor = "text-green-600";
    let statusText = "Available";
    
    if (capacity > 0) {
      const percentage = (current / capacity) * 100;
      if (percentage >= 90) {
        statusColor = "text-red-600";
        statusText = "Full";
      } else if (percentage >= 80) {
        statusColor = "text-yellow-600";
        statusText = "Near Full";
      }
    } else {
      statusColor = "text-gray-600";
      statusText = "N/A";
    }
    
    return (
      <div className="text-center">
        <div className="font-semibold">{current}/{capacity}</div>
        <div className={`text-xs ${statusColor}`}>{statusText}</div>
      </div>
    );
  },
});

/**
 * Creates a subjects array column with badge display.
 */
export const createSubjectsColumn = <T extends Record<string, any>>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || "Subjects",
  cell: ({ row }) => {
    const subjects = (row.original[accessorKey] as string[]) || [];
    return (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {subjects.map((subject, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {subject}
          </Badge>
        ))}
      </div>
    );
  },
});

/**
 * Creates a boolean status column with icons.
 */
export const createBooleanStatusColumn = <T extends Record<string, any>>(
  accessorKey: keyof T,
  trueIcon: React.ComponentType<any>,
  falseIcon: React.ComponentType<any>,
  trueText: string,
  falseText: string,
  trueColor: string,
  falseColor: string,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || String(accessorKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  cell: ({ row }) => {
    const value = Boolean(row.original[accessorKey]);
    const Icon = value ? trueIcon : falseIcon;
    const text = value ? trueText : falseText;
    const color = value ? trueColor : falseColor;
    
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm ${color}`}>{text}</span>
      </div>
    );
  },
});

/**
 * Creates a complex class name column with icon and subtitle.
 */
export const createClassNameColumn = <T extends Record<string, any>>(
  nameKey: keyof T,
  gradeKey: keyof T,
  sectionKey: keyof T,
  IconComponent: React.ComponentType<any>,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: nameKey as string,
  header: config.header || "Class Name",
  cell: ({ row }) => {
    const name = String(row.original[nameKey] || "");
    const grade = String(row.original[gradeKey] || "");
    const section = String(row.original[sectionKey] || "");
    
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          {IconComponent ? <IconComponent className="h-5 w-5 text-white" /> : null}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-sm text-slate-500">Grade {grade} - Section {section}</div>
        </div>
      </div>
    );
  },
});

/**
 * Creates a teacher column with avatar and name.
 */
export const createTeacherColumn = <T extends Record<string, any>>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || "Class Teacher",
  cell: ({ row }) => {
    const value = String(row.original[accessorKey] || "-");
    const initials = value.trim() ? value.split(' ').map(n => n[0]).join('') : '-';
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>
        <span className="font-medium text-slate-700">{value}</span>
      </div>
    );
  },
});

/**
 * Creates a room column with icon and badge.
 */
export const createRoomColumn = <T extends Record<string, any>>(
  accessorKey: keyof T,
  IconComponent: React.ComponentType<any>,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || "Room",
  cell: ({ row }) => {
    const value = String(row.original[accessorKey] || "");
    
    return (
      <div className="flex items-center gap-2">
        {IconComponent ? <IconComponent className="h-4 w-4 text-slate-500" /> : null}
        <Badge variant="outline" className="font-mono">{value}</Badge>
      </div>
    );
  },
});

// ============================================================================
// MARKS-SPECIFIC COLUMN FACTORIES
// ============================================================================

/**
 * Creates a student column with avatar and details.
 */
export const createStudentColumn = <T extends Record<string, any>>(
  nameKey: keyof T,
  rollKey: keyof T,
  sectionKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: nameKey as string,
  header: config.header || "Student",
  cell: ({ row }) => {
    const name = String(row.original[nameKey] || "N/A");
    const roll = String(row.original[rollKey] || "N/A");
    const section = String(row.original[sectionKey] || "N/A");
    const initials = name !== "N/A" ? name.split(' ').map(n => n[0]).join('') : 'N/A';
    
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-sm text-slate-500">{roll} • {section}</div>
        </div>
      </div>
    );
  },
});

/**
 * Creates a subject column with test name.
 */
export const createSubjectColumn = <T extends Record<string, any>>(
  subjectKey: keyof T,
  testKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: subjectKey as string,
  header: config.header || "Subject",
  cell: ({ row }) => {
    const subject = String(row.original[subjectKey] || "N/A");
    const test = String(row.original[testKey] || "N/A");
    
    return (
      <div>
        <div className="font-medium text-slate-900">{subject}</div>
        <div className="text-sm text-slate-500">{test}</div>
      </div>
    );
  },
});

/**
 * Creates a marks column with percentage.
 */
export const createMarksColumn = <T extends Record<string, any>>(
  marksKey: keyof T,
  maxMarksKey: keyof T,
  percentageKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: marksKey as string,
  header: config.header || "Marks",
  cell: ({ row }) => {
    const marks = Number(row.original[marksKey] || 0);
    const maxMarks = Number(row.original[maxMarksKey] || 100);
    const percentage = Number(row.original[percentageKey] || 0);
    
    return (
      <div className="text-center">
        <div className="font-bold text-lg text-slate-900">
          {marks}/{maxMarks}
        </div>
        <div className="text-sm text-slate-500">{percentage}%</div>
      </div>
    );
  },
});

/**
 * Creates a grade column with color coding.
 */
export const createGradeColumn = <T extends Record<string, any>>(
  accessorKey: keyof T,
  gradeColors: { [key: string]: string },
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || "Grade",
  cell: ({ row }) => {
    const grade = String(row.original[accessorKey] || "F");
    const colorClass = gradeColors[grade] || gradeColors["F"] || "bg-gray-500";
    
    return (
      <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold text-white ${colorClass}`}>
        {grade}
      </div>
    );
  },
});

/**
 * Creates a test date column with formatted date.
 */
export const createTestDateColumn = <T extends Record<string, any>>(
  accessorKey: keyof T,
  config: ColumnFactoryConfig = {}
): ColumnDef<T> => ({
  accessorKey: accessorKey as string,
  header: config.header || "Test Date",
  cell: ({ row }) => {
    const dateValue = row.original[accessorKey];
    if (!dateValue) return <div className="text-sm font-medium">N/A</div>;
    
    const formattedDate = new Date(dateValue).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    return (
      <div className="text-sm font-medium">{formattedDate}</div>
    );
  },
});
