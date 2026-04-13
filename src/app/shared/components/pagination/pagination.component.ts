import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type PageItem =
  | { kind: 'page';     value: number }
  | { kind: 'ellipsis'; id: string   };

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages  = 0;
  /** عدد أرقام الصفحات يميناً ويساراً حول الصفحة الحالية */
  @Input() windowSize  = 2;

  @Output() pageChange = new EventEmitter<number>();

  pages: PageItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages'] || changes['windowSize']) {
      this.pages = this.buildPages();
    }
  }

  // ─── Navigation ──────────────────────────────────────────

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  goToPrev(): void { this.goTo(this.currentPage - 1); }
  goToNext(): void { this.goTo(this.currentPage + 1); }
  goToFirst(): void { this.goTo(1); }
  goToLast(): void  { this.goTo(this.totalPages); }

  // ─── Helpers ─────────────────────────────────────────────

  get isFirst(): boolean { return this.currentPage === 1; }
  get isLast():  boolean { return this.currentPage === this.totalPages; }

  trackPage(_: number, item: PageItem): string {
    return item.kind === 'page' ? `page-${item.value}` : item.id;
  }

  // ─── Algorithm ───────────────────────────────────────────

  /**
   * ينتج مصفوفة من عناصر الصفحات والـ ellipsis
   * مثال لـ totalPages=10, currentPage=5, windowSize=2:
   *   [1] … [3][4][5][6][7] … [10]
   *
   * الخوارزمية:
   * 1. لو الصفحات قليلة → اعرضها كلها بدون ellipsis
   * 2. دايماً: أول صفحة + آخر صفحة
   * 3. نافذة حول الصفحة الحالية [cur-win … cur+win]
   * 4. اتسع النافذة لو قريبة من البداية أو النهاية
   * 5. ضع ellipsis في الفجوات
   */
  private buildPages(): PageItem[] {
    const { currentPage: cur, totalPages: total, windowSize: win } = this;

    if (total <= 0) return [];

    // كل الصفحات مرئية بدون ellipsis
    const threshold = 2 * win + 3; // 1 + win*2 + أول + آخر
    if (total <= threshold) {
      return Array.from({ length: total }, (_, i) => ({
        kind: 'page',
        value: i + 1,
      }));
    }

    // حساب نافذة الصفحات الوسطى
    let start = Math.max(2, cur - win);
    let end   = Math.min(total - 1, cur + win);

    // قريب من البداية → وسّع لليمين
    if (cur - win <= 2) {
      end = Math.min(total - 1, 2 * win + 2);
    }
    // قريب من النهاية → وسّع لليسار
    if (cur + win >= total - 1) {
      start = Math.max(2, total - 2 * win - 1);
    }

    const items: PageItem[] = [];

    items.push({ kind: 'page', value: 1 });

    if (start > 2) {
      items.push({ kind: 'ellipsis', id: 'ellipsis-start' });
    }

    for (let i = start; i <= end; i++) {
      items.push({ kind: 'page', value: i });
    }

    if (end < total - 1) {
      items.push({ kind: 'ellipsis', id: 'ellipsis-end' });
    }

    items.push({ kind: 'page', value: total });

    return items;
  }
}
