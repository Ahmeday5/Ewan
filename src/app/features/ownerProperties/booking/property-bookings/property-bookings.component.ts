import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyBookingsService } from '../Service/property-bookings.service';
import { OwnerBooking } from '../model/property-bookings.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusPipe } from '../../../../shared/pipes/status.pipe';

@Component({
  selector: 'app-property-bookings',
  standalone: true,
  imports: [CommonModule, PaginationComponent, StatusPipe],
  templateUrl: './property-bookings.component.html',
  styleUrl: './property-bookings.component.scss',
})
export class PropertyBookingsComponent implements OnInit, AfterViewInit {
  bookings: OwnerBooking[] = [];
  selectedBooking: OwnerBooking | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  pageIndex = 1;
  pageSize = 9;
  totalPages = 1;
  totalCount = 0;

  private modalInstance!: { show: () => void; hide: () => void };

  constructor(private bookingsService: PropertyBookingsService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngAfterViewInit(): void {
    const el = document.getElementById('bookingDetailModal');
    if (el) {
      this.modalInstance = new (window as any).bootstrap.Modal(el);
    }
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.bookingsService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.bookings = res.items;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadBookings();
  }

  openDetails(booking: OwnerBooking): void {
    this.selectedBooking = booking;
    setTimeout(() => this.modalInstance?.show());
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return date.split('T')[0];
  }

  formatTime(date: string): string {
    if (!date) return '';
    const t = date.split('T')[1];
    return t ? t.substring(0, 5) : '';
  }

  get firstBookingPropertyName(): string {
    return this.bookings[0]?.propertyName ?? '';
  }

  trackByBookingId(_: number, b: OwnerBooking): number {
    return b.id;
  }
}
