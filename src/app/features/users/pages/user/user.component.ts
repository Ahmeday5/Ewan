import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { User } from '../../models/user.model';
import { ToastService } from '../../../../core/services/toast.service';

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

  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  totalPages = 1;

  private detailsModal!: { show: () => void; hide: () => void };

  constructor(
    private userService: UserService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    const el = document.getElementById('DetailsModal');
    if (el) {
      this.detailsModal = new (window as any).bootstrap.Modal(el);
    }
  }

  // ─── Load ────────────────────────────────────────────────

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
        this.toast.error(err.message);
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadUsers();
  }

  // ─── Stats ───────────────────────────────────────────────

  get activeCount(): number {
    return this.users.filter((u) => u.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter((u) => !u.isActive).length;
  }

  get totalBookings(): number {
    return this.users.reduce((sum, u) => sum + u.bookingsCount, 0);
  }

  // ─── Details Modal ───────────────────────────────────────

  openDetails(user: User): void {
    this.selectedUser = user;
    setTimeout(() => this.detailsModal?.show());
  }

  // ─── Toggle Activation ───────────────────────────────────

  async toggleActivation(user: User): Promise<void> {
    const action = user.isActive ? 'إلغاء تفعيل' : 'تفعيل';
    const confirmed = await this.toast.confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`);
    if (!confirmed) return;

    this.togglingId = user.id;
    const newStatus = !user.isActive;

    this.userService.activationClient(user.id, { isActive: newStatus }).subscribe({
      next: () => {
        user.isActive = newStatus;
        if (this.selectedUser?.id === user.id) {
          this.selectedUser = { ...user };
        }
        this.togglingId = null;
        this.toast.success(newStatus ? 'تم تفعيل المستخدم بنجاح' : 'تم إلغاء تفعيل المستخدم بنجاح');
      },
      error: (err) => {
        this.togglingId = null;
        this.toast.error(err.message);
      },
    });
  }
}
