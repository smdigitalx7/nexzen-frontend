import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmployeeCombobox } from "@/components/ui/employee-combobox";
import { useMemo } from "react";

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
  application_fee: string;
  application_fee_paid: boolean;
  class_name: string;
  tuition_fee: string;
  book_fee: string;
  transport_required: boolean;
  preferred_transport_id: string;
  preferred_distance_slab_id: string;
  pickup_point: string;
  transport_fee: string;
  status: string;
  referred_by: string;
  remarks: string;
  reservation_date: string; // yyyy-mm-dd
};

type RouteItem = { id: string; name: string; fee: number };
type ClassItem = { class_id: number; class_name: string };
type DistanceSlabItem = { slab_id: number; slab_name: string; min_distance: number; max_distance?: number; fee_amount: number };

export type ReservationFormProps = {
  form: ReservationFormState;
  setForm: (next: ReservationFormState) => void;
  classFee: number;
  transportFee: number;
  routes: RouteItem[];
  classes: ClassItem[];
  distanceSlabs: DistanceSlabItem[];
  onClassChange: (classId: string) => void;
  onDistanceSlabChange: (slabId: string) => void;
  onSave: (withPayment: boolean) => void;
};

export default function ReservationForm({ form, setForm, classFee, transportFee, routes, classes, distanceSlabs, onClassChange, onDistanceSlabChange, onSave }: ReservationFormProps) {
  const isSaveDisabled = useMemo(() => !form.student_name || !form.class_name, [form.student_name, form.class_name]);

  const addSibling = () => {
    const next = [...form.siblings, { name: "", class_name: "", where: "", gender: "MALE" }];
    setForm({ ...form, siblings: next });
  };

  const updateSibling = (index: number, field: "name" | "class_name" | "where" | "gender", value: string) => {
    const next = form.siblings.map((s, i) => i === index ? { ...s, [field]: value } : s);
    setForm({ ...form, siblings: next });
  };

  const removeSibling = (index: number) => {
    const next = form.siblings.filter((_, i) => i !== index);
    setForm({ ...form, siblings: next });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Student Reservation Form</CardTitle>
          <CardDescription>
            Fill in all the required details for the new student reservation
          </CardDescription>
        </CardHeader>
         <CardContent className="space-y-8">
           {/* Student Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Student Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="student_name">Student Name *</Label>
                 <Input id="student_name" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="aadhar_no">Aadhar No</Label>
                 <Input id="aadhar_no" value={form.aadhar_no} onChange={(e) => setForm({ ...form, aadhar_no: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="gender">Gender *</Label>
                 <Select value={form.gender} onValueChange={(value) => setForm({ ...form, gender: value })}>
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
                 <Input id="dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
               </div>
               <div className="md:col-span-2"></div>
             </div>
           </div>

           {/* Parent/Guardian Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="father_or_guardian_name">Father/Guardian Name</Label>
                 <Input id="father_or_guardian_name" value={form.father_or_guardian_name} onChange={(e) => setForm({ ...form, father_or_guardian_name: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="father_or_guardian_aadhar_no">Father/Guardian Aadhar No</Label>
                 <Input id="father_or_guardian_aadhar_no" value={form.father_or_guardian_aadhar_no} onChange={(e) => setForm({ ...form, father_or_guardian_aadhar_no: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="father_or_guardian_mobile">Father/Guardian Mobile</Label>
                 <Input id="father_or_guardian_mobile" value={form.father_or_guardian_mobile} onChange={(e) => setForm({ ...form, father_or_guardian_mobile: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="father_or_guardian_occupation">Father/Guardian Occupation</Label>
                 <Input id="father_or_guardian_occupation" value={form.father_or_guardian_occupation} onChange={(e) => setForm({ ...form, father_or_guardian_occupation: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="mother_or_guardian_name">Mother/Guardian Name *</Label>
                 <Input id="mother_or_guardian_name" value={form.mother_or_guardian_name} onChange={(e) => setForm({ ...form, mother_or_guardian_name: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="mother_or_guardian_aadhar_no">Mother/Guardian Aadhar No *</Label>
                 <Input id="mother_or_guardian_aadhar_no" value={form.mother_or_guardian_aadhar_no} onChange={(e) => setForm({ ...form, mother_or_guardian_aadhar_no: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="mother_or_guardian_mobile">Mother/Guardian Mobile *</Label>
                 <Input id="mother_or_guardian_mobile" value={form.mother_or_guardian_mobile} onChange={(e) => setForm({ ...form, mother_or_guardian_mobile: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="mother_or_guardian_occupation">Mother/Guardian Occupation *</Label>
                 <Input id="mother_or_guardian_occupation" value={form.mother_or_guardian_occupation} onChange={(e) => setForm({ ...form, mother_or_guardian_occupation: e.target.value })} />
               </div>
             </div>
           </div>

           {/* Siblings Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Siblings Information</h3>
             <div className="space-y-3">
               {form.siblings.length === 0 && (
                 <div className="text-sm text-slate-500">No siblings added.</div>
               )}
               <div className="space-y-2">
                 {form.siblings.map((s, idx) => (
                   <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                     <div className="md:col-span-2">
                       <Label htmlFor={`sibling-name-${idx}`}>Name</Label>
                       <Input id={`sibling-name-${idx}`} value={s.name || ""} onChange={(e) => updateSibling(idx, "name", e.target.value)} />
                     </div>
                     <div>
                       <Label htmlFor={`sibling-class-${idx}`}>Class</Label>
                       <Input id={`sibling-class-${idx}`} value={s.class_name || ""} onChange={(e) => updateSibling(idx, "class_name", e.target.value)} />
                     </div>
                     <div>
                       <Label htmlFor={`sibling-where-${idx}`}>Where</Label>
                       <Input id={`sibling-where-${idx}`} value={s.where || ""} onChange={(e) => updateSibling(idx, "where", e.target.value)} />
                     </div>
                     <div>
                       <Label htmlFor={`sibling-gender-${idx}`}>Gender</Label>
                       <Select value={s.gender || "MALE"} onValueChange={(value) => updateSibling(idx, "gender", value)}>
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
                       <Button type="button" variant="destructive" onClick={() => removeSibling(idx)}>Remove</Button>
                     </div>
                   </div>
                 ))}
               </div>
               <Button type="button" variant="outline" onClick={addSibling}>Add Sibling</Button>
             </div>
           </div>

           {/* Academic Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="previous_class">Previous Class</Label>
                 <Input id="previous_class" value={form.previous_class} onChange={(e) => setForm({ ...form, previous_class: e.target.value })} />
               </div>
               <div className="md:col-span-2">
                 <Label htmlFor="previous_school_details">Previous School Details</Label>
                 <Input id="previous_school_details" value={form.previous_school_details} onChange={(e) => setForm({ ...form, previous_school_details: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="class_name">Class Name *</Label>
                 <Select value={form.class_name} onValueChange={(value) => {
                   const selectedClass = classes.find(c => c.class_name === value);
                   if (selectedClass) {
                     setForm({ ...form, class_name: value });
                     onClassChange(selectedClass.class_id.toString());
                   }
                 }}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select class" />
                   </SelectTrigger>
                   <SelectContent>
                     {classes.map((cls) => (
                       <SelectItem key={cls.class_id} value={cls.class_name}>{cls.class_name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="tuition_fee">Tuition Fee</Label>
                 <Input 
                   id="tuition_fee" 
                   type="number" 
                   value={form.tuition_fee || ''} 
                   readOnly 
                   placeholder="Select a class to auto-populate"
                 />
               </div>
               <div>
                 <Label htmlFor="book_fee">Book Fee</Label>
                 <Input 
                   id="book_fee" 
                   type="number" 
                   value={form.book_fee || ''} 
                   readOnly 
                   placeholder="Select a class to auto-populate"
                 />
               </div>
             </div>
           </div>

           {/* Address Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
             <div className="grid grid-cols-1 gap-4">
               <div>
                 <Label htmlFor="present_address">Present Address *</Label>
                 <Textarea id="present_address" value={form.present_address} onChange={(e) => setForm({ ...form, present_address: e.target.value })} rows={3} />
               </div>
               <div>
                 <Label htmlFor="permanent_address">Permanent Address *</Label>
                 <Textarea id="permanent_address" value={form.permanent_address} onChange={(e) => setForm({ ...form, permanent_address: e.target.value })} rows={3} />
               </div>
             </div>
           </div>

           {/* Fee Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Admission Fee Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="application_fee">Application Fee</Label>
                 <Input id="application_fee" type="number" value={form.application_fee} onChange={(e) => setForm({ ...form, application_fee: e.target.value })} />
               </div>
               <div>
                 <Label htmlFor="application_fee_paid">Application Fee Paid</Label>
                 <Select value={form.application_fee_paid ? "true" : "false"} onValueChange={(value) => setForm({ ...form, application_fee_paid: value === "true" })}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="true">Yes</SelectItem>
                     <SelectItem value="false">No</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div></div>
             </div>
           </div>

           {/* Transport Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Transport Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="transport_required">Transport Required</Label>
                 <Select value={form.transport_required ? "true" : "false"} onValueChange={(value) => setForm({ ...form, transport_required: value === "true" })}>
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
                     <Label htmlFor="preferred_transport_id">Transport Route</Label>
                     <Select value={form.preferred_transport_id} onValueChange={(value) => setForm({ ...form, preferred_transport_id: value })}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select transport route" />
                       </SelectTrigger>
                       <SelectContent>
                         {routes.map((route) => (
                           <SelectItem key={route.id} value={route.id}>
                             {route.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label htmlFor="preferred_distance_slab_id">Distance Slab</Label>
                     <Select value={form.preferred_distance_slab_id} onValueChange={(value) => {
                       setForm({ ...form, preferred_distance_slab_id: value });
                       onDistanceSlabChange(value);
                     }}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select distance slab" />
                       </SelectTrigger>
                       <SelectContent>
                         {distanceSlabs.map((slab) => (
                           <SelectItem key={slab.slab_id} value={slab.slab_id.toString()}>
                             {slab.slab_name} - {slab.min_distance}km{slab.max_distance ? `-${slab.max_distance}km` : '+'} (₹{slab.fee_amount})
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label htmlFor="pickup_point">Pickup Point</Label>
                     <Input id="pickup_point" value={form.pickup_point} onChange={(e) => setForm({ ...form, pickup_point: e.target.value })} />
                   </div>
                   <div>
                     <Label htmlFor="transport_fee">Transport Fee</Label>
                     <Input id="transport_fee" type="number" value={transportFee} readOnly />
                   </div>
                   <div></div>
                 </>
               )}
             </div>
           </div>

           {/* Additional Information Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="referred_by">Referred By</Label>
                 <EmployeeCombobox
                   value={form.referred_by}
                   onValueChange={(value) => setForm({ ...form, referred_by: value })}
                   placeholder="Select referring employee..."
                 />
               </div>
               <div>
                 <Label htmlFor="reservation_date">Reservation Date</Label>
                 <Input id="reservation_date" type="date" value={form.reservation_date} onChange={(e) => setForm({ ...form, reservation_date: e.target.value })} />
               </div>
               <div></div>
               <div className="md:col-span-3">
                 <Label htmlFor="remarks">Remarks</Label>
                 <Textarea id="remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} />
               </div>
             </div>
           </div>
         </CardContent>
      </Card>

      {/* Sticky Footer for New Reservation */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onSave(false)} disabled={isSaveDisabled}>
            Save
          </Button>
          <Button onClick={() => onSave(true)} disabled={isSaveDisabled}>
            Save & Pay
          </Button>
        </div>
      </div>      
    </>
  );
}
