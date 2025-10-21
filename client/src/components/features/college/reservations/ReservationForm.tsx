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
import { useMemo } from "react";

type ReservationFormState = {
  studentName: string;
  studentAadhar: string;
  fatherName: string;
  fatherAadhar: string;
  motherName: string;
  motherAadhar: string;
  fatherOccupation: string;
  motherOccupation: string;
  gender: string;
  dob: string;
  previousSchool: string;
  village: string;
  lastClass: string;
  presentAddress: string;
  permanentAddress: string;
  fatherMobile: string;
  motherMobile: string;
  classAdmission: string;
  group: string;
  course: string;
  transport: string;
  busRoute: string;
  applicationFee: string;
  reservationFee: string;
  remarks: string;
  // Advanced/new fields
  preferredClassId: string;
  preferredDistanceSlabId: string;
  bookFee: string;
  tuitionConcession: string;
  transportConcession: string;
  referredBy: string;
  reservationDate: string; // yyyy-mm-dd
  siblingsJson: string; // JSON string
};

type RouteItem = { id: string; name: string; fee: number };

export type ReservationFormProps = {
  form: ReservationFormState;
  setForm: (next: ReservationFormState) => void;
  classFee: number;
  transportFee: number;
  routes: RouteItem[];
  classFeeMapKeys: string[];
  onSave: (withPayment: boolean) => void;
};

export default function ReservationForm({
  form,
  setForm,
  classFee,
  transportFee,
  routes,
  classFeeMapKeys,
  onSave,
}: ReservationFormProps) {
  const isSaveDisabled = useMemo(
    () => !form.studentName || !form.classAdmission,
    [form.studentName, form.classAdmission]
  );

  const parsedSiblings = useMemo(() => {
    try {
      const v = JSON.parse(form.siblingsJson || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }, [form.siblingsJson]);

  const syncSiblings = (
    siblings: Array<{ name: string; age: number; relation: string }>
  ) => {
    setForm({ ...form, siblingsJson: JSON.stringify(siblings) });
  };

  const addSibling = () => {
    const next = [...parsedSiblings, { name: "", age: 0, relation: "" }];
    syncSiblings(next);
  };

  const updateSibling = (
    index: number,
    field: "name" | "age" | "relation",
    value: string
  ) => {
    const next = parsedSiblings.map((s: any, i: number) =>
      i === index
        ? { ...s, [field]: field === "age" ? Number(value || 0) : value }
        : s
    );
    syncSiblings(next);
  };

  const removeSibling = (index: number) => {
    const next = parsedSiblings.filter((_: any, i: number) => i !== index);
    syncSiblings(next);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">Student Reservation Form</h2>
            <p className="text-muted-foreground">
              Fill in all the required details for the new student reservation
            </p>
          </div>
        </div>
        <div className="space-y-8">
          {/* Exact Payload Order */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reservation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 2-4. student_name, aadhar_no, gender */}
              <div>
                <Label htmlFor="student_name">Student Name</Label>
                <Input
                  id="student_name"
                  value={form.studentName}
                  onChange={(e) =>
                    setForm({ ...form, studentName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="aadhar_no">Aadhar No</Label>
                <Input
                  id="aadhar_no"
                  value={form.studentAadhar}
                  onChange={(e) =>
                    setForm({ ...form, studentAadhar: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
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

              {/* 5. dob */}
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div className="md:col-span-2"></div>

              {/* 6-9 father_* */}
              <div>
                <Label htmlFor="father_name">Father/Guardian Name</Label>
                <Input
                  id="father_name"
                  value={form.fatherName}
                  onChange={(e) =>
                    setForm({ ...form, fatherName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="father_aadhar_no">
                  Father/Guardian Aadhar No
                </Label>
                <Input
                  id="father_aadhar_no"
                  value={form.fatherAadhar}
                  onChange={(e) =>
                    setForm({ ...form, fatherAadhar: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="father_mobile">Father/Guardian Mobile</Label>
                <Input
                  id="father_mobile"
                  value={form.fatherMobile}
                  onChange={(e) =>
                    setForm({ ...form, fatherMobile: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="father_occupation">
                  Father/Guardian Occupation
                </Label>
                <Input
                  id="father_occupation"
                  value={form.fatherOccupation}
                  onChange={(e) =>
                    setForm({ ...form, fatherOccupation: e.target.value })
                  }
                />
              </div>

              {/* 10-13 mother_* */}
              <div>
                <Label htmlFor="mother_name">Mother/Guardian Name</Label>
                <Input
                  id="mother_name"
                  value={form.motherName}
                  onChange={(e) =>
                    setForm({ ...form, motherName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_aadhar_no">
                  Mother/Guardian Aadhar No
                </Label>
                <Input
                  id="mother_aadhar_no"
                  value={form.motherAadhar}
                  onChange={(e) =>
                    setForm({ ...form, motherAadhar: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_mobile">Mother/Guardian Mobile</Label>
                <Input
                  id="mother_mobile"
                  value={form.motherMobile}
                  onChange={(e) =>
                    setForm({ ...form, motherMobile: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mother_occupation">
                  Mother/Guardian Occupation
                </Label>
                <Input
                  id="mother_occupation"
                  value={form.motherOccupation}
                  onChange={(e) =>
                    setForm({ ...form, motherOccupation: e.target.value })
                  }
                />
              </div>

              {/* 14 siblings (user-friendly) */}
              <div className="md:col-span-3 space-y-3">
                <Label>Siblings</Label>
                {parsedSiblings.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No siblings added.
                  </div>
                )}
                <div className="space-y-2">
                  {parsedSiblings.map((s: any, idx: number) => (
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
                        <Label htmlFor={`sibling-age-${idx}`}>Age</Label>
                        <Input
                          id={`sibling-age-${idx}`}
                          type="number"
                          value={Number.isFinite(s.age) ? s.age : 0}
                          onChange={(e) =>
                            updateSibling(idx, "age", e.target.value)
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`sibling-relation-${idx}`}>
                          Relation
                        </Label>
                        <Input
                          id={`sibling-relation-${idx}`}
                          value={s.relation || ""}
                          onChange={(e) =>
                            updateSibling(idx, "relation", e.target.value)
                          }
                        />
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
                {/* Keep hidden textarea to preserve exact payload order and keys if needed elsewhere */}
                <Textarea
                  id="siblingsJson"
                  value={form.siblingsJson}
                  onChange={(e) =>
                    setForm({ ...form, siblingsJson: e.target.value })
                  }
                  className="hidden"
                />
              </div>

              {/* 15-16 previous_* */}
              <div>
                <Label htmlFor="previous_class">Previous Class</Label>
                <Input
                  id="previous_class"
                  value={form.lastClass}
                  onChange={(e) =>
                    setForm({ ...form, lastClass: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="previous_school_details">
                  Previous School Details
                </Label>
                <Input
                  id="previous_school_details"
                  value={form.previousSchool}
                  onChange={(e) =>
                    setForm({ ...form, previousSchool: e.target.value })
                  }
                />
              </div>

              {/* 17-18 addresses */}
              <div className="md:col-span-3">
                <Label htmlFor="present_address">Present Address</Label>
                <Textarea
                  id="present_address"
                  value={form.presentAddress}
                  onChange={(e) =>
                    setForm({ ...form, presentAddress: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="permanent_address">Permanent Address</Label>
                <Textarea
                  id="permanent_address"
                  value={form.permanentAddress}
                  onChange={(e) =>
                    setForm({ ...form, permanentAddress: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* 19-20 admit_into, admission_group */}
              <div>
                <Label htmlFor="admit_into">Admit Into</Label>
                <Select
                  value={form.classAdmission}
                  onValueChange={(value) =>
                    setForm({ ...form, classAdmission: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classFeeMapKeys.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admission_group">Admission Group</Label>
                <Select
                  value={form.group}
                  onValueChange={(value) => setForm({ ...form, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MPC">MPC</SelectItem>
                    <SelectItem value="BiPC">BiPC</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 21 reservation_fee */}
              <div>
                <Label htmlFor="reservation_fee">Reservation Fee</Label>
                <Input
                  id="reservation_fee"
                  type="number"
                  value={form.reservationFee}
                  onChange={(e) =>
                    setForm({ ...form, reservationFee: e.target.value })
                  }
                />
              </div>

              {/* 22-25 preferred_class_id, tuition_fee, book_fee, tuition_concession */}
              <div>
                <Label htmlFor="preferred_class_id">Preferred Class ID</Label>
                <Input
                  id="preferred_class_id"
                  value={form.preferredClassId}
                  onChange={(e) =>
                    setForm({ ...form, preferredClassId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tuition_fee">Tuition Fee</Label>
                <Input
                  id="tuition_fee"
                  type="number"
                  value={classFee}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="book_fee">Book Fee</Label>
                <Input
                  id="book_fee"
                  type="number"
                  value={form.bookFee}
                  onChange={(e) =>
                    setForm({ ...form, bookFee: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tuition_concession">Tuition Concession</Label>
                <Input
                  id="tuition_concession"
                  type="number"
                  value={form.tuitionConcession}
                  onChange={(e) =>
                    setForm({ ...form, tuitionConcession: e.target.value })
                  }
                />
              </div>

              {/* 26-29 transport fields */}
              <div>
                <Label htmlFor="preferred_transport_id">Transport</Label>
                <Select
                  value={form.transport}
                  onValueChange={(value) =>
                    setForm({ ...form, transport: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.transport === "Yes" && (
                <>
                  <div>
                    <Label htmlFor="busRoute">
                      Preferred Transport (Route)
                    </Label>
                    <Select
                      value={form.busRoute}
                      onValueChange={(value) =>
                        setForm({ ...form, busRoute: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bus route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} - ₹{route.fee.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <div>
                    <Label htmlFor="transport_concession">
                      Transport Concession
                    </Label>
                    <Input
                      id="transport_concession"
                      type="number"
                      value={form.transportConcession}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          transportConcession: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {/* 30 preferred_distance_slab_id */}
              <div>
                <Label htmlFor="preferred_distance_slab_id">
                  Preferred Distance Slab ID
                </Label>
                <Input
                  id="preferred_distance_slab_id"
                  value={form.preferredDistanceSlabId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferredDistanceSlabId: e.target.value,
                    })
                  }
                />
              </div>

              {/* 31 status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Input id="status" value={"PENDING"} readOnly />
              </div>

              {/* 32 referred_by */}
              <div>
                <Label htmlFor="referred_by">Referred By (User ID)</Label>
                <Input
                  id="referred_by"
                  value={form.referredBy}
                  onChange={(e) =>
                    setForm({ ...form, referredBy: e.target.value })
                  }
                />
              </div>

              {/* 33 reservation_date */}
              <div>
                <Label htmlFor="reservation_date">Reservation Date</Label>
                <Input
                  id="reservation_date"
                  type="date"
                  value={form.reservationDate}
                  onChange={(e) =>
                    setForm({ ...form, reservationDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer for New Reservation */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => onSave(false)}
            disabled={isSaveDisabled}
          >
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
