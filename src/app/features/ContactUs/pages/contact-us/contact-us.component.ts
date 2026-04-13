import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ContactUsService } from '../../services/contact-us.service';
import { ToastService } from '../../../../core/services/toast.service';

const PHONE_PATTERN = /^01[0-2,5]{1}[0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  hasLoaded  = false;
  isSaving   = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: ContactUsService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      supportNumber:  ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      whatsappNumber: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      email:          ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  private load(): void {
    this.hasLoaded = false;
    this.service.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.hasLoaded = true;
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.service.update(this.form.getRawValue()).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toast.success('تم تحديث بيانات التواصل بنجاح');
        this.isSaving = false;
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isSaving = false;
      },
    });
  }
}
