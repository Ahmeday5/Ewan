import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FaqService } from '../../services/faq.service';
import { Faq } from '../../models/faq.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit, AfterViewInit, OnDestroy {
  // ─── Data ────────────────────────────────────────────────
  faqs: Faq[] = [];
  hasLoaded = false;

  // ─── UI State ────────────────────────────────────────────
  isAddMode = false;
  isEditMode = false;
  isSubmitting = false;
  deletingId: number | null = null;
  errorMessageModal: string | null = null;

  // ─── Form & Modal ────────────────────────────────────────
  form!: FormGroup;
  private modalInstance!: { show: () => void; hide: () => void };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly faqService: FaqService,
    private readonly toast: ToastService,
  ) {}

  // ─── Lifecycle ───────────────────────────────────────────

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      question: ['', [Validators.required, Validators.maxLength(300)]],
      answer: ['', [Validators.required, Validators.maxLength(1000)]],
    });
    this.loadFaqs();
  }

  ngAfterViewInit(): void {
    const el = document.getElementById('FaqModal');
    if (el) {
      this.modalInstance = new (window as any).bootstrap.Modal(el);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Getters ─────────────────────────────────────────────

  get f() {
    return this.form.controls;
  }

  get totalCount(): number {
    return this.faqs.length;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  // ─── Load ────────────────────────────────────────────────

  loadFaqs(): void {
    this.hasLoaded = false;
    this.faqService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.faqs = res.data;
          this.hasLoaded = true;
        },
        error: (err: Error) => {
          this.toast.error(err.message);
          this.hasLoaded = true;
        },
      });
  }

  // ─── Add ─────────────────────────────────────────────────

  openAddModal(): void {
    this.isAddMode = true;
    this.isEditMode = false;
    this.errorMessageModal = null;
    this.form.reset();
    this.modalInstance.show();
  }

  // ─── Edit ────────────────────────────────────────────────

  openEditModal(faq: Faq): void {
    this.isEditMode = true;
    this.isAddMode = false;
    this.errorMessageModal = null;
    this.form.patchValue({ id: faq.id, question: faq.question, answer: faq.answer });
    this.modalInstance.show();
  }

  // ─── Submit ──────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessageModal = null;

    const { id, question, answer } = this.form.getRawValue();

    const request$ = this.isEditMode
      ? this.faqService.update({ id, question, answer })
      : this.faqService.create({ question, answer });

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalInstance.hide();
        this.toast.success(this.isEditMode ? 'تم تعديل السؤال بنجاح' : 'تمت إضافة السؤال بنجاح');
        this.loadFaqs();
        this.isSubmitting = false;
      },
      error: (err: Error) => {
        this.errorMessageModal = err.message;
        this.isSubmitting = false;
      },
    });
  }

  // ─── Delete ──────────────────────────────────────────────

  async deleteFaq(id: number): Promise<void> {
    const confirmed = await this.toast.confirm('هل أنت متأكد من حذف هذا السؤال؟');
    if (!confirmed) return;

    this.deletingId = id;
    this.faqService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.faqs = this.faqs.filter((f) => f.id !== id);
          this.deletingId = null;
          this.toast.success('تم حذف السؤال بنجاح');
        },
        error: (err: Error) => {
          this.deletingId = null;
          this.toast.error(err.message);
        },
      });
  }
}
