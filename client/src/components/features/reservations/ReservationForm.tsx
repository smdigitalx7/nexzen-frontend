import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function ReservationForm({ form, setForm, classFee, transportFee, routes, classFeeMapKeys, onSave }: ReservationFormProps) {
  const isSaveDisabled = useMemo(() => !form.studentName || !form.classAdmission, [form.studentName, form.classAdmission]);

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
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input id="studentName" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Enter student name" />
              </div>
              <div>
                <Label htmlFor="studentAadhar">Student Aadhar No</Label>
                <Input id="studentAadhar" value={form.studentAadhar} onChange={(e) => setForm({ ...form, studentAadhar: e.target.value })} placeholder="Enter Aadhar number" />
              </div>
              <div>
                <Label htmlFor="fatherName">Father/Guardian Name</Label>
                <Input id="fatherName" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Enter father/guardian name" />
              </div>
              <div>
                <Label htmlFor="fatherAadhar">Father/Guardian Aadhar No</Label>
                <Input id="fatherAadhar" value={form.fatherAadhar} onChange={(e) => setForm({ ...form, fatherAadhar: e.target.value })} placeholder="Enter father/guardian Aadhar" />
              </div>
              <div>
                <Label htmlFor="motherName">Mother/Guardian Name</Label>
                <Input id="motherName" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} placeholder="Enter mother/guardian name" />
              </div>
              <div>
                <Label htmlFor="motherAadhar">Mother/Guardian Aadhar No</Label>
                <Input id="motherAadhar" value={form.motherAadhar} onChange={(e) => setForm({ ...form, motherAadhar: e.target.value })} placeholder="Enter mother/guardian Aadhar" />
              </div>
              <div>
                <Label htmlFor="fatherOccupation">Father/Guardian Occupation</Label>
                <Input id="fatherOccupation" value={form.fatherOccupation} onChange={(e) => setForm({ ...form, fatherOccupation: e.target.value })} placeholder="Enter occupation" />
              </div>
              <div>
                <Label htmlFor="motherOccupation">Mother/Guardian Occupation</Label>
                <Input id="motherOccupation" value={form.motherOccupation} onChange={(e) => setForm({ ...form, motherOccupation: e.target.value })} placeholder="Enter occupation" />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender} onValueChange={(value) => setForm({ ...form, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Previous School Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Previous School Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="previousSchool">Name of the School</Label>
                <Input id="previousSchool" value={form.previousSchool} onChange={(e) => setForm({ ...form, previousSchool: e.target.value })} placeholder="Enter school name" />
              </div>
              <div>
                <Label htmlFor="village">Village</Label>
                <Input id="village" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="Enter village" />
              </div>
              <div>
                <Label htmlFor="lastClass">Class Studied</Label>
                <Input id="lastClass" value={form.lastClass} onChange={(e) => setForm({ ...form, lastClass: e.target.value })} placeholder="Enter last class" />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="presentAddress">Present Address</Label>
                <Textarea id="presentAddress" value={form.presentAddress} onChange={(e) => setForm({ ...form, presentAddress: e.target.value })} placeholder="Enter present address" rows={3} />
              </div>
              <div>
                <Label htmlFor="permanentAddress">Permanent Address</Label>
                <Textarea id="permanentAddress" value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} placeholder="Enter permanent address" rows={3} />
              </div>
              <div>
                <Label htmlFor="fatherMobile">Father/Guardian Mobile No</Label>
                <Input id="fatherMobile" value={form.fatherMobile} onChange={(e) => setForm({ ...form, fatherMobile: e.target.value })} placeholder="Enter mobile number" />
              </div>
              <div>
                <Label htmlFor="motherMobile">Mother/Guardian Mobile No</Label>
                <Input id="motherMobile" value={form.motherMobile} onChange={(e) => setForm({ ...form, motherMobile: e.target.value })} placeholder="Enter mobile number" />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="classAdmission">Class Admission</Label>
                <Select value={form.classAdmission} onValueChange={(value) => setForm({ ...form, classAdmission: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classFeeMapKeys.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group">Group</Label>
                <Select value={form.group} onValueChange={(value) => setForm({ ...form, group: value })}>
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
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={form.course} onValueChange={(value) => setForm({ ...form, course: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IPE">IPE</SelectItem>
                    <SelectItem value="Mains">Mains</SelectItem>
                    <SelectItem value="EAPCET">EAPCET</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Fee Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fee Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Class Fee (Based on selected class)</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-lg font-semibold">₹{classFee.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="transport">Transport</Label>
                <Select value={form.transport} onValueChange={(value) => setForm({ ...form, transport: value })}>
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
                <div className="md:col-span-2">
                  <Label htmlFor="busRoute">Bus Route</Label>
                  <Select value={form.busRoute} onValueChange={(value) => setForm({ ...form, busRoute: value })}>
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
              )}
              {form.transport === "Yes" && (
                <div>
                  <Label>Transport Fee</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-lg font-semibold">₹{transportFee.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applicationFee">Application Fee</Label>
                <Input id="applicationFee" type="number" value={form.applicationFee} onChange={(e) => setForm({ ...form, applicationFee: e.target.value })} placeholder="Enter application fee" />
              </div>
              <div>
                <Label htmlFor="reservationFee">Reservation Fee</Label>
                <Input id="reservationFee" type="number" value={form.reservationFee} onChange={(e) => setForm({ ...form, reservationFee: e.target.value })} placeholder="Enter reservation fee" />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Remarks</h3>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Enter any additional remarks" rows={3} />
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


