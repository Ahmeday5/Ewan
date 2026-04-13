import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { TermsService } from '../../services/terms.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsComponent implements OnInit, OnDestroy {
  readonly Editor = ClassicEditor;

  /** محتوى المحرر (HTML string) */
  editorContent = '';
  /** محتوى محفوظ — لمقارنة هل فيه تغيير */
  savedContent  = '';

  hasLoaded = false;
  isSaving  = false;
  isEditing = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly service: TermsService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasChanges(): boolean {
    return this.editorContent !== this.savedContent;
  }

  private load(): void {
    this.hasLoaded = false;
    this.service.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.editorContent = data.htmlContent || data.content || '';
        this.savedContent  = this.editorContent;
        this.hasLoaded     = true;
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.editorContent = this.savedContent;
    this.isEditing     = false;
  }

  save(): void {
    if (!this.hasChanges) return;

    this.isSaving = true;
    this.service.update(this.editorContent).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.savedContent = this.editorContent;
        this.isEditing    = false;
        this.isSaving     = false;
        this.toast.success('تم تحديث الشروط والأحكام بنجاح');
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isSaving = false;
      },
    });
  }
}
