# Reusable Dropdown Components

Professional, consistent, and type-safe dropdown components for use throughout the frontend.

## Features

- ✅ **Loading States** - Spinner with loading text
- ✅ **Error States** - Error messages with retry option
- ✅ **Empty States** - Custom messages when no options available
- ✅ **Consistent Styling** - Unified design across all dropdowns
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Accessible** - ARIA attributes and keyboard navigation
- ✅ **Auto-clear** - Dependent dropdowns auto-clear when parent changes
- ✅ **Custom Rendering** - Support for custom option rendering

## Installation

All dropdowns are available from the main index:

```tsx
import {
  // School dropdowns
  SchoolClassDropdown,
  SchoolSectionDropdown,
  SchoolSubjectDropdown,
  SchoolExamDropdown,
  SchoolTestDropdown,
  SchoolTeacherDropdown,
  
  // College dropdowns
  CollegeClassDropdown,
  CollegeGroupDropdown,
  CollegeCourseDropdown,
  CollegeSubjectDropdown,
  CollegeExamDropdown,
  CollegeTestDropdown,
  
  // Shared dropdowns
  BusRouteDropdown,
  DistanceSlabDropdown,
} from "@/components/shared/Dropdowns";
```

## Usage Examples

### Basic Usage

```tsx
import { SchoolClassDropdown } from "@/components/shared/Dropdowns";

function MyComponent() {
  const [selectedClass, setSelectedClass] = React.useState<number | null>(null);

  return (
    <SchoolClassDropdown
      value={selectedClass}
      onChange={(value) => setSelectedClass(value)}
      placeholder="Select class"
    />
  );
}
```

### Dependent Dropdowns (School)

```tsx
import {
  SchoolClassDropdown,
  SchoolSectionDropdown,
} from "@/components/shared/Dropdowns";

function MyComponent() {
  const [classId, setClassId] = React.useState<number | null>(null);
  const [sectionId, setSectionId] = React.useState<number | null>(null);

  return (
    <>
      <SchoolClassDropdown
        value={classId}
        onChange={setClassId}
        placeholder="Select class"
      />
      <SchoolSectionDropdown
        classId={classId || 0}
        value={sectionId}
        onChange={setSectionId}
        placeholder="Select section"
      />
    </>
  );
}
```

### Dependent Dropdowns (College)

```tsx
import {
  CollegeClassDropdown,
  CollegeGroupDropdown,
  CollegeCourseDropdown,
} from "@/components/shared/Dropdowns";

function MyComponent() {
  const [classId, setClassId] = React.useState<number | null>(null);
  const [groupId, setGroupId] = React.useState<number | null>(null);
  const [courseId, setCourseId] = React.useState<number | null>(null);

  return (
    <>
      <CollegeClassDropdown
        value={classId}
        onChange={setClassId}
      />
      <CollegeGroupDropdown
        classId={classId || undefined}
        value={groupId}
        onChange={setGroupId}
      />
      <CollegeCourseDropdown
        groupId={groupId || 0}
        value={courseId}
        onChange={setCourseId}
      />
    </>
  );
}
```

### With Form Validation

```tsx
import { SchoolClassDropdown } from "@/components/shared/Dropdowns";
import { Label } from "@/components/ui/label";

function MyForm() {
  const [classId, setClassId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Label htmlFor="class">Class *</Label>
      <SchoolClassDropdown
        value={classId}
        onChange={(value) => {
          setClassId(value);
          setError(null);
        }}
        required
        placeholder="Select class"
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

### With Empty Value Option

```tsx
import { SchoolClassDropdown } from "@/components/shared/Dropdowns";

function MyComponent() {
  return (
    <SchoolClassDropdown
      value={classId}
      onChange={setClassId}
      emptyValue
      emptyValueLabel="No class selected"
    />
  );
}
```

## Component Props

All dropdowns share common props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null` | `undefined` | Selected value |
| `onChange` | `(value: number \| null) => void` | `undefined` | Change handler |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `required` | `boolean` | `false` | Mark as required |
| `placeholder` | `string` | Component-specific | Placeholder text |
| `className` | `string` | `undefined` | Additional CSS classes |
| `emptyValue` | `boolean` | `false` | Show "None" option |
| `emptyValueLabel` | `string` | Component-specific | Label for empty value |

## School Dropdowns

### SchoolClassDropdown
- **Data Source**: `/api/v1/school/dropdowns/classes`
- **Value**: `class_id`
- **Label**: `class_name`

### SchoolSectionDropdown
- **Data Source**: `/api/v1/school/dropdowns/sections?class_id={classId}`
- **Value**: `section_id`
- **Label**: `section_name`
- **Dependency**: Requires `classId` prop

### SchoolSubjectDropdown
- **Data Source**: `/api/v1/school/dropdowns/subjects?class_id={classId}`
- **Value**: `subject_id`
- **Label**: `subject_name`
- **Dependency**: Requires `classId` prop

### SchoolExamDropdown
- **Data Source**: `/api/v1/school/dropdowns/exams`
- **Value**: `exam_id`
- **Label**: `exam_name`
- **Special**: Shows exam date if available

### SchoolTestDropdown
- **Data Source**: `/api/v1/school/dropdowns/tests`
- **Value**: `test_id`
- **Label**: `test_name`
- **Special**: Shows test date if available

### SchoolTeacherDropdown
- **Data Source**: `/api/v1/public/employees/teacher-by-branch`
- **Value**: `employee_id`
- **Label**: `employee_name`

## College Dropdowns

### CollegeClassDropdown
- **Data Source**: `/api/v1/college/dropdowns/classes`
- **Value**: `class_id`
- **Label**: `class_name`

### CollegeGroupDropdown
- **Data Source**: `/api/v1/college/dropdowns/groups?class_id={classId}`
- **Value**: `group_id`
- **Label**: `group_name`
- **Dependency**: Optional `classId` prop

### CollegeCourseDropdown
- **Data Source**: `/api/v1/college/dropdowns/courses?group_id={groupId}`
- **Value**: `course_id`
- **Label**: `course_name`
- **Dependency**: Requires `groupId` prop

### CollegeSubjectDropdown
- **Data Source**: `/api/v1/college/dropdowns/subjects?group_id={groupId}`
- **Value**: `subject_id`
- **Label**: `subject_name`
- **Dependency**: Requires `groupId` prop

### CollegeExamDropdown
- **Data Source**: `/api/v1/college/dropdowns/exams`
- **Value**: `exam_id`
- **Label**: `exam_name`
- **Special**: Shows exam date if available

### CollegeTestDropdown
- **Data Source**: `/api/v1/college/dropdowns/tests`
- **Value**: `test_id`
- **Label**: `test_name`
- **Special**: Shows test date if available

## Shared Dropdowns

### BusRouteDropdown
- **Data Source**: `/api/v1/public/bus-routes/names`
- **Value**: `bus_route_id`
- **Label**: `route_name` (includes `route_no` if available)

### DistanceSlabDropdown
- **Data Source**: `/api/v1/public/transport-fee-structures`
- **Value**: `slab_id`
- **Label**: `slab_name (min_distance-max_distance km) - ₹fee_amount`

## Behavior

### Auto-Clear
Dependent dropdowns automatically clear their value when the parent value changes:

```tsx
// When classId changes, sectionId is automatically cleared
<SchoolSectionDropdown
  classId={classId || 0}
  value={sectionId}
  onChange={setSectionId}
/>
```

### Loading States
All dropdowns show a loading spinner and message while fetching data.

### Error States
When an error occurs, dropdowns display:
- Error icon
- Error message
- Retry button (if `onRetry` is provided)

### Empty States
When no options are available, dropdowns show a custom message.

## Styling

All dropdowns use the base `Select` component from `@/components/ui/select` and inherit its styling. You can customize appearance using the `className` prop.

## TypeScript

All components are fully typed. Import types for props:

```tsx
import type {
  SchoolClassDropdownProps,
  CollegeGroupDropdownProps,
  BusRouteDropdownProps,
} from "@/components/shared/Dropdowns";
```

## Best Practices

1. **Always handle null values** - Dropdowns can return `null`, ensure your state handles this
2. **Use dependent dropdowns correctly** - Pass required dependency props
3. **Provide meaningful placeholders** - Help users understand what to select
4. **Handle loading states** - Consider disabling forms while dropdowns load
5. **Show validation errors** - Use the `className` prop to show error states

## Examples in Codebase

See these files for real-world usage:
- `components/features/school/reservations/ReservationForm.tsx`
- `components/features/college/reservations/ReservationForm.tsx`
- `components/features/school/marks/ExamMarksManagement.tsx`

