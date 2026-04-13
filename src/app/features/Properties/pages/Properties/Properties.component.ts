import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
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
import { PropertyTypeEnum } from '../../enums/property-type.enum';
import { PropertyFormService } from '../../services/property-form.service';
import { PropertyFormHelper } from '../../helpers/property-form.helper';
import { ToastService } from '../../../../core/services/toast.service';

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

  allFacilities: facilitiesGroups[] = [];
  selectedFacilityIds: number[] = [];

  existingImageUrls: string[] = [];
  newImageFiles: File[] = [];
  newImagePreviews: string[] = [];

  errorMessageModel: string | null = null;
  propertyId!: number;
  form!: FormGroup;
  isAddMode = false;
  isEditMode = false;
  hasLoaded = false;

  modalInstance!: { show: () => void; hide: () => void };

  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  selectedType: string = '';
  typeCounts: any;

  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // Owner Credentials Modal
  credentialsForm!: FormGroup;
  credentialsPropertyId!: number;
  credentialsError: string | null = null;
  credentialsModalInstance!: { show: () => void; hide: () => void };

  // ─── Details Modal ───────────────────────────────────────────
  selectedProp: properties | null = null;
  private detailModalInstance!: { show: () => void; hide: () => void };

  constructor(
    private apiService: PropertiesService,
    private facilitiesApiService: facilitiesService,
    private formService: PropertyFormService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
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
        this.propertyId = +propertyId;
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

    const detailModal = document.getElementById('PropDetailModal');
    if (detailModal) {
      this.detailModalInstance = new (window as any).bootstrap.Modal(detailModal);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }

  get f() { return this.form.controls; }
  get isHall() { return this.formService.isHall(this.form.value.propertyType); }
  get isNormalProperty() { return this.formService.isNormal(this.form.value.propertyType); }

  // ─── Load ────────────────────────────────────────────────

  loadFacilities(): void {
    this.facilitiesApiService.getAll(1, 100).subscribe({
      next: (res) => { this.allFacilities = res.facilities; },
      error: (err) => console.error('فشل تحميل المرافق', err),
    });
  }

  loadProperties(): void {
    this.hasLoaded = false;
    this.apiService.getAll(this.pageIndex, this.pageSize, this.searchTerm, this.selectedType).subscribe({
      next: (res) => {
        this.properties = res.properties;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.typeCounts = res.typeCounts;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  onSearchChange(): void { this.searchSubject.next(); }
  onTypeChange(): void { this.pageIndex = 1; this.loadProperties(); }
  onPageChange(page: number): void { this.pageIndex = page; this.loadProperties(); }

  // ─── Facilities Helpers ──────────────────────────────────

  toggleFacility(id: number) {
    this.selectedFacilityIds = PropertyFormHelper.toggleFacility(this.selectedFacilityIds, id);
  }

  isFacilitySelected(id: number): boolean {
    return this.selectedFacilityIds.includes(id);
  }

  // ─── Image Helpers ───────────────────────────────────────

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selected = Array.from(input.files);
      this.newImageFiles = [...this.newImageFiles, ...selected];
      const newPreviews = selected.map((file) => URL.createObjectURL(file));
      this.newImagePreviews = [...this.newImagePreviews, ...newPreviews];
      input.value = '';
    }
  }

  removeNewImage(index: number): void {
    URL.revokeObjectURL(this.newImagePreviews[index]);
    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImageUrls.splice(index, 1);
  }

  // ─── Load By Id ──────────────────────────────────────────

  loadById(id: number): void {
    this.apiService.getById(id).subscribe({
      next: (data) => {
        this.form.reset();
        this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
        this.newImageFiles = [];
        this.newImagePreviews = [];
        this.existingImageUrls = [...(data.imageUrls ?? [])];
        this.selectedFacilityIds = (data.facilities ?? [])
          .map((name) => this.allFacilities.find((f) => f.name === name)?.id)
          .filter((id): id is number => id !== undefined);
        this.form.patchValue({
          id: data.id, name: data.name, description: data.description,
          ownerPhoneNumber: data.ownerPhoneNumber, propertyType: data.propertyType,
          isAvailable: data.isAvailable, address: data.address, location: data.location,
          pricePerNight: data.pricePerNight ?? 0, pricePerHour: data.pricePerHour ?? 0,
          roomCount: data.roomCount ?? 0, guestCount: data.guestCount ?? 0,
        });
        setTimeout(() => this.modalInstance.show());
      },
      error: (err) => { this.errorMessageModel = err.message; },
    });
  }

  // ─── Add Modal ───────────────────────────────────────────

  openAddModal(): void {
    this.isEditMode = false;
    this.isAddMode = true;
    this.selectedFacilityIds = [];
    this.existingImageUrls = [];
    this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    this.newImageFiles = [];
    this.newImagePreviews = [];

    const pwd = this.form.get('ownerPassword');
    pwd?.setValidators([Validators.required, Validators.minLength(6)]);
    pwd?.updateValueAndValidity();

    this.form.reset({ isAvailable: true, pricePerNight: 0, pricePerHour: 0, roomCount: 0, guestCount: 0 });
    this.modalInstance.show();
  }

  // ─── Edit Modal ──────────────────────────────────────────

  openEditModal(id: number) {
    this.isEditMode = true;
    this.isAddMode = false;
    const pwd = this.form.get('ownerPassword');
    pwd?.clearValidators();
    pwd?.updateValueAndValidity();
    this.loadById(id);
  }

  // ─── Submit ──────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
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

    let v = this.form.value;
    if (v.propertyType === 'Hall') {
      v = { ...v, pricePerNight: 0, roomCount: 0 };
    } else {
      v = { ...v, pricePerHour: 0 };
    }

    const formData = new FormData();
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
    this.selectedFacilityIds.forEach((id) => formData.append('FacilityIds', id.toString()));

    let request$;
    if (this.isEditMode) {
      formData.append('Id', v.id.toString());
      formData.append('IsAvailable', v.isAvailable.toString());
      this.existingImageUrls.forEach((url) => {
        formData.append('ExistingImageUrls', url.replace('https://ewan.runasp.net', ''));
      });
      this.newImageFiles.forEach((file) => formData.append('NewImages', file));
      request$ = this.apiService.update(formData);
    } else {
      this.newImageFiles.forEach((file) => formData.append('Images', file));
      formData.append('OwnerPassword', v.ownerPassword);
      request$ = this.apiService.create(formData);
    }

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        this.modalInstance.hide();
        this.propertyId ? this.loadById(this.propertyId) : this.loadProperties();
      },
      error: (err) => {
        this.errorMessageModel = err.message;
        setTimeout(() => (this.errorMessageModel = null), 6000);
      },
    });
  }

  // ─── Delete ──────────────────────────────────────────────

  async deleteSub(id: number): Promise<void> {
    const confirmed = await this.toast.confirm('هل أنت متأكد من حذف هذا العقار؟');
    if (!confirmed) return;

    this.apiService.delete(id).subscribe({
      next: () => {
        this.toast.success('تم حذف العقار بنجاح');
        this.propertyId ? this.loadById(this.propertyId) : this.loadProperties();
      },
      error: (err) => this.toast.error(err.message),
    });
  }

  // ─── Owner Credentials ───────────────────────────────────

  get cf() { return this.credentialsForm.controls; }

  // ─── Details Modal ───────────────────────────────────────────

  openDetailModal(prop: properties): void {
    this.selectedProp = prop;
    setTimeout(() => this.detailModalInstance?.show());
  }

  // ─── Owner Credentials ───────────────────────────────────────

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
    this.apiService.updateOwnerCredentials(this.credentialsPropertyId, { ownerPhoneNumber, newPassword }).subscribe({
      next: () => {
        this.credentialsModalInstance.hide();
        this.toast.success('تم تحديث بيانات المالك بنجاح');
      },
      error: (err) => {
        this.credentialsError = err.message;
        setTimeout(() => (this.credentialsError = null), 6000);
      },
    });
  }
}
