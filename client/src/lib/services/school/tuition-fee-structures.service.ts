import { Api } from "@/lib/api";
import type { SchoolTuitionFeeStructureCreate, SchoolTuitionFeeStructureRead, SchoolTuitionFeeStructureUpdate } from "@/lib/types/school";

export const SchoolTuitionFeeStructuresService = {
  list() {
    return Api.get<SchoolTuitionFeeStructureRead[]>(`/school/tuition-fee-structures`);
  },

  getById(id: number) {
    return Api.get<SchoolTuitionFeeStructureRead>(`/school/tuition-fee-structures/${id}`);
  },

  getByClass(class_id: number) {
    return Api.get<SchoolTuitionFeeStructureRead>(`/school/tuition-fee-structures/class/${class_id}`);
  },

  create(payload: SchoolTuitionFeeStructureCreate) {
    return Api.post<SchoolTuitionFeeStructureRead>(`/school/tuition-fee-structures`, payload);
  },

  update(id: number, payload: SchoolTuitionFeeStructureUpdate) {
    return Api.put<SchoolTuitionFeeStructureRead>(`/school/tuition-fee-structures/${id}`, payload);
  },
};


