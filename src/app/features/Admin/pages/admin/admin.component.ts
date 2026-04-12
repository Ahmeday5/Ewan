import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AdminUser } from '../../model/admin.model';
import { AdminService } from '../../Service/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit, AfterViewInit {
  // ====================== Data ======================
  users: AdminUser[] = [];
  hasLoaded = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  errorMessageModel: string | null = null;

  // ====================== Form & Modal ======================
  form!: FormGroup;
  isAddMode = false;
  isEditMode = false;
  modalInstance!: { show: () => void; hide: () => void };

  // ====================== Pagination & Search ======================
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  totalPages = 1;

  // ====================== Debounce ======================

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Admin'],
    });

    this.loadUsers();
  }

  ngAfterViewInit(): void {
    const modal = document.getElementById('AdminModal');
    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  // ====================== Getters ======================
  get f() {
    return this.form.controls;
  }

  // ====================== Load ======================
  loadUsers(): void {
    this.hasLoaded = false;
    this.adminService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.users;
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
    this.loadUsers();
  }

  // ====================== Add Modal ======================
  openAddModal(): void {
    this.isAddMode = true;
    this.isEditMode = false;
    this.errorMessageModel = null;

    const pwd = this.form.get('password');
    pwd?.setValidators([Validators.required, Validators.minLength(6)]);
    pwd?.updateValueAndValidity();

    this.form.reset({ role: 'Admin' });
    this.modalInstance.show();
  }

  // ====================== Edit Modal ======================
  openEditModal(user: AdminUser): void {
    this.isEditMode = true;
    this.isAddMode = false;
    this.errorMessageModel = null;

    const pwd = this.form.get('password');
    pwd?.clearValidators();
    pwd?.updateValueAndValidity();

    this.form.patchValue({
      id: user.id,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? '',
      role: 'Admin',
    });

    this.modalInstance.show();
  }

  // ====================== Submit ======================
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const request$ = this.isEditMode
      ? this.adminService.update({ id: v.id, userName: v.userName, email: v.email, phoneNumber: v.phoneNumber, role: 'Admin' })
      : this.adminService.create({ userName: v.userName, email: v.email, phoneNumber: v.phoneNumber, password: v.password, role: 'Admin' });

    request$.subscribe({
      next: () => {
        this.modalInstance.hide();
        this.showSuccess(this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessageModel = err.message;
        setTimeout(() => (this.errorMessageModel = null), 6000);
      },
    });
  }

  // ====================== Delete ======================
  deleteUser(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    this.adminService.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم حذف المستخدم بنجاح');
        this.loadUsers();
      },
      error: (err) => (this.errorMessage = err.message),
    });
  }

  // ====================== Success ======================
  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 3000);
  }
}
