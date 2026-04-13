import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NotificaionService } from '../../services/notificaion.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-notificaion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notificaion.component.html',
  styleUrl: './notificaion.component.scss',
})
export class NotificaionComponent implements OnDestroy {
  form: FormGroup;
  isLoading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificaionService,
    private readonly toastService: ToastService,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      body: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  // ─── Getters ────────────────────────────────────────────────

  get title(): string {
    return this.form.get('title')?.value ?? '';
  }

  get body(): string {
    return this.form.get('body')?.value ?? '';
  }

  get bodyLength(): number {
    return this.body.length;
  }

  get showPreview(): boolean {
    return this.title.trim().length > 0 || this.body.trim().length > 0;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  // ─── Actions ────────────────────────────────────────────────

  sendNotification(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.notificationService
      .sendToAllClients(this.form.getRawValue())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('تم إرسال الإشعار بنجاح لجميع العملاء');
          this.form.reset();
        },
        error: (err: Error) => {
          this.toastService.error(err.message || 'فشل في إرسال الإشعار، حاول مرة أخرى');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
