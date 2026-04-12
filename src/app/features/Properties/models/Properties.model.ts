// ==============================
// موديل  properties
// ==============================
export interface properties {
  id: number;
  name: string;
  description: string;
  ownerPhoneNumber: string;
  propertyType: string;
  bookingMode: number;
  isAvailable: boolean;
  address: string;
  location: string;
  pricePerNight: number;
  pricePerHour: number;
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

export interface OwnerCredentials {
  ownerPhoneNumber: string;
  ownerPassword: string;
}

export interface UpdateOwnerCredentialsRequest {
  ownerPhoneNumber: string;
  newPassword: string;
}
