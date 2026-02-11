import { useMemo } from "react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { SmartSelect } from "@/common/components/ui/smart-select";
import { Switch } from "@/common/components/ui/switch";
import { Button } from "@/common/components/ui/button";
import { DatePicker } from "@/common/components/ui/date-picker";
import {
  CollegeClassDropdown,
  DistanceSlabDropdown,
} from "@/common/components/shared/Dropdowns";

type RouteOption = { id: string; name: string; fee: number };

type Props = {
  form: any;
  setForm: (next: any) => void;
  classFee?: number;
  transportFee?: number;
  routes: RouteOption[];
  classes: Array<{ class_id: number; class_name: string }>;
  distanceSlabs: Array<{ slab_id: number; slab_name?: string; fee_amount: number }>;
  onClassChange: (classId: string) => void;
  onDistanceSlabChange: (slabId: string) => void;
  onSave: () => Promise<void> | void;
  modal?: boolean;
};

export default function CollegeReservationEdit({ form, setForm, classFee, transportFee, routes, classes, distanceSlabs, onClassChange, onDistanceSlabChange, onSave, modal = false }: Props) {
  const genderValue = useMemo(() => (form.gender || "OTHER").toString(), [form.gender]);

  return (
    <div className="space-y-6 p-1">
      {/* Student Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="font-semibold text-base">Student Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="student_name">Student Name</Label>
            <Input id="student_name" value={form.student_name || ""} onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="aadhar_no">Aadhar No</Label>
            <Input id="aadhar_no" value={form.aadhar_no || ""} onChange={(e) => setForm({ ...form, aadhar_no: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <SmartSelect
              items={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "OTHER", label: "Other" },
              ]}
              value={genderValue}
              onSelect={(v: string) => setForm({ ...form, gender: v })}
              placeholder="Select gender"
              radioLayout="horizontal"
            />
          </div>
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
      </div>

      {/* Parent/Guardian Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="font-semibold text-base">Parent/Guardian Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="father_or_guardian_name">Father/Guardian Name</Label>
            <Input id="father_or_guardian_name" value={form.father_or_guardian_name || ""} onChange={(e) => setForm({ ...form, father_or_guardian_name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="father_or_guardian_aadhar_no">Father/Guardian Aadhar</Label>
            <Input id="father_or_guardian_aadhar_no" value={form.father_or_guardian_aadhar_no || ""} onChange={(e) => setForm({ ...form, father_or_guardian_aadhar_no: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="father_or_guardian_mobile">Father/Guardian Mobile</Label>
            <Input id="father_or_guardian_mobile" value={form.father_or_guardian_mobile || ""} onChange={(e) => setForm({ ...form, father_or_guardian_mobile: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="father_or_guardian_occupation">Father/Guardian Occupation</Label>
            <Input id="father_or_guardian_occupation" value={form.father_or_guardian_occupation || ""} onChange={(e) => setForm({ ...form, father_or_guardian_occupation: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="mother_or_guardian_name">Mother/Guardian Name</Label>
            <Input id="mother_or_guardian_name" value={form.mother_or_guardian_name || ""} onChange={(e) => setForm({ ...form, mother_or_guardian_name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="mother_or_guardian_aadhar_no">Mother/Guardian Aadhar</Label>
            <Input id="mother_or_guardian_aadhar_no" value={form.mother_or_guardian_aadhar_no || ""} onChange={(e) => setForm({ ...form, mother_or_guardian_aadhar_no: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="mother_or_guardian_mobile">Mother/Guardian Mobile</Label>
            <Input id="mother_or_guardian_mobile" value={form.mother_or_guardian_mobile || ""} onChange={(e) => setForm({ ...form, mother_or_guardian_mobile: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="mother_or_guardian_occupation">Mother/Guardian Occupation</Label>
            <Input id="mother_or_guardian_occupation" value={form.mother_or_guardian_occupation || ""} onChange={(e) => setForm({ ...form, mother_or_guardian_occupation: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="font-semibold text-base">Contact Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="present_address">Present Address</Label>
            <Input id="present_address" value={form.present_address || ""} onChange={(e) => setForm({ ...form, present_address: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="permanent_address">Permanent Address</Label>
            <Input id="permanent_address" value={form.permanent_address || ""} onChange={(e) => setForm({ ...form, permanent_address: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Fees Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="font-semibold text-base">Fees</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="application_fee">Application Fee</Label>
            <Input id="application_fee" type="number" value={form.application_fee || "0"} onChange={(e) => setForm({ ...form, application_fee: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="tuition_fee">Tuition Fee</Label>
            <Input id="tuition_fee" type="number" value={form.tuition_fee || "0"} onChange={(e) => setForm({ ...form, tuition_fee: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="book_fee">Book Fee</Label>
            <Input id="book_fee" type="number" value={form.book_fee || "0"} onChange={(e) => setForm({ ...form, book_fee: e.target.value })} />
          </div>
        </div>
        {(classFee != null || transportFee != null) && (
          <div className="text-xs text-muted-foreground mt-2">
            {classFee != null && <div>Class Tuition (ref): ₹{Number(classFee || 0).toLocaleString()}</div>}
            {transportFee != null && <div>Transport (ref): ₹{Number(transportFee || 0).toLocaleString()}</div>}
          </div>
        )}
      </div>

      {/* Transport Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="font-semibold text-base">Transport</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={!!form.transport_required} onCheckedChange={(v) => setForm({ ...form, transport_required: v })} id="transport_required" />
            <Label htmlFor="transport_required">Transport Required</Label>
          </div>
          <div>
            <Label htmlFor="preferred_distance_slab_id">Distance Slab</Label>
            <DistanceSlabDropdown
              id="preferred_distance_slab_id"
              value={
                form.preferred_distance_slab_id &&
                form.preferred_distance_slab_id !== "0"
                  ? typeof form.preferred_distance_slab_id === "string"
                    ? parseInt(form.preferred_distance_slab_id, 10)
                    : form.preferred_distance_slab_id
                  : null
              }
              onChange={(value) => {
                const valueStr = value !== null ? value.toString() : "0";
                onDistanceSlabChange(valueStr);
              }}
              placeholder="Select distance slab"
              modal={modal}
            />
          </div>
          <div>
            <Label htmlFor="pickup_point">Pickup Point</Label>
            <Input id="pickup_point" value={form.pickup_point || ""} onChange={(e) => setForm({ ...form, pickup_point: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onSave}>Save Changes</Button>
      </div>
    </div>
  );
}

