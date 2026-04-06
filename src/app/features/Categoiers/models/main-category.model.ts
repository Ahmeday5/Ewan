// ==============================
// موديل  كاتيجوري
// ==============================
export interface PropertyGroupsResponse {
  categories: propertyGroups[];
  totalPages: number;
  totalCount: number;
}
export interface propertyGroups {
  id: number;
  name: string;
}
