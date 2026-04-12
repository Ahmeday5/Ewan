// ==============================
// Booking Stats
// ==============================
export interface kpisStats {
  totalProperties: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
}

// ==============================
// Dashboard Charts
// ==============================
export interface ChartTrendItem {
  month: string;
  value: number;
}

export interface ChartCategoryItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardCharts {
  revenueTrend: ChartTrendItem[];
  bookingsTrend: ChartTrendItem[];
  bookingsByCategory: ChartCategoryItem[];
  bookingsByCity: ChartCategoryItem[];
}

// ==============================
// Dashboard Overview Lists
// ==============================
export interface TopBookedProperty {
  propertyId: number;
  propertyName: string;
  bookingsCount: number;
  revenue: number;
}

export interface RecentBooking {
  bookingId: number;
  clientName: string;
  propertyName: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

export const enum BookingStatus {
  Confirmed = 'Confirmed',
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface DashboardOverviewLists {
  topBookedProperties: TopBookedProperty[];
  recentBookings: RecentBooking[];
}
