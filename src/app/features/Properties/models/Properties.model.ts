// ==============================
// موديل  properties
// ==============================
export interface properties {
  id: number;
  name: string;
  description: string;
  ownerPhoneNumber: string;
  groupId: number;
  groupName: string;
  isAvailable: boolean;
  address: string;
  location: string;
  pricePerNight: number;
  roomCount: number;
  guestCount: number;
  imageUrls: string[];
  facilities: string[];
}

export interface propertiesResponse {
  properties: properties[];
  totalPages: number;
  totalCount: number;
}
