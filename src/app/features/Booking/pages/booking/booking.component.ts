import { AfterViewInit, Component, OnInit } from '@angular/core';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  BookingDetails,
  Bookings,
  BookingStats,
} from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';
import { FormBuilder } from '@angular/forms';
import { StatusPipe } from "../../../../shared/pipes/status.pipe";

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, StatusPipe],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit, AfterViewInit {
  Bookings: Bookings[] = [];
  bookingDetails: BookingDetails | null = null;
  bookingStats: BookingStats | null = null;
  errorMessage: string | null = null;
  hasLoaded = false;
  bookingId!: number;
  // modal
  modalInstance!: {
    show: () => void;
    hide: () => void;
  };
  // ====================== pagination ======================
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private apiService: BookingService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = +id;
        this.apiService.getById(this.bookingId).subscribe({
          next: (prop) => {
            this.hasLoaded = true;
          },
          error: (err) => {
            this.errorMessage = err.message;
            this.hasLoaded = true;
          },
        });
      } else {
        this.loadAllBooking();
      }
    });
    this.loadBookingStats();
  }

  ngAfterViewInit() {
    const modal = document.getElementById('BookingModal');

    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  // ======================
  // LOAD AllBooking
  // ======================

  loadAllBooking(): void {
    this.hasLoaded = false;

    this.apiService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.Bookings = res.items;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.hasLoaded = true;
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadAllBooking();
  }

  // ======================
  // LOAD BY id
  // ======================

  loadById(id: number): void {
    this.apiService.getById(id).subscribe({
      next: (res) => {
        this.bookingDetails = res;
        setTimeout(() => this.modalInstance.show());
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

  openModal(id: number) {
    this.loadById(id); // سيقوم الآن بتحديث الفورم وفتح المودال
  }

  // ======================
  // LOAD BY id
  // ======================

  loadBookingStats(): void {
    this.apiService.getBookingStats().subscribe({
      next: (res) => {
        this.bookingStats = res;
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }
}
