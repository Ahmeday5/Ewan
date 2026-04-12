// ==============================
// Booking الأساسي (List View)
// ==============================
export interface Bookings {
  id: number;
  clientName: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  roomsCount: number;
  guestsCount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

// ==============================
// تفاصيل الحجز (Details View)
// ==============================
export interface BookingDetails extends Bookings {
  clientId: number;
  clientEmail: string;
  clientPhoneNumber: string;
  propertyId: number;
  propertyAddress: string;
  propertyLocation: string;
  propertyRoomCount: number;
  propertyGuestCount: number;
  propertyImageUrls: string[];
  pricePerNight: number;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

// ==============================
// Pagination (Reusable)
// ==============================
export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
  data: T[];
}

// ==============================
// Status Totals (من API)
// ==============================
export interface StatusTotals {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

// ==============================
// Get All Response (API)
// ==============================
export interface GetAllBookingsResponse {
  bookings: Pagination<Bookings>;
  totalBookings: number;
  totalRevenue: number;
  statusTotals: StatusTotals;
}

// ==============================
// Response بعد الـ map (للاستخدام في UI)
// ==============================
export interface BookingsResponse {
  items: Bookings[];
  totalPages: number;
  totalCount: number;
}

// ==============================
// Booking Stats
// ==============================
export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
