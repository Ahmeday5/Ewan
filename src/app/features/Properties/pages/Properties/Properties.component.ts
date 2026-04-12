import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { properties } from '../../models/Properties.model';
import { PropertiesService } from '../../services/Properties.service';
import { facilitiesGroups } from '../../../Categoiers/models/facilities.model';
import { facilitiesService } from '../../../Categoiers/services/facilities.service';
import { OnDestroy } from '@angular/core';
import { PropertyTypeEnum } from '../../enums/property-type.enum';
import { PropertyFormService } from '../../services/property-form.service';
import { PropertyFormHelper } from '../../helpers/property-form.helper';

@Component({
  selector: 'app-real-state',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PaginationComponent,
    FormsModule,
  ],
  templateUrl: './Properties.component.html',
  styleUrl: './Properties.component.scss',
})
export class PropertiesComponent implements OnInit, AfterViewInit, OnDestroy {
  properties: properties[] = [];
  PropertyType = PropertyTypeEnum;
  // ====================== Lookups (للسيلكت والمرافق) ======================
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

  // ====================== pagination and filter ======================
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  selectedType: string = '';
  typeCounts: any;

  // ====================== debounce ======================
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // ====================== Owner Credentials Modal ======================
  credentialsForm!: FormGroup;
  credentialsPropertyId!: number;
  credentialsError: string | null = null;
  credentialsModalInstance!: { show: () => void; hide: () => void };

  constructor(
    private apiService: PropertiesService,
    private facilitiesApiService: facilitiesService,
    private formService: PropertyFormService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.formService.createForm();
    this.credentialsForm = this.fb.group({
      ownerPhoneNumber: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.loadFacilities();

    this.searchSubject
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 1;
        this.loadProperties();
      });

    this.route.paramMap.subscribe((params) => {
      const propertyId = params.get('propertyId');
      if (propertyId) {
        this.loadById(this.propertyId);
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

    const credentialsModal = document.getElementById('CredentialsModal');
    if (credentialsModal) {
      this.credentialsModalInstance = new (window as any).bootstrap.Modal(credentialsModal);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }

  // ======================
  // service && getter
  // ======================

  get f() {
    return this.form.controls;
  }
  get isHall() {
    return this.formService.isHall(this.form.value.propertyType);
  }
  get isNormalProperty() {
    return this.formService.isNormal(this.form.value.propertyType);
  }

  // ======================
  // LOAD LOOKUPS (Groups + Facilities)
  // ======================

  loadFacilities(): void {
    this.hasLoaded = false;
    this.facilitiesApiService.getAll(1, 100).subscribe({
      next: (res) => {
        this.allFacilities = res.facilities;
      },
      error: (err) => console.error('فشل تحميل المرافق والخدمات', err),
    });
  }

  // ======================
  // LOAD PROPERTIES
  // ======================

  loadProperties(): void {
    this.hasLoaded = false;

    this.apiService
      .getAll(this.pageIndex, this.pageSize, this.searchTerm, this.selectedType)
      .subscribe({
        next: (res) => {
          this.properties = res.properties;
          this.totalPages = res.totalPages;
          this.totalCount = res.totalCount;
          this.typeCounts = res.typeCounts;
          this.hasLoaded = true;
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.hasLoaded = true;
        },
      });
  }

  onSearchChange(): void {
    this.searchSubject.next();
  }

  onTypeChange(): void {
    this.pageIndex = 1;
    this.loadProperties();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadProperties();
  }

  // ======================
  // FACILITIES HELPERS
  // ======================

  toggleFacility(id: number) {
    this.selectedFacilityIds = PropertyFormHelper.toggleFacility(
      this.selectedFacilityIds,
      id,
    );
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
          propertyType: data.propertyType,
          isAvailable: data.isAvailable,
          address: data.address,
          location: data.location,
          pricePerNight: data.pricePerNight ?? 0,
          pricePerHour: data.pricePerHour ?? 0,
          roomCount: data.roomCount ?? 0,
          guestCount: data.guestCount ?? 0,
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

    const pwd = this.form.get('ownerPassword');
    pwd?.setValidators([Validators.required, Validators.minLength(6)]);
    pwd?.updateValueAndValidity();

    this.form.reset({
      isAvailable: true,
      pricePerNight: 0,
      pricePerHour: 0,
      roomCount: 0,
      guestCount: 0,
    });
    this.modalInstance.show();
  }

  // ======================
  // EDIT MODAL
  // ======================

  openEditModal(id: number) {
    this.isEditMode = true;
    this.isAddMode = false;

    const pwd = this.form.get('ownerPassword');
    pwd?.clearValidators();
    pwd?.updateValueAndValidity();
    this.loadById(id); // سيقوم الآن بتحديث الفورم وفتح المودال
  }

  // ======================
  // SUBMIT
  // ======================

  onSubmit(): void {
    // ✅ Validate الفورم
    if (this.form.invalid) {
      console.log('❌ form invalid', this.form.value);
      this.form.markAllAsTouched();
      return;
    }

    if (this.selectedFacilityIds.length === 0) {
      this.errorMessageModel = 'يرجى اختيار مرفق واحد على الأقل';
      return;
    }

    if (!this.isEditMode && this.newImageFiles.length === 0) {
      this.errorMessageModel = 'يرجى رفع صورة واحدة على الأقل';
      return;
    }

    console.log('✅ passed validation');

    let v = this.form.value;
    if (v.propertyType === 'Hall') {
      v = {
        ...v,
        pricePerNight: 0,
        roomCount: 0,
      };
    } else {
      v = {
        ...v,
        pricePerHour: 0,
      };
    }
    const formData = new FormData();

    // ─── الحقول المشتركة ───
    formData.append('Name', v.name);
    formData.append('Description', v.description);
    formData.append('OwnerPhoneNumber', v.ownerPhoneNumber);
    formData.append('PropertyType', v.propertyType);
    formData.append('Address', v.address);
    formData.append('Location', v.location);
    formData.append('PricePerNight', (v.pricePerNight ?? 0).toString());
    formData.append('PricePerHour', (v.pricePerHour ?? 0).toString());
    formData.append('RoomCount', (v.roomCount ?? 0).toString());
    formData.append('GuestCount', (v.guestCount ?? 0).toString());

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
      this.existingImageUrls.forEach((url) => {
        const cleanUrl = url.replace('https://ewan.runasp.net', '');
        formData.append('ExistingImageUrls', cleanUrl);
      });

      // ✅ الصور الجديدة المضافة (ممكن تكون 0 أو أكتر)
      this.newImageFiles.forEach((file) => formData.append('NewImages', file));

      request$ = this.apiService.update(formData);
    } else {
      // ✅ في الإضافة كل الصور جديدة
      this.newImageFiles.forEach((file) => formData.append('Images', file));
      request$ = this.apiService.create(formData);
      formData.append('OwnerPassword', v.ownerPassword);
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
  // OWNER CREDENTIALS
  // ======================

  get cf() {
    return this.credentialsForm.controls;
  }

  openCredentialsModal(id: number): void {
    this.credentialsPropertyId = id;
    this.credentialsError = null;
    this.credentialsForm.reset();

    const property = this.properties.find((p) => p.id === id);
    this.credentialsForm.patchValue({ ownerPhoneNumber: property?.ownerPhoneNumber ?? '' });

    this.credentialsModalInstance.show();
  }

  onSubmitCredentials(): void {
    if (this.credentialsForm.invalid) {
      this.credentialsForm.markAllAsTouched();
      return;
    }

    const { ownerPhoneNumber, newPassword } = this.credentialsForm.value;

    this.apiService
      .updateOwnerCredentials(this.credentialsPropertyId, { ownerPhoneNumber, newPassword })
      .subscribe({
        next: () => {
          this.credentialsModalInstance.hide();
          this.showSuccess('تم تحديث بيانات المالك بنجاح');
        },
        error: (err) => {
          this.credentialsError = err.message;
          setTimeout(() => (this.credentialsError = null), 6000);
        },
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
