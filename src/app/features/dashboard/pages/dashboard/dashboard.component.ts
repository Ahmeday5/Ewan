import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { RouterModule } from '@angular/router';
import {
  kpisStats,
  ChartCategoryItem,
  DashboardOverviewLists,
  BookingStatus,
} from '../../models/dashboard.model';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime } from 'rxjs';

Chart.register(
  LineController, BarController, DoughnutController,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler,
);

const CHART_COLORS = [
  '#e74c3c',
  '#3498db',
  '#ca6702',
  '#9b59b6',
  '#1abc9c',
  '#95a5a6',
];

interface StatusMeta {
  label: string;
  cssClass: string;
}

const BOOKING_STATUS_MAP: Record<string, StatusMeta> = {
  [BookingStatus.Confirmed]: { label: 'مؤكد', cssClass: 'bg-success' },
  [BookingStatus.Pending]: { label: 'قيد الانتظار', cssClass: 'bg-warning' },
  [BookingStatus.Completed]: { label: 'مكتمل', cssClass: 'bg-info' },
  [BookingStatus.Cancelled]: { label: 'ملغي', cssClass: 'bg-danger' },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('ReservationsChart')
  ReservationsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('RevenuesChart') RevenuesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cityChartRef') cityChartRef!: ElementRef<HTMLCanvasElement>;
  private monthsSubject = new Subject<number>();
  private chartsCache = new Map<number, { data: any; timestamp: number }>();

  TOP_COUNT = 5;
  RECENT_COUNT = 5;

  months = 4;
  kpisStats: kpisStats | null = null;
  overviewLists: DashboardOverviewLists | null = null;
  bookingsByCity: ChartCategoryItem[] = [];
  errorMessage: string | null = null;

  private bookingsChart: Chart | null = null;
  private revenueChart: Chart | null = null;
  private categoryChart: Chart | null = null;
  private cityChart: Chart | null = null;
  private viewReady = false;

  constructor(private apiService: DashboardService) {}

  ngOnInit(): void {
    this.loadkpisStats();
    this.loadOverviewLists();
    this.monthsSubject
      .pipe(debounceTime(500)) // ⏳ يستنى نص ثانية بعد آخر كتابة
      .subscribe((val) => {
        this.months = val;
        this.loadChartsData(); // 🔥 API هنا بس
      });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.loadChartsData();
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
  }

  // ======================
  // LOAD KPIs
  // ======================
  loadkpisStats(): void {
    this.apiService.getkpisStats().subscribe({
      next: (res) => (this.kpisStats = res),
      error: (err) => (this.errorMessage = err.message),
    });
  }

  // ======================
  // LOAD OVERVIEW LISTS
  // ======================
  loadOverviewLists(): void {
    this.apiService
      .getOverviewLists(this.TOP_COUNT, this.RECENT_COUNT)
      .subscribe({
        next: (res) => (this.overviewLists = res),
        error: (err) => (this.errorMessage = err.message),
      });
  }

  onTopCountChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    if (val > 0 && val <= 60) {
      this.TOP_COUNT = val;
      this.loadOverviewLists();
    }
  }
  onRecentCountChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    if (val > 0 && val <= 60) {
      this.RECENT_COUNT = val;
      this.loadOverviewLists();
    }
  }

  // ======================
  // LOAD CHARTS
  // ======================
  loadChartsData(): void {
    if (!this.viewReady) return;

    const CACHE_TIME = 5 * 60 * 1000; // ⏳ 5 دقايق

    const cached = this.chartsCache.get(this.months);

    // ✅ لو في كاش ولسه صالح
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
      this.renderCharts(cached.data);
      return;
    }
    
    // ❌ لو مفيش كاش أو انتهى
    this.apiService.getChartsData(this.months).subscribe({
      next: (data) => {
        this.chartsCache.set(this.months, {
          data,
          timestamp: Date.now(), // ⏱ وقت التخزين
        });

        this.renderCharts(data);
      },
      error: (err) => (this.errorMessage = err.message),
    });
  }

  private renderCharts(data: any): void {
    this.destroyAllCharts();
    this.bookingsByCity = data.bookingsByCity ?? [];

    this.bookingsChart = this.createLineChart(
      this.ReservationsChart.nativeElement,
      data.bookingsTrend.map((i: any) => i.month),
      data.bookingsTrend.map((i: any) => i.value),
      'الحجوزات',
      '#f15a24',
    );

    this.revenueChart = this.createBarChart(
      this.RevenuesChart.nativeElement,
      data.revenueTrend.map((i: any) => i.month),
      data.revenueTrend.map((i: any) => i.value),
      'الإيرادات',
      '#09B479',
    );

    if (this.bookingsByCity.length && this.cityChartRef) {
      this.cityChart = this.createDoughnutChart(
        this.cityChartRef.nativeElement,
        this.bookingsByCity,
      );
    }
  }

  onMonthsChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;

    if (val > 0 && val <= 60) {
      this.monthsSubject.next(val); // 👈 بدل ما تضرب API
    }
  }

  // ======================
  // BOOKING STATUS HELPERS
  // ======================
  getStatusLabel(status: string): string {
    return BOOKING_STATUS_MAP[status]?.label ?? 'غير معروف';
  }

  getStatusClass(status: string): string {
    return BOOKING_STATUS_MAP[status]?.cssClass ?? 'bg-secondary';
  }

  // ======================
  // CHART BUILDERS
  // ======================
  private createLineChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    label: string,
    color: string,
  ): Chart {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            backgroundColor: color + '33',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'top', rtl: true } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { font: { family: 'Cairo' } } },
        },
      },
    });
  }

  private createBarChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    label: string,
    color: string,
  ): Chart {
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: color,
            borderRadius: 12,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'top', rtl: true } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { font: { family: 'Cairo' } } },
        },
      },
    });
  }

  private createDoughnutChart(
    canvas: HTMLCanvasElement,
    items: ChartCategoryItem[],
  ): Chart {
    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: items.map((i) => `${i.name} (${i.percentage}%)`),
        datasets: [
          {
            data: items.map((i) => i.count),
            backgroundColor: CHART_COLORS.slice(0, items.length),
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { animateRotate: true, duration: 2500 },
        plugins: {
          legend: { position: 'top', rtl: true },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} حجز` },
          },
        },
      },
    });
  }

  private destroyAllCharts(): void {
    [
      this.bookingsChart,
      this.revenueChart,
      this.categoryChart,
      this.cityChart,
    ].forEach((c) => c?.destroy());
    this.bookingsChart =
      this.revenueChart =
      this.categoryChart =
      this.cityChart =
        null;
  }
}
