// ==============================
// موديل  facilities
// ==============================
export interface facilitiesGroups {
  id: number;
  name: string;
}

export interface facilitiesGroupsResponse {
  facilities: facilitiesGroups[];
  totalPages: number;
  totalCount: number;
}
