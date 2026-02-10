export interface CollegeClassCreate {
  class_name: string;
  class_order: number;
}

export interface CollegeClassUpdate {
  class_name: string;
  class_order: number;
}

export interface CollegeClassList {
  class_id: number;
  class_name: string;
  class_order: number;
}

export interface CollegeGroupNameList {
  group_id: number;
  group_name: string;
}

export interface CollegeClassResponse extends CollegeClassList {
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}


export interface CollegeClassWithGroups extends CollegeClassResponse {
  groups: CollegeGroupNameList[];
}


