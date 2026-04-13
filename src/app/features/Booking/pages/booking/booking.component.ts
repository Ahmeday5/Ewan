import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusPipe } from '../../../../shared/pipes/status.pipe';
import { ToastService } from '../../../../core/services/toast.service';
import { BookingService } from '../../services/booking.service';
import { PropertiesService } from '../../../Properties/services/Properties.service';

import {
  BookingDetails,
  BookingFilters,
  Bookings,
  PropertyOption,
  StatusTotals,
} from '../../models/booking.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent, StatusPipe],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit, AfterViewInit, OnDestroy {
  // ─── Data ────────────────────────────────────────────────
  bookings: Bookings[] = [];
  bookingDetails: BookingDetails | null = null;
  properties: PropertyOption[] = [];

  // ─── Stats ───────────────────────────────────────────────
  totalCount   = 0;
  totalRevenue = 0;
  statusTotals: StatusTotals = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

  // ─── Pagination ──────────────────────────────────────────
  pageIndex  = 1;
  pageSize   = 10;
  totalPages = 1;

  // ─── Filters ─────────────────────────────────────────────
  searchTerm         = '';
  selectedStatus     = '';
  selectedPayment    = '';
  selectedPropertyId: number | null = null;
  fromDate           = '';
  toDate             = '';

  // ─── State ───────────────────────────────────────────────
  hasLoaded      = false;
  filtersVisible = false;

  private modalInstance!: { show: () => void; hide: () => void };
  private searchSubject = new Subject<void>();
  private destroy$      = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private propertiesService: PropertiesService,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  // ─── Lifecycle ───────────────────────────────────────────

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 1;
        this.loadBookings();
      });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('bookingId');
      if (id) {
        this.openModal(+id);
      } else {
        this.loadBookings();
        this.loadProperties();
      }
    });
  }

  ngAfterViewInit(): void {
    const modal = document.getElementById('BookingModal');
    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Load ────────────────────────────────────────────────

  loadBookings(): void {
    this.hasLoaded = false;
    const filters: BookingFilters = {
      search:        this.searchTerm    || undefined,
      status:        this.selectedStatus || undefined,
      paymentStatus: this.selectedPayment || undefined,
      propertyId:    this.selectedPropertyId ?? undefined,
      fromDate:      this.fromDate || undefined,
      toDate:        this.toDate   || undefined,
    };

    this.bookingService.getAll(this.pageIndex, this.pageSize, filters).subscribe({
      next: (res) => {
        this.bookings     = res.items;
        this.totalPages   = res.totalPages;
        this.totalCount   = res.totalCount;
        this.totalRevenue = res.totalRevenue;
        this.statusTotals = res.statusTotals;
        this.hasLoaded    = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  loadProperties(): void {
    this.propertiesService.getAll(1, 200).subscribe({
      next: (res) => {
        this.properties = res.properties.map((p: any) => ({ id: p.id, name: p.name }));
      },
      error: () => { /* silent */ },
    });
  }

  // ─── Filter Events ───────────────────────────────────────

  onSearchChange():   void { this.searchSubject.next(); }
  onFilterChange():   void { this.pageIndex = 1; this.loadBookings(); }
  onPageChange(p: number): void { this.pageIndex = p; this.loadBookings(); }

  resetFilters(): void {
    this.searchTerm         = '';
    this.selectedStatus     = '';
    this.selectedPayment    = '';
    this.selectedPropertyId = null;
    this.fromDate           = '';
    this.toDate             = '';
    this.pageIndex          = 1;
    this.loadBookings();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm || this.selectedStatus || this.selectedPayment ||
      this.selectedPropertyId || this.fromDate || this.toDate
    );
  }

  // ─── Modal ───────────────────────────────────────────────

  openModal(id: number): void {
    this.bookingDetails = null;
    this.bookingService.getById(id).subscribe({
      next: (res) => {
        this.bookingDetails = res;
        setTimeout(() => this.modalInstance?.show());
      },
      error: (err) => this.toast.error(err.message),
    });
  }

  // ─── Helpers ─────────────────────────────────────────────

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('ar-EG') + ' ج';
  }
}
