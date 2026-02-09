/**
 * Shared types and initial state for College Reservation Management.
 * Extracted for maintainability; no behavior change.
 */

export type CollegeReservationFormState = {
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
  courseName: string;
  transport: string;
  busRoute: string;
  pickupPoint: string;
  applicationFee: string;
  reservationFee: string;
  preferredClassId: string;
  preferredGroupId: string;
  bookFee: string;
  tuitionConcession: string;
  transportConcession: string;
  bookFeeRequired: boolean;
  courseRequired: boolean;
  requestType: string;
  referredBy: string;
  referredByName: string;
  reservationDate: string;
  siblingsJson: string;
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  remarks: string;
};

export const initialFormState: CollegeReservationFormState = {
  studentName: "",
  studentAadhar: "",
  fatherName: "",
  fatherAadhar: "",
  motherName: "",
  motherAadhar: "",
  fatherOccupation: "",
  motherOccupation: "",
  gender: "",
  dob: "",
  previousSchool: "",
  village: "",
  lastClass: "",
  presentAddress: "",
  permanentAddress: "",
  fatherMobile: "",
  motherMobile: "",
  classAdmission: "",
  group: "N/A",
  course: "N/A",
  courseName: "N/A",
  transport: "No",
  busRoute: "",
  pickupPoint: "",
  applicationFee: "",
  reservationFee: "",
  preferredClassId: "0",
  preferredGroupId: "0",
  bookFee: "0",
  tuitionConcession: "0",
  transportConcession: "0",
  bookFeeRequired: false,
  courseRequired: true,
  requestType: "WALK_IN",
  referredBy: "",
  referredByName: "",
  reservationDate: "",
  siblingsJson: "",
  siblings: [],
  remarks: "",
};
