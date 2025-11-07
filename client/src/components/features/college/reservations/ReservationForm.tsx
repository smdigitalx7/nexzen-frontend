import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmployeeCombobox } from "@/components/ui/employee-combobox";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CollegeClassDropdown,
  CollegeGroupDropdown,
  CollegeCourseDropdown,
  BusRouteDropdown,
  DistanceSlabDropdown,
} from "@/components/shared/Dropdowns";
import { useMemo, useState } from "react";
import { Save } from "lucide-react";

type ReservationFormState = {
  student_name: string;
  aadhar_no: string;
  gender: string;
  dob: string;
  father_or_guardian_name: string;
  father_or_guardian_aadhar_no: string;
  father_or_guardian_mobile: string;
  father_or_guardian_occupation: string;
  mother_or_guardian_name: string;
  mother_or_guardian_aadhar_no: string;
  mother_or_guardian_mobile: string;
  mother_or_guardian_occupation: string;
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  previous_class: string;
  previous_school_details: string;
  present_address: string;
  permanent_address: string;
  application_fee: number;
  preferred_class_id: number;
  preferred_group_id: number;
  group_name: string;
  preferred_course_id: number;
  course_name: string;
  group_fee: number;
  course_fee: number;
  book_fee: number;
  total_tuition_fee: number;
  transport_required: boolean;
  preferred_transport_id: number;
  preferred_distance_slab_id: number;
  pickup_point: string;
  transport_fee: number;
  book_fee_required: boolean;
  course_required: boolean;
  status: string;
  referred_by: number;
  remarks: string;
  reservation_date: string; // yyyy-mm-dd
};

type RouteItem = { id: number; name: string; fee: number };
type GroupItem = { group_id: number; group_name: string; fee: number };
type CourseItem = { course_id: number; course_name: string; fee: number };
type ClassItem = { class_id: number; class_name: string };
type DistanceSlabItem = {
  slab_id: number;
  slab_name: string;
  min_distance: number;
  max_distance?: number;
  fee_amount: number;
};

export type ReservationFormProps = {
  form: ReservationFormState;
  setForm: (next: ReservationFormState) => void;
  groupFee: number;
  courseFee: number;
  transportFee: number;
  routes: RouteItem[];
  groups: GroupItem[];
  courses: CourseItem[];
  classes: ClassItem[];
  distanceSlabs: DistanceSlabItem[];
  onClassChange: (classId: number) => void;
  onGroupChange: (groupId: number) => void;
  onCourseChange: (courseId: number) => void;
  onDistanceSlabChange: (slabId: number) => void;
  onSave: (withPayment: boolean) => void;
  isEdit?: boolean;
  // Loading states for dropdowns
  isLoadingClasses?: boolean;
  isLoadingGroups?: boolean;
  isLoadingCourses?: boolean;
  isLoadingDistanceSlabs?: boolean;
  isLoadingRoutes?: boolean;
  // Handlers to trigger dropdown data fetching
  onDropdownOpen?: (
    dropdown: "classes" | "groups" | "courses" | "distanceSlabs" | "routes"
  ) => void;
};

export default function ReservationForm({
  form,
  setForm,
  groupFee,
  courseFee,
  transportFee,
  routes,
  groups,
  courses,
  classes,
  distanceSlabs,
  onClassChange,
  onGroupChange,
  onCourseChange,
  onDistanceSlabChange,
  onSave,
  isEdit = false,
  isLoadingClasses = false,
  isLoadingGroups = false,
  isLoadingCourses = false,
  isLoadingDistanceSlabs = false,
  isLoadingRoutes = false,
  onDropdownOpen,
}: ReservationFormProps) {
  const isSaveDisabled = useMemo(
    () =>
      !form.student_name?.trim() ||
      !form.preferred_class_id ||
      form.preferred_class_id === 0 ||
      !form.group_name?.trim() ||
      !form.course_name?.trim(),
    [
      form.student_name,
      form.preferred_class_id,
      form.group_name,
      form.course_name,
    ]
  );

  // Confirmation dialog states
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showSaveAndPayConfirmation, setShowSaveAndPayConfirmation] =
    useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveClick = () => {
    setShowSaveConfirmation(true);
  };

  const handleSaveAndPayClick = () => {
    setShowSaveAndPayConfirmation(true);
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);
    try {
      await onSave(false);
      setShowSaveConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSaveAndPay = async () => {
    setIsLoading(true);
    try {
      await onSave(true);
      setShowSaveAndPayConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = () => {
    setShowUpdateConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    setIsLoading(true);
    try {
      await onSave(false); // For update, we don't need payment option
      setShowUpdateConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = () => {
    setForm({
      student_name: "John Doe",
      aadhar_no: "123456789012",
      gender: "MALE",
      dob: "2010-05-15",
      father_or_guardian_name: "Robert Doe",
      father_or_guardian_aadhar_no: "987654321098",
      father_or_guardian_mobile: "9876543210",
      father_or_guardian_occupation: "Engineer",
      mother_or_guardian_name: "Jane Doe",
      mother_or_guardian_aadhar_no: "112233445566",
      mother_or_guardian_mobile: "9876543211",
      mother_or_guardian_occupation: "Teacher",
      siblings: [
        {
          name: "Alice Doe",
          class_name: "8th Grade",
          where: "Same School",
          gender: "FEMALE",
        },
      ],
      previous_class: "12th Grade",
      previous_school_details: "ABC Public School, City Center",
      present_address: "123 Main Street, Downtown Area, City - 123456",
      permanent_address: "123 Main Street, Downtown Area, City - 123456",
      application_fee: 500,
      preferred_class_id:
        classes && classes.length > 0 ? classes[0].class_id : 0,
      preferred_group_id: groups && groups.length > 0 ? groups[0].group_id : 0,
      group_name: groups && groups.length > 0 ? groups[0].group_name : "",
      preferred_course_id:
        courses && courses.length > 0 ? courses[0].course_id : 0,
      course_name: courses && courses.length > 0 ? courses[0].course_name : "",
      group_fee: groups && groups.length > 0 ? groups[0].fee : 0,
      course_fee: courses && courses.length > 0 ? courses[0].fee : 0,
      book_fee: 3000,
      total_tuition_fee: 0, // Will be calculated
      transport_required: true,
      preferred_transport_id: routes && routes.length > 0 ? routes[0].id : 0,
      preferred_distance_slab_id:
        distanceSlabs && distanceSlabs.length > 0
          ? distanceSlabs[0].slab_id
          : 0,
      pickup_point: "Near City Mall",
      transport_fee: 2000,
      book_fee_required: true,
      course_required: true,
      status: "PENDING",
      referred_by: 0,
      remarks:
        "Student is interested in science subjects and extracurricular activities.",
      reservation_date: new Date().toISOString().split("T")[0],
    });

    // Trigger group change to populate fees
    if (groups && groups.length > 0) {
      onGroupChange(groups[0].group_id);
    }

    // Trigger course change to populate fees
    if (courses && courses.length > 0) {
      onCourseChange(courses[0].course_id);
    }

    // Trigger distance slab change to populate transport fee
    if (distanceSlabs && distanceSlabs.length > 0) {
      onDistanceSlabChange(distanceSlabs[0].slab_id);
    }
  };

  const handleClearForm = () => {
    setForm({
      student_name: "",
      aadhar_no: "",
      gender: "",
      dob: "",
      father_or_guardian_name: "",
      father_or_guardian_aadhar_no: "",
      father_or_guardian_mobile: "",
      father_or_guardian_occupation: "",
      mother_or_guardian_name: "",
      mother_or_guardian_aadhar_no: "",
      mother_or_guardian_mobile: "",
      mother_or_guardian_occupation: "",
      siblings: [],
      previous_class: "",
      previous_school_details: "",
      present_address: "",
      permanent_address: "",
      application_fee: 0,
      preferred_class_id: 0,
      preferred_group_id: 0,
      group_name: "",
      preferred_course_id: 0,
      course_name: "",
      group_fee: 0,
      course_fee: 0,
      book_fee: 0,
      total_tuition_fee: 0,
      transport_required: false,
      preferred_transport_id: 0,
      preferred_distance_slab_id: 0,
      pickup_point: "",
      transport_fee: 0,
      book_fee_required: false,
      course_required: false,
      status: "PENDING",
      referred_by: 0,
      remarks: "",
      reservation_date: "",
    });
  };

  const addSibling = () => {
    const next = [
      ...(form.siblings || []),
      { name: "", class_name: "", where: "", gender: "MALE" },
    ];
    setForm({ ...form, siblings: next });
  };

  const updateSibling = (
    index: number,
    field: "name" | "class_name" | "where" | "gender",
    value: string
  ) => {
    const siblings = form.siblings || [];
    const next = siblings.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    setForm({ ...form, siblings: next });
  };

  const removeSibling = (index: number) => {
    const siblings = form.siblings || [];
    const next = siblings.filter((_, i) => i !== index);
    setForm({ ...form, siblings: next });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">
              {isEdit ? "Edit Student Reservation" : "Student Reservation Form"}
            </h2>
            <p className="text-muted-foreground">
              {isEdit
                ? "Update the student reservation details below"
                : "Fill in all the required details for the new student reservation"}
            </p>
          </div>
          {!isEdit && (
            <div className="flex gap-2 ml-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearForm}
              >
                Clear Form
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-8">
          {/* Student Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="student_name">Student Name *</Label>
                <Input
                  id="student_name"
                  value={form.student_name}
                  onChange={(e) =>
                    setForm({ ...form, student_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="aadhar_no">Aadhar No</Label>
                <Input
                  id="aadhar_no"
                  value={form.aadhar_no}
                  onChange={(e) =>
                    setForm({ ...form, aadhar_no: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) => setForm({ ...form, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">MALE</SelectItem>
                    <SelectItem value="FEMALE">FEMALE</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <DatePicker
                  id="dob"
                  value={form.dob}
                  onChange={(value) => setForm({ ...form, dob: value })}
                  placeholder="Select date of birth"
                />
              </div>
              <div className="md:col-span-2"></div>
            </div>
          </div>

          {/* Parent/Guardian Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="father_or_guardian_name">
                  Father/Guardian Name
                </Label>
                <Input
                  id="father_or_guardian_name"
                  value={form.father_or_guardian_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      father_or_guardian_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="father_or_guardian_aadhar_no">
                  Father/Guardian Aadhar No
                </Label>
                <Input
                  id="father_or_guardian_aadhar_no"
                  value={form.father_or_guardian_aadhar_no}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      father_or_guardian_aadhar_no: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="father_or_guardian_mobile">
                  Father/Guardian Mobile
                </Label>
                <Input
                  id="father_or_guardian_mobile"
                  value={form.father_or_guardian_mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      father_or_guardian_mobile: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="father_or_guardian_occupation">
                  Father/Guardian Occupation
                </Label>
                <Input
                  id="father_or_guardian_occupation"
                  value={form.father_or_guardian_occupation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      father_or_guardian_occupation: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_or_guardian_name">
                  Mother/Guardian Name *
                </Label>
                <Input
                  id="mother_or_guardian_name"
                  value={form.mother_or_guardian_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mother_or_guardian_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_or_guardian_aadhar_no">
                  Mother/Guardian Aadhar No *
                </Label>
                <Input
                  id="mother_or_guardian_aadhar_no"
                  value={form.mother_or_guardian_aadhar_no}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mother_or_guardian_aadhar_no: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_or_guardian_mobile">
                  Mother/Guardian Mobile *
                </Label>
                <Input
                  id="mother_or_guardian_mobile"
                  value={form.mother_or_guardian_mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mother_or_guardian_mobile: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_or_guardian_occupation">
                  Mother/Guardian Occupation *
                </Label>
                <Input
                  id="mother_or_guardian_occupation"
                  value={form.mother_or_guardian_occupation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mother_or_guardian_occupation: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Siblings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Siblings Information
            </h3>
            <div className="space-y-3">
              {(!form.siblings || form.siblings.length === 0) && (
                <div className="text-sm text-slate-500">No siblings added.</div>
              )}
              <div className="space-y-2">
                {(form.siblings || []).map((s, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
                  >
                    <div className="md:col-span-2">
                      <Label htmlFor={`sibling-name-${idx}`}>Name</Label>
                      <Input
                        id={`sibling-name-${idx}`}
                        value={s.name || ""}
                        onChange={(e) =>
                          updateSibling(idx, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sibling-class-${idx}`}>Class</Label>
                      <Input
                        id={`sibling-class-${idx}`}
                        value={s.class_name || ""}
                        onChange={(e) =>
                          updateSibling(idx, "class_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sibling-where-${idx}`}>Where</Label>
                      <Input
                        id={`sibling-where-${idx}`}
                        value={s.where || ""}
                        onChange={(e) =>
                          updateSibling(idx, "where", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sibling-gender-${idx}`}>Gender</Label>
                      <Select
                        value={s.gender || "MALE"}
                        onValueChange={(value) =>
                          updateSibling(idx, "gender", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">MALE</SelectItem>
                          <SelectItem value="FEMALE">FEMALE</SelectItem>
                          <SelectItem value="OTHER">OTHER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeSibling(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addSibling}>
                Add Sibling
              </Button>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preferred_class_id">Preferred Class *</Label>
                <CollegeClassDropdown
                  value={form.preferred_class_id || null}
                  onChange={(value) => {
                    if (value !== null) {
                      setForm({
                        ...form,
                        preferred_class_id: value,
                      });
                      onClassChange(value);
                    } else {
                      setForm({
                        ...form,
                        preferred_class_id: 0,
                      });
                      onClassChange(0);
                    }
                  }}
                  placeholder="Select class"
                  required
                />
              </div>
              <div>
                <Label htmlFor="previous_class">Previous Class</Label>
                <Input
                  id="previous_class"
                  value={form.previous_class}
                  onChange={(e) =>
                    setForm({ ...form, previous_class: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="previous_school_details">
                  Previous School Details
                </Label>
                <Input
                  id="previous_school_details"
                  value={form.previous_school_details}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      previous_school_details: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="group_name">Group Name *</Label>
                <CollegeGroupDropdown
                  classId={form.preferred_class_id || undefined}
                  value={form.preferred_group_id || null}
                  onChange={(value) => {
                    if (value !== null) {
                      const selectedGroup = groups.find(
                        (g) => g.group_id === value
                      );
                      if (selectedGroup) {
                        setForm({
                          ...form,
                          group_name: selectedGroup.group_name,
                          preferred_group_id: value,
                          group_fee: selectedGroup.fee,
                        });
                        onGroupChange(value);
                      }
                    } else {
                      setForm({
                        ...form,
                        group_name: "",
                        preferred_group_id: 0,
                        group_fee: 0,
                      });
                      onGroupChange(0);
                    }
                  }}
                  placeholder="Select group"
                  required
                  disabled={!form.preferred_class_id || form.preferred_class_id === 0}
                />
              </div>
              <div>
                <Label htmlFor="course_name">Course Name *</Label>
                <CollegeCourseDropdown
                  groupId={form.preferred_group_id || 0}
                  value={form.preferred_course_id || null}
                  onChange={(value) => {
                    if (value !== null) {
                      const selectedCourse = courses.find(
                        (c) => c.course_id === value
                      );
                      if (selectedCourse) {
                        setForm({
                          ...form,
                          course_name: selectedCourse.course_name,
                          preferred_course_id: value,
                          course_fee: selectedCourse.fee,
                        });
                        onCourseChange(value);
                      }
                    } else {
                      setForm({
                        ...form,
                        course_name: "",
                        preferred_course_id: 0,
                        course_fee: 0,
                      });
                      onCourseChange(0);
                    }
                  }}
                  placeholder="Select course"
                  required
                  disabled={!form.preferred_group_id || form.preferred_group_id === 0}
                />
              </div>
              <div>
                <Label htmlFor="total_tuition_fee">Total Tuition Fee</Label>
                <Input
                  id="total_tuition_fee"
                  type="number"
                  value={form.total_tuition_fee || ""}
                  readOnly
                  placeholder="Calculated from group and course fees"
                />
              </div>
              <div>
                <Label htmlFor="group_fee">Group Fee</Label>
                <Input
                  id="group_fee"
                  type="number"
                  value={form.group_fee || ""}
                  readOnly
                  placeholder="Select a group to auto-populate"
                />
              </div>
              <div>
                <Label htmlFor="course_fee">Course Fee</Label>
                <Input
                  id="course_fee"
                  type="number"
                  value={form.course_fee || ""}
                  readOnly
                  placeholder="Select a course to auto-populate"
                />
              </div>
              <div>
                <Label htmlFor="book_fee">Book Fee</Label>
                <Input
                  id="book_fee"
                  type="number"
                  value={form.book_fee || ""}
                  onChange={(e) =>
                    setForm({ ...form, book_fee: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="present_address">Present Address *</Label>
                <Textarea
                  id="present_address"
                  value={form.present_address}
                  onChange={(e) =>
                    setForm({ ...form, present_address: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="permanent_address">Permanent Address *</Label>
                <Textarea
                  id="permanent_address"
                  value={form.permanent_address}
                  onChange={(e) =>
                    setForm({ ...form, permanent_address: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Transport Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Transport Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="transport_required">Transport Required</Label>
                <Select
                  value={form.transport_required ? "true" : "false"}
                  onValueChange={(value) =>
                    setForm({ ...form, transport_required: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.transport_required && (
                <>
                  <div>
                    <Label htmlFor="preferred_transport_id">
                      Transport Route
                    </Label>
                    <BusRouteDropdown
                      value={form.preferred_transport_id || null}
                      onChange={(value) => {
                        setForm({
                          ...form,
                          preferred_transport_id: value || 0,
                        });
                      }}
                      placeholder="Select transport route"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferred_distance_slab_id">
                      Distance Slab
                    </Label>
                    <DistanceSlabDropdown
                      value={form.preferred_distance_slab_id || null}
                      onChange={(value) => {
                        const valueNum = value || 0;
                        setForm({
                          ...form,
                          preferred_distance_slab_id: valueNum,
                        });
                        onDistanceSlabChange(valueNum);
                      }}
                      placeholder="Select distance slab"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup_point">Pickup Point</Label>
                    <Input
                      id="pickup_point"
                      value={form.pickup_point}
                      onChange={(e) =>
                        setForm({ ...form, pickup_point: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="transport_fee">Transport Fee</Label>
                    <Input
                      id="transport_fee"
                      type="number"
                      value={transportFee}
                      readOnly
                    />
                  </div>
                  <div></div>
                </>
              )}
            </div>
          </div>

          {/* College-Specific Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              College Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="book_fee_required">Book Fee Required</Label>
                <Select
                  value={form.book_fee_required ? "true" : "false"}
                  onValueChange={(value) =>
                    setForm({ ...form, book_fee_required: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select book fee requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course_required">Course Required</Label>
                <Select
                  value={form.course_required ? "true" : "false"}
                  onValueChange={(value) =>
                    setForm({ ...form, course_required: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="referred_by">Referred By</Label>
                <EmployeeCombobox
                  value={form.referred_by.toString()}
                  onValueChange={(value) => {
                    if (import.meta.env.DEV) {
                      console.log("EmployeeCombobox value changed:", value);
                    }
                    setForm({ ...form, referred_by: Number(value) });
                  }}
                  placeholder="Select referring employee..."
                />
              </div>
              <div>
                <Label htmlFor="reservation_date">Reservation Date</Label>
                <DatePicker
                  id="reservation_date"
                  value={form.reservation_date}
                  onChange={(value) =>
                    setForm({ ...form, reservation_date: value })
                  }
                  placeholder="Select reservation date"
                />
              </div>
              <div></div>
              <div className="md:col-span-3">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Fee Information Section */}
          <div className="space-y-4 ">
            <h3 className="text-lg font-semibold border-b pb-2">
              Application Fee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="application_fee">Application Fee</Label>
                <Input
                  id="application_fee"
                  type="number"
                  value={form.application_fee}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      application_fee: Number(e.target.value),
                    })
                  }
                  className="w-full mb-5"
                />
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer for New Reservation - Only show for new reservations, not edit mode */}
      {!isEdit && (
        <div className="sticky bottom-0 bg-background border-t p-4">
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSaveAndPayClick}
              disabled={isSaveDisabled}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Pay
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        title="Confirm Reservation Creation"
        description={`Are you sure you want to create a reservation for ${form.student_name}? This will save the reservation with PENDING status.`}
        confirmText="Create Reservation"
        cancelText="Cancel"
        onConfirm={handleConfirmSave}
        isLoading={isLoading}
        loadingText="Creating reservation..."
        disabled={isLoading}
      />

      <ConfirmDialog
        open={showSaveAndPayConfirmation}
        onOpenChange={setShowSaveAndPayConfirmation}
        title="Confirm Reservation & Payment"
        description={`Are you sure you want to create a reservation for ${form.student_name} and proceed with payment? This will save the reservation and show the payment receipt.`}
        confirmText="Create & Show Receipt"
        cancelText="Cancel"
        onConfirm={handleConfirmSaveAndPay}
        isLoading={isLoading}
        loadingText="Creating reservation..."
        disabled={isLoading}
      />

      <ConfirmDialog
        open={showUpdateConfirmation}
        onOpenChange={setShowUpdateConfirmation}
        title="Confirm Reservation Update"
        description={`Are you sure you want to update the reservation for ${form.student_name}? This will save all the changes made to the reservation.`}
        confirmText="Update Reservation"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        isLoading={isLoading}
        loadingText="Updating reservation..."
        disabled={isLoading}
      />
    </>
  );
}
