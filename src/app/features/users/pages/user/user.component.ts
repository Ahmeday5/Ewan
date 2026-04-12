import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  selectedUser: User | null = null;

  isLoading = false;
  togglingId: number | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  totalPages = 1; 

  private detailsModal!: { show: () => void; hide: () => void };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    const el = document.getElementById('DetailsModal');
    if (el) {
      this.detailsModal = new (window as any).bootstrap.Modal(el);
    }
  }

  // ======================
  // LOAD USERS
  // ======================

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.User;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: (err) => {
        this.showError(err.message);
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadUsers();
  }

  // ======================
  // COMPUTED STATS
  // ======================

  get activeCount(): number {
    return this.users.filter((u) => u.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter((u) => !u.isActive).length;
  }

  get totalBookings(): number {
    return this.users.reduce((sum, u) => sum + u.bookingsCount, 0);
  }

  // ======================
  // DETAILS MODAL
  // ======================

  openDetails(user: User): void {
    this.selectedUser = user;
    setTimeout(() => this.detailsModal?.show());
  }

  // ======================
  // TOGGLE ACTIVATION
  // ======================

  toggleActivation(user: User): void {
    if (!confirm('هل انت متاكد من تغيير حالة المستخدم')) return;

    this.togglingId = user.id;
    const newStatus = !user.isActive;

    this.userService
      .activationClient(user.id, { isActive: newStatus })
      .subscribe({
        next: () => {
          user.isActive = newStatus;
          // تحديث المودال لو مفتوح على نفس اليوزر
          if (this.selectedUser?.id === user.id) {
            this.selectedUser = { ...user };
          }
          this.togglingId = null;
          this.showSuccess(
            newStatus
              ? 'تم تفعيل المستخدم بنجاح'
              : 'تم إلغاء تفعيل المستخدم بنجاح',
          );
        },
        error: (err) => {
          this.togglingId = null;
          this.showError(err.message);
        },
      });
  }

  // ======================
  // HELPERS
  // ======================

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = null), 5000);
  }
}
