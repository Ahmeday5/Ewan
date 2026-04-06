import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { facilitiesService } from '../../services/facilities.service';
import { facilitiesGroups } from '../../models/facilities.model';

@Component({
  selector: 'app-main-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PaginationComponent],
  templateUrl: './facilities.component.html',
  styleUrl: './facilities.component.scss',
})
export class FacilitiesComponent implements OnInit, AfterViewInit {
  Facilities: facilitiesGroups[] = [];
  //أنا مستني Array من facilitiesGroups
  selectedGroup!: facilitiesGroups;
  // بقوله هاخد من بروبلتي جروب بس مش Array، هاخد عنصر واحد بس
  successMessage: string | null = null;
  errorMessage: string | null = null;
  errorMessageModel: string | null = null;
  categoryId!: number;
  form!: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  hasLoaded = false;
  // modal
  modalInstance!: {
    show: () => void;
    hide: () => void;
  };
  // باخد اوبجكت من البوت استراب عشان اقدر افتح واقفل المودال من الكومبوننت

  // ====================== pagination ======================
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private apiService: facilitiesService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('categoryId');

      if (id) {
        this.categoryId = +id;
        // جلب اسم الكاتجوري
        this.apiService.getById(this.categoryId).subscribe({
          next: (cat) => {
            this.selectedGroup = cat;
            this.hasLoaded = true;
          },
          error: (err) => {
            this.errorMessage = err.message;
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
        this.Facilities = res.facilities;
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
    this.loadGroups();
  }

  // ======================
  // LOAD BY id
  // ======================

  loadById(id: number) {
    this.apiService.getById(id).subscribe({
      next: (data) => {
        // 1️⃣ إعادة تعيين الفورم أولاً
        this.form.reset();

        // 2️⃣ تعيين القيمة الجديدة
        this.form.patchValue({
          id: data.id, // 👈 ID
          name: data.name, // 👈 الاسم
        });

        // 3️⃣ عرض المودال بعد فترة قصيرة لضمان Angular Detect Changes
        setTimeout(() => {
          this.modalInstance.show();
        });
      },
      error: (err) => {
        this.errorMessageModel = err.message;
      },
    });
  }

  // ======================
  // ADD MODAL
  // ======================
  openAddModal() {
    this.isEditMode = false;
    this.form.reset();
    this.modalInstance.show();
  }

  // ======================
  // EDIT MODAL
  // ======================

  openEditModal(id: number) {
    this.isEditMode = true;
    this.loadById(id); // سيقوم الآن بتحديث الفورم وفتح المودال
  }

  // ======================
  // SUBMIT
  // ======================

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = this.form.value as { id?: number; name: string };

    const request$ = this.isEditMode
      ? this.apiService.update(body)
      : this.apiService.create({ name: body.name });
    //request$ بقول لاي حد هيشتغل بعدي خلي بالك دة observable

    request$.subscribe({
      next: () => {
        this.showSuccess(
          this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        );
        this.modalInstance.hide();
        if (this.categoryId) {
          this.loadById(this.categoryId);
        } else {
          this.loadGroups();
        }
      },
      error: (err) => {
        this.errorMessageModel = err.message;
        setTimeout(() => {
          this.errorMessageModel = null;
        }, 6000);
      },
    });
  }

  // ======================
  // DELETE
  // ======================

  deleteSub(id: number) {
    if (!confirm('هل انت متاكد من الحذف؟')) return;

    this.apiService.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم الحذف بنجاح');
        if (this.categoryId) {
          this.loadById(this.categoryId);
        } else {
          this.loadGroups();
        }
      },
      error: (err) => (this.errorMessage = err.message),
    });
  }

  // ======================
  // SUCCESS
  // ======================

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}
