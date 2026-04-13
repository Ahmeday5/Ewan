import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { propertyGroups } from '../../models/main-category.model';
import { MainCategoryService } from '../../services/main-category.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-main-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PaginationComponent],
  templateUrl: './main-category.component.html',
  styleUrl: './main-category.component.scss',
})
export class MainCategoryComponent implements OnInit, AfterViewInit {
  propertyGroups: propertyGroups[] = [];
  selectedGroup!: propertyGroups;
  errorMessageModel: string | null = null;
  categoryId!: number;
  form!: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  hasLoaded = false;

  modalInstance!: { show: () => void; hide: () => void };

  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 1;
  totalPages: number = 1;

  constructor(
    private apiService: MainCategoryService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('categoryId');
      if (id) {
        this.categoryId = +id;
        this.apiService.getById(this.categoryId).subscribe({
          next: (cat) => {
            this.selectedGroup = cat;
            this.hasLoaded = true;
          },
          error: (err) => {
            this.toast.error(err.message);
            this.hasLoaded = true;
          },
        });
      } else {
        this.loadGroups();
      }
    });
  }

  ngAfterViewInit() {
    const modal = document.getElementById('CategoryModal');
    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  get nameControl() {
    return this.form.get('name');
  }

  loadGroups(): void {
    this.hasLoaded = false;
    this.apiService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.propertyGroups = res.categories;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadGroups();
  }

  loadById(id: number) {
    this.apiService.getById(id).subscribe({
      next: (data) => {
        this.form.reset();
        this.form.patchValue({ id: data.id, name: data.name });
        setTimeout(() => this.modalInstance.show());
      },
      error: (err) => {
        this.errorMessageModel = err.message;
      },
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.errorMessageModel = null;
    this.form.reset();
    this.modalInstance.show();
  }

  openEditModal(id: number) {
    this.isEditMode = true;
    this.errorMessageModel = null;
    this.loadById(id);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = this.form.value as { id?: number; name: string };

    const request$ = this.isEditMode
      ? this.apiService.update(body)
      : this.apiService.create({ name: body.name });

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        this.modalInstance.hide();
        if (this.categoryId) {
          this.loadById(this.categoryId);
        } else {
          this.loadGroups();
        }
      },
      error: (err) => {
        this.errorMessageModel = err.message;
        setTimeout(() => (this.errorMessageModel = null), 6000);
      },
    });
  }

  async deleteSub(id: number) {
    const confirmed = await this.toast.confirm('هل أنت متأكد من حذف هذا العنصر؟');
    if (!confirmed) return;

    this.apiService.delete(id).subscribe({
      next: () => {
        this.toast.success('تم الحذف بنجاح');
        if (this.categoryId) {
          this.loadById(this.categoryId);
        } else {
          this.loadGroups();
        }
      },
      error: (err) => this.toast.error(err.message),
    });
  }
}
