import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { properties } from '../../models/Properties.model';
import { PropertiesService } from '../../services/Properties.service';
import { propertyGroups } from '../../../Categoiers/models/main-category.model';
import { facilitiesGroups } from '../../../Categoiers/models/facilities.model';
import { facilitiesService } from '../../../Categoiers/services/facilities.service';
import { MainCategoryService } from '../../../Categoiers/services/main-category.service';
import { forkJoin } from 'rxjs';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-real-state',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PaginationComponent,
  ],
  templateUrl: './Properties.component.html',
  styleUrl: './Properties.component.scss',
})
export class PropertiesComponent implements OnInit, AfterViewInit, OnDestroy {
  properties: properties[] = [];
  // ====================== Lookups (للسيلكت والمرافق) ======================
  allGroups: propertyGroups[] = []; // كل الفئات للـ select
  allFacilities: facilitiesGroups[] = []; // كل المرافق للـ checkboxes
  // ====================== إدارة المرافق المختارة ======================
  selectedFacilityIds: number[] = [];
  // ====================== إدارة الصور ======================
  existingImageUrls: string[] = []; // الصور الحالية في Edit mode
  newImageFiles: File[] = []; // الصور الجديدة المرفوعة
  newImagePreviews: string[] = [];
  //أنا مستني Array من properties عشان اعرضها في اللست، مش مستني عنصر واحد
  selectedGroup!: properties;
  // بقوله هاخد من بروبلتي جروب بس مش Array، هاخد عنصر واحد بس
  successMessage: string | null = null;
  errorMessage: string | null = null;
  errorMessageModel: string | null = null;
  propertyId!: number;
  form!: FormGroup;
  isAddMode = false;
  isEditMode = false;
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
    private apiService: PropertiesService,
    private mainCategoryService: MainCategoryService,
    private facilitiesApiService: facilitiesService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLookups(); // ✅ بنجيب الـ Groups والـ Facilities الأول

    this.route.paramMap.subscribe((params) => {
      const id = params.get('propertyId');
      if (id) {
        this.propertyId = +id;
        this.apiService.getById(this.propertyId).subscribe({
          next: (prop) => {
            this.hasLoaded = true;
          },
          error: (err) => {
            this.errorMessage = err.message;
            this.hasLoaded = true;
          },
        });
      } else {
        this.loadProperties();
      }
    });
  }

  ngAfterViewInit() {
    const modal = document.getElementById('PropertyModal');

    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  ngOnDestroy(): void {
    // ✅ لما الكومبوننت يتدمر، نحرر كل الـ blob URLs
    this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }

  // ======================
  // FORM INIT
  // ======================
  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      ownerPhoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)],
      ],
      ownerPassword: ['', [Validators.required, Validators.minLength(6)]],
      groupId: [null, [Validators.required]],
      isAvailable: [true], // ✅ مضاف — بيبدأ بـ true
      address: ['', [Validators.required, Validators.minLength(5)]],
      location: ['', [Validators.required, Validators.minLength(5)]],
      pricePerNight: [null, [Validators.required, Validators.min(1)]],
      roomCount: [null, [Validators.required, Validators.min(1)]],
      guestCount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  // ======================
  // GETTERS (سهولة الاستخدام في HTML)
  // ======================
  get f() {
    return this.form.controls;
  }
  get nameControl() {
    return this.form.get('name');
  }
  get descriptionControl() {
    return this.form.get('description');
  }
  get phoneControl() {
    return this.form.get('ownerPhoneNumber');
  }
  get passwordControl() {
    return this.form.get('ownerPassword');
  }
  get groupControl() {
    return this.form.get('groupId');
  }
  get addressControl() {
    return this.form.get('address');
  }
  get locationControl() {
    return this.form.get('location');
  }
  get priceControl() {
    return this.form.get('pricePerNight');
  }
  get roomControl() {
    return this.form.get('roomCount');
  }
  get guestControl() {
    return this.form.get('guestCount');
  }

  // ======================
  // LOAD LOOKUPS (Groups + Facilities)
  // ======================

  loadLookups(): void {
    // ✅ forkJoin بينفذهم مع بعض وبيستنى الاتنين يخلصوا
    forkJoin({
      groups: this.mainCategoryService.getAll(1, 100),
      facilities: this.facilitiesApiService.getAll(1, 100),
    }).subscribe({
      next: ({ groups, facilities }) => {
        this.allGroups = groups.categories;
        this.allFacilities = facilities.facilities;
      },
      error: (err) => console.error('فشل تحميل البيانات الأساسية', err),
    });
  }

  // ======================
  // LOAD PROPERTIES
  // ======================

  loadProperties(): void {
    this.hasLoaded = false;

    this.apiService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.properties = res.properties;
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
    this.loadProperties();
  }

  // ======================
  // FACILITIES HELPERS
  // ======================

  toggleFacility(id: number): void {
    const index = this.selectedFacilityIds.indexOf(id);
    if (index > -1) {
      this.selectedFacilityIds.splice(index, 1); // إزالة
    } else {
      this.selectedFacilityIds.push(id); // إضافة
    }
  }

  isFacilitySelected(id: number): boolean {
    return this.selectedFacilityIds.includes(id);
  }

  // ======================
  // IMAGES HELPERS
  // ======================

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selected = Array.from(input.files);

      // ✅ نضيف الـ Files
      this.newImageFiles = [...this.newImageFiles, ...selected];

      // ✅ نحسب الـ blob URLs مرة واحدة بس ونخزنهم
      const newPreviews = selected.map((file) => URL.createObjectURL(file));
      this.newImagePreviews = [...this.newImagePreviews, ...newPreviews];

      input.value = '';
    }
  }

  // ✅ إضافة method لحذف صورة جديدة بـ index
  removeNewImage(index: number): void {
    // ✅ revoke الـ URL القديم عشان مفيش memory leak
    URL.revokeObjectURL(this.newImagePreviews[index]);

    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImageUrls.splice(index, 1);
  }

  // ======================
  // LOAD BY id
  // ======================

  loadById(id: number): void {
    this.apiService.getById(id).subscribe({
      next: (data) => {
        this.form.reset();

        // ✅ cleanup الصور الجديدة القديمة
        this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
        this.newImageFiles = [];
        this.newImagePreviews = [];

        this.existingImageUrls = [...(data.imageUrls ?? [])];

        this.selectedFacilityIds = (data.facilities ?? [])
          .map((name) => this.allFacilities.find((f) => f.name === name)?.id)
          .filter((id): id is number => id !== undefined);

        this.form.patchValue({
          id: data.id,
          name: data.name,
          description: data.description,
          ownerPhoneNumber: data.ownerPhoneNumber,
          groupId: data.groupId,
          isAvailable: data.isAvailable,
          address: data.address,
          location: data.location,
          pricePerNight: data.pricePerNight,
          roomCount: data.roomCount,
          guestCount: data.guestCount,
        });

        setTimeout(() => this.modalInstance.show());
      },
      error: (err) => {
        this.errorMessageModel = err.message;
      },
    });
  }

  // ======================
  // ADD MODAL
  // ======================
  openAddModal(): void {
    this.isEditMode = false;
    this.isAddMode = true;
    this.selectedFacilityIds = [];
    this.existingImageUrls = [];

    // ✅ revoke كل الـ blob URLs القديمة قبل الـ reset
    this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    this.newImageFiles = [];
    this.newImagePreviews = [];

    this.form.reset();
    this.form.patchValue({ isAvailable: true });
    this.modalInstance.show();
  }

  // ======================
  // EDIT MODAL
  // ======================

  openEditModal(id: number) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.loadById(id); // سيقوم الآن بتحديث الفورم وفتح المودال
  }

  // ======================
  // SUBMIT
  // ======================

  onSubmit(): void {
    // ✅ Validate الفورم
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // ✅ Validate المرافق
    if (this.selectedFacilityIds.length === 0) {
      this.errorMessageModel = 'يرجى اختيار مرفق واحد على الأقل';
      return;
    }

    // ✅ Validate الصور في Add mode
    if (!this.isEditMode && this.newImageFiles.length === 0) {
      this.errorMessageModel = 'يرجى رفع صورة واحدة على الأقل';
      return;
    }

    const v = this.form.value;
    const formData = new FormData();
    
    // ─── الحقول المشتركة ───
    formData.append('Name', v.name);
    formData.append('Description', v.description);
    formData.append('OwnerPhoneNumber', v.ownerPhoneNumber);
    formData.append('OwnerPassword', v.ownerPassword);
    formData.append('GroupId', v.groupId.toString());
    formData.append('Address', v.address);
    formData.append('Location', v.location);
    formData.append('PricePerNight', v.pricePerNight.toString());
    formData.append('RoomCount', v.roomCount.toString());
    formData.append('GuestCount', v.guestCount.toString());

    // ─── المرافق ───
    this.selectedFacilityIds.forEach((id) =>
      formData.append('FacilityIds', id.toString()),
    );

    let request$;

    if (this.isEditMode) {
      // ─── حقول خاصة بالـ Edit ───
      formData.append('Id', v.id.toString());
      formData.append('IsAvailable', v.isAvailable.toString());

      // ✅ الصور القديمة المتبقية (اللي ملغاش عليهم ×)
      this.existingImageUrls.forEach((url) =>
        formData.append('ExistingImageUrls', url),
      );

      // ✅ الصور الجديدة المضافة (ممكن تكون 0 أو أكتر)
      this.newImageFiles.forEach((file) => formData.append('NewImages', file));

      request$ = this.apiService.update(v.id, formData);
    } else {
      // ✅ في الإضافة كل الصور جديدة
      this.newImageFiles.forEach((file) => formData.append('Images', file));

      request$ = this.apiService.create(formData);
    }

    request$.subscribe({
      next: () => {
        this.showSuccess(
          this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        );
        this.modalInstance.hide();
        this.propertyId
          ? this.loadById(this.propertyId)
          : this.loadProperties();
      },
      error: (err) => {
        this.errorMessageModel = err.message;
        setTimeout(() => (this.errorMessageModel = null), 6000);
      },
    });
  }

  // ======================
  // DELETE
  // ======================

  deleteSub(id: number): void {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    this.apiService.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم الحذف بنجاح');
        this.propertyId
          ? this.loadById(this.propertyId)
          : this.loadProperties();
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
