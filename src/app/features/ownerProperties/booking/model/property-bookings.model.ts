// ==============================
// Single Booking (owner view)
// ==============================
export interface OwnerBooking {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  propertyId: number;
  propertyName: string;
  propertyAddress: string;
  propertyLocation: string;
  propertyRoomCount: number;
  propertyGuestCount: number;
  propertyImageUrls: string[];
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  roomsCount: number;
  guestsCount: number;
  pricePerNight: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

// ==============================
// Paginated response wrapper
// ==============================
export interface OwnerBookingsPagination {
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
  data: OwnerBooking[];
}

export interface OwnerBookingsApiResponse {
  statusCode: number;
  message: string;
  data: OwnerBookingsPagination;
}

// ==============================
// Mapped response used in the component
// ==============================
export interface OwnerBookingsResponse {
  items: OwnerBooking[];
  totalPages: number;
  totalCount: number;
}
