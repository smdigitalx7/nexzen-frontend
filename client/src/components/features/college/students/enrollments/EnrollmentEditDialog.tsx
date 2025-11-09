import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared';
import { DatePicker } from '@/components/ui/date-picker';
import { useCollegeStudent, useUpdateCollegeStudent } from '@/lib/hooks/college';
import type { CollegeStudentUpdate } from '@/lib/types/college';

interface EnrollmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  onSuccess?: () => void;
}

export const EnrollmentEditDialog = ({
  open,
  onOpenChange,
  studentId,
  onSuccess,
}: EnrollmentEditDialogProps) => {
  // Fetch student data
  const { data: studentData, isLoading: isLoadingStudent } = useCollegeStudent(studentId);
  
  // Update mutation
  const updateMutation = useUpdateCollegeStudent(studentId || 0);

  // Form state
  const [formData, setFormData] = useState<CollegeStudentUpdate>({
    student_name: '',
    aadhar_no: null,
    gender: null,
    dob: null,
    father_name: null,
    father_aadhar_no: null,
    father_or_guardian_mobile: null,
    father_occupation: null,
    mother_name: null,
    mother_aadhar_no: null,
    mother_or_guardian_mobile: null,
    mother_occupation: null,
    present_address: null,
    permanent_address: null,
    admission_date: null,
    status: null,
  });

  // Populate form when student data loads
  useEffect(() => {
    if (studentData && open) {
      // Handle field name differences: API returns father_or_guardian_name but types use father_name
      const apiData = studentData as any;
      setFormData({
        student_name: studentData.student_name || '',
        aadhar_no: studentData.aadhar_no || null,
        gender: studentData.gender || null,
        dob: studentData.dob || null,
        father_name: apiData.father_or_guardian_name || studentData.father_name || null,
        father_aadhar_no: apiData.father_or_guardian_aadhar_no || studentData.father_aadhar_no || null,
        father_or_guardian_mobile: studentData.father_or_guardian_mobile || null,
        father_occupation: studentData.father_occupation || null,
        mother_name: apiData.mother_or_guardian_name || studentData.mother_name || null,
        mother_aadhar_no: apiData.mother_or_guardian_aadhar_no || studentData.mother_aadhar_no || null,
        mother_or_guardian_mobile: studentData.mother_or_guardian_mobile || null,
        mother_occupation: studentData.mother_occupation || null,
        present_address: studentData.present_address || null,
        permanent_address: studentData.permanent_address || null,
        admission_date: studentData.admission_date || null,
        status: studentData.status || null,
      });
    }
  }, [studentData, open]);

  const handleSave = async () => {
    if (!studentId) return;
    
    try {
      // Map form data to API format - backend expects father_or_guardian_name but TypeScript types use father_name
      // We need to send the data with the correct field names that match the backend schema
      const updatePayload: any = {
        student_name: formData.student_name || undefined,
        aadhar_no: formData.aadhar_no || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        father_or_guardian_name: formData.father_name || undefined, // Map father_name to father_or_guardian_name
        father_or_guardian_aadhar_no: formData.father_aadhar_no || undefined,
        father_or_guardian_mobile: formData.father_or_guardian_mobile || undefined,
        father_or_guardian_occupation: formData.father_occupation || undefined,
        mother_or_guardian_name: formData.mother_name || undefined, // Map mother_name to mother_or_guardian_name
        mother_or_guardian_aadhar_no: formData.mother_aadhar_no || undefined,
        mother_or_guardian_mobile: formData.mother_or_guardian_mobile || undefined,
        mother_or_guardian_occupation: formData.mother_occupation || undefined,
        present_address: formData.present_address || undefined,
        permanent_address: formData.permanent_address || undefined,
        admission_date: formData.admission_date || undefined,
        status: formData.status || undefined,
      };
      
      // Remove undefined values
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key];
        }
      });
      
      await updateMutation.mutateAsync(updatePayload as CollegeStudentUpdate);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const isLoading = isLoadingStudent || updateMutation.isPending;
  const isDisabled = !formData.student_name?.trim();

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Student Information"
      size="LARGE"
      isLoading={isLoading}
      onSave={handleSave}
      onCancel={() => onOpenChange(false)}
      saveText="Update"
      cancelText="Cancel"
      disabled={isDisabled}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Student Name"
              value={formData.student_name || ''}
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
              placeholder="Enter student name"
              required
            />
            <Input
              label="Aadhar No"
              value={formData.aadhar_no || ''}
              onChange={(e) => setFormData({ ...formData, aadhar_no: e.target.value || null })}
              placeholder="Enter Aadhar number"
              maxLength={12}
            />
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => setFormData({ ...formData, gender: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <DatePicker
                value={formData.dob || ''}
                onChange={(value) => setFormData({ ...formData, dob: value || null })}
                placeholder="Select date of birth"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => setFormData({ ...formData, status: value as any || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Father/Guardian Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Father/Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Father/Guardian Name"
              value={formData.father_name || ''}
              onChange={(e) => setFormData({ ...formData, father_name: e.target.value || null })}
              placeholder="Enter father/guardian name"
            />
            <Input
              label="Father Aadhar No"
              value={formData.father_aadhar_no || ''}
              onChange={(e) => setFormData({ ...formData, father_aadhar_no: e.target.value || null })}
              placeholder="Enter father Aadhar number"
              maxLength={12}
            />
            <Input
              label="Father Mobile"
              value={formData.father_or_guardian_mobile || ''}
              onChange={(e) => setFormData({ ...formData, father_or_guardian_mobile: e.target.value || null })}
              placeholder="Enter father mobile number"
            />
            <Input
              label="Father Occupation"
              value={formData.father_occupation || ''}
              onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value || null })}
              placeholder="Enter father occupation"
            />
          </div>
        </div>

        {/* Mother/Guardian Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Mother/Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mother/Guardian Name"
              value={formData.mother_name || ''}
              onChange={(e) => setFormData({ ...formData, mother_name: e.target.value || null })}
              placeholder="Enter mother/guardian name"
            />
            <Input
              label="Mother Aadhar No"
              value={formData.mother_aadhar_no || ''}
              onChange={(e) => setFormData({ ...formData, mother_aadhar_no: e.target.value || null })}
              placeholder="Enter mother Aadhar number"
              maxLength={12}
            />
            <Input
              label="Mother Mobile"
              value={formData.mother_or_guardian_mobile || ''}
              onChange={(e) => setFormData({ ...formData, mother_or_guardian_mobile: e.target.value || null })}
              placeholder="Enter mother mobile number"
            />
            <Input
              label="Mother Occupation"
              value={formData.mother_occupation || ''}
              onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value || null })}
              placeholder="Enter mother occupation"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="present_address">Present Address</Label>
              <Textarea
                id="present_address"
                value={formData.present_address || ''}
                onChange={(e) => setFormData({ ...formData, present_address: e.target.value || null })}
                placeholder="Enter present address"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="permanent_address">Permanent Address</Label>
              <Textarea
                id="permanent_address"
                value={formData.permanent_address || ''}
                onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value || null })}
                placeholder="Enter permanent address"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </FormDialog>
  );
};

