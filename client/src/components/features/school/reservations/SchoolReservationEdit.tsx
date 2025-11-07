import { useMemo, memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

type RouteOption = { id: string; name: string; fee: number };

type Props = {
  form: any;
  setForm: (next: any) => void;
  classFee?: number;
  transportFee?: number;
  routes: RouteOption[];
  classes: Array<{ class_id: number; class_name: string }>;
  distanceSlabs: Array<{
    slab_id: number;
    slab_name?: string;
    fee_amount: number;
  }>;
  onClassChange: (classId: string) => void;
  onDistanceSlabChange: (slabId: string) => void;
  onSave: () => Promise<void> | void;
};

// Memoized form field component
const FormField = memo(
  ({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
  }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
);

FormField.displayName = "FormField";

// Memoized select field component
const SelectField = memo(
  ({
    label,
    value,
    onValueChange,
    placeholder,
    children,
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    children: React.ReactNode;
  }) => (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
);

SelectField.displayName = "SelectField";

// Memoized student details section
const StudentDetailsSection = memo(
  ({ form, setForm }: { form: any; setForm: (next: any) => void }) => {
    const genderValue = useMemo(
      () => (form.gender || "OTHER").toString(),
      [form.gender]
    );

    return (
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="student_name"
          label="Student Name"
          value={form.student_name || ""}
          onChange={(value) => setForm({ ...form, student_name: value })}
        />
        <FormField
          id="aadhar_no"
          label="Aadhar No"
          value={form.aadhar_no || ""}
          onChange={(value) => setForm({ ...form, aadhar_no: value })}
        />
        <SelectField
          label="Gender"
          value={genderValue}
          onValueChange={(value) => setForm({ ...form, gender: value })}
          placeholder="Select gender"
        >
          <SelectItem value="MALE">Male</SelectItem>
          <SelectItem value="FEMALE">Female</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectField>
        <FormField
          id="dob"
          label="Date of Birth"
          type="date"
          value={form.dob || ""}
          onChange={(value) => setForm({ ...form, dob: value })}
        />
      </div>
    );
  }
);
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        id="student_name"
        label="Student Name"
        value={form.student_name || ""}
        onChange={(value) => setForm({ ...form, student_name: value })}
      />
      <FormField
        id="aadhar_no"
        label="Aadhar No"
        value={form.aadhar_no || ""}
        onChange={(value) => setForm({ ...form, aadhar_no: value })}
      />
      <SelectField
        label="Gender"
        value={genderValue}
        onValueChange={(value) => setForm({ ...form, gender: value })}
        placeholder="Select gender"
      >
        <SelectItem value="MALE">Male</SelectItem>
        <SelectItem value="FEMALE">Female</SelectItem>
        <SelectItem value="OTHER">Other</SelectItem>
      </SelectField>
      <div>
        <Label htmlFor="dob">Date of Birth</Label>
        <DatePicker
          id="dob"
          value={form.dob || ""}
          onChange={(value) => setForm({ ...form, dob: value })}
          placeholder="Select date of birth"
        />
      </div>
    </div>
  );
});

StudentDetailsSection.displayName = "StudentDetailsSection";

// Memoized parent details section
const ParentDetailsSection = memo(
  ({ form, setForm }: { form: any; setForm: (next: any) => void }) => (
    <div className="border-t pt-4">
      <div className="font-medium mb-2">Parent Details</div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="father_or_guardian_name"
          label="Father/Guardian Name"
          value={form.father_or_guardian_name || ""}
          onChange={(value) =>
            setForm({ ...form, father_or_guardian_name: value })
          }
        />
        <FormField
          id="father_or_guardian_aadhar_no"
          label="Father/Guardian Aadhar"
          value={form.father_or_guardian_aadhar_no || ""}
          onChange={(value) =>
            setForm({ ...form, father_or_guardian_aadhar_no: value })
          }
        />
        <FormField
          id="father_or_guardian_mobile"
          label="Father/Guardian Mobile"
          value={form.father_or_guardian_mobile || ""}
          onChange={(value) =>
            setForm({ ...form, father_or_guardian_mobile: value })
          }
        />
        <FormField
          id="father_or_guardian_occupation"
          label="Father/Guardian Occupation"
          value={form.father_or_guardian_occupation || ""}
          onChange={(value) =>
            setForm({ ...form, father_or_guardian_occupation: value })
          }
        />
        <FormField
          id="mother_or_guardian_name"
          label="Mother/Guardian Name"
          value={form.mother_or_guardian_name || ""}
          onChange={(value) =>
            setForm({ ...form, mother_or_guardian_name: value })
          }
        />
        <FormField
          id="mother_or_guardian_aadhar_no"
          label="Mother/Guardian Aadhar"
          value={form.mother_or_guardian_aadhar_no || ""}
          onChange={(value) =>
            setForm({ ...form, mother_or_guardian_aadhar_no: value })
          }
        />
        <FormField
          id="mother_or_guardian_mobile"
          label="Mother/Guardian Mobile"
          value={form.mother_or_guardian_mobile || ""}
          onChange={(value) =>
            setForm({ ...form, mother_or_guardian_mobile: value })
          }
        />
        <FormField
          id="mother_or_guardian_occupation"
          label="Mother/Guardian Occupation"
          value={form.mother_or_guardian_occupation || ""}
          onChange={(value) =>
            setForm({ ...form, mother_or_guardian_occupation: value })
          }
        />
      </div>
    </div>
  )
);

ParentDetailsSection.displayName = "ParentDetailsSection";

// Memoized academic details section
const AcademicDetailsSection = memo(
  ({
    form,
    setForm,
    classes,
    onClassChange,
  }: {
    form: any;
    setForm: (next: any) => void;
    classes: Array<{ class_id: number; class_name: string }>;
    onClassChange: (classId: string) => void;
  }) => (
    <div className="border-t pt-4">
      <div className="font-medium mb-2">Academic Details</div>
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Preferred Class"
          value={form.preferred_class_id?.toString?.() || ""}
          onValueChange={onClassChange}
          placeholder="Select class"
        >
          {classes.map((c) => (
            <SelectItem key={c.class_id} value={c.class_id.toString()}>
              {c.class_name}
            </SelectItem>
          ))}
        </SelectField>
        <FormField
          id="previous_class"
          label="Previous Class"
          value={form.previous_class || ""}
          onChange={(value) => setForm({ ...form, previous_class: value })}
        />
        <div className="col-span-2">
          <FormField
            id="previous_school_details"
            label="Previous School"
            value={form.previous_school_details || ""}
            onChange={(value) =>
              setForm({ ...form, previous_school_details: value })
            }
          />
        </div>
      </div>
    </div>
  )
);

AcademicDetailsSection.displayName = "AcademicDetailsSection";

// Memoized contact details section
const ContactDetailsSection = memo(
  ({ form, setForm }: { form: any; setForm: (next: any) => void }) => (
    <div className="border-t pt-4">
      <div className="font-medium mb-2">Contact Details</div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="present_address"
          label="Present Address"
          value={form.present_address || ""}
          onChange={(value) => setForm({ ...form, present_address: value })}
        />
        <FormField
          id="permanent_address"
          label="Permanent Address"
          value={form.permanent_address || ""}
          onChange={(value) => setForm({ ...form, permanent_address: value })}
        />
      </div>
    </div>
  )
);

ContactDetailsSection.displayName = "ContactDetailsSection";

// Memoized fees section
const FeesSection = memo(
  ({
    form,
    setForm,
    classFee,
    transportFee,
  }: {
    form: any;
    setForm: (next: any) => void;
    classFee?: number;
    transportFee?: number;
  }) => (
    <div className="border-t pt-4">
      <div className="font-medium mb-2">Fees</div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="application_fee"
          label="Application Fee"
          type="number"
          value={form.application_fee || "0"}
          onChange={(value) => setForm({ ...form, application_fee: value })}
        />
        <FormField
          id="tuition_fee"
          label="Tuition Fee"
          type="number"
          value={form.tuition_fee || "0"}
          onChange={(value) => setForm({ ...form, tuition_fee: value })}
        />
        <FormField
          id="book_fee"
          label="Book Fee"
          type="number"
          value={form.book_fee || "0"}
          onChange={(value) => setForm({ ...form, book_fee: value })}
        />
      </div>
      {(classFee != null || transportFee != null) && (
        <div className="text-xs text-muted-foreground mt-2">
          {classFee != null && (
            <div>
              Class Tuition (ref): ₹{Number(classFee || 0).toLocaleString()}
            </div>
          )}
          {transportFee != null && (
            <div>
              Transport (ref): ₹{Number(transportFee || 0).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
);

FeesSection.displayName = "FeesSection";

// Memoized transport section
const TransportSection = memo(
  ({
    form,
    setForm,
    routes,
    distanceSlabs,
    transportFee,
    onDistanceSlabChange,
  }: {
    form: any;
    setForm: (next: any) => void;
    routes: RouteOption[];
    distanceSlabs: Array<{
      slab_id: number;
      slab_name?: string;
      fee_amount: number;
      min_distance?: number;
      max_distance?: number;
    }>;
    transportFee?: number;
    onDistanceSlabChange: (slabId: string) => void;
  }) => (
    <div className="border-t pt-4">
      <div className="font-medium mb-2">Transport</div>
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Transport Required"
          value={form.transport_required ? "true" : "false"}
          onValueChange={(value) =>
            setForm({ ...form, transport_required: value === "true" })
          }
          placeholder="Select transport"
        >
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectField>
        {form.transport_required && (
          <>
            <SelectField
              label="Transport Route"
              value={form.preferred_transport_id?.toString?.() || "0"}
              onValueChange={(value) =>
                setForm({ ...form, preferred_transport_id: value })
              }
              placeholder="Select transport route"
            >
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectField>
            <SelectField
              label="Distance Slab"
              value={form.preferred_distance_slab_id?.toString?.() || "0"}
              onValueChange={onDistanceSlabChange}
              placeholder="Select distance slab"
            >
              {distanceSlabs.map((s) => (
                <SelectItem key={s.slab_id} value={s.slab_id.toString()}>
                  {s.slab_name || `Slab ${s.slab_id}`}
                  {s.min_distance !== undefined && (
                    <>
                      {" "}
                      - {s.min_distance}km
                      {s.max_distance ? `-${s.max_distance}km` : "+"} (₹
                      {s.fee_amount})
                    </>
                  )}
                </SelectItem>
              ))}
            </SelectField>
            <FormField
              id="pickup_point"
              label="Pickup Point"
              value={form.pickup_point || ""}
              onChange={(value) => setForm({ ...form, pickup_point: value })}
            />
            <div>
              <Label htmlFor="transport_fee">Transport Fee</Label>
              <Input
                id="transport_fee"
                type="number"
                value={transportFee?.toString() || "0"}
                readOnly
                className="bg-muted"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
);

TransportSection.displayName = "TransportSection";

const SchoolReservationEditComponent = ({
  form,
  setForm,
  classFee,
  transportFee,
  routes,
  classes,
  distanceSlabs,
  onClassChange,
  onDistanceSlabChange,
  onSave,
}: Props) => {
  return (
    <div className="space-y-6">
      <StudentDetailsSection form={form} setForm={setForm} />
      <ParentDetailsSection form={form} setForm={setForm} />
      <AcademicDetailsSection
        form={form}
        setForm={setForm}
        classes={classes}
        onClassChange={onClassChange}
      />
      <ContactDetailsSection form={form} setForm={setForm} />
      <FeesSection
        form={form}
        setForm={setForm}
        classFee={classFee}
        transportFee={transportFee}
      />
      <TransportSection
        form={form}
        setForm={setForm}
        routes={routes}
        distanceSlabs={distanceSlabs}
        transportFee={transportFee}
        onDistanceSlabChange={onDistanceSlabChange}
      />
    </div>
  );
};

export const SchoolReservationEdit = SchoolReservationEditComponent;
export default SchoolReservationEditComponent;
