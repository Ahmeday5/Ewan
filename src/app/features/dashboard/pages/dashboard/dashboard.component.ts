import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { kpisStats } from '../../models/dashboard.model';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('ReservationsChart')
  ReservationsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('RevenuesChart') RevenuesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expensesChart') expensesChart!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.createReservationsChart();
    this.createRevenuesChart();
    this.createExpensesChart();
  }

  private createReservationsChart() {
    {
      new Chart(this.ReservationsChart.nativeElement, {
        type: 'line',
        data: {
          labels: [
            'يناير',
            'فبراير',
            'مارس',
            'أبريل',
            'مايو',
            'يونيو',
            'يوليو',
            'أغسطس',
            'سبتمبر',
            'أكتوبر',
            'نوفمبر',
            'ديسمبر',
          ],
          datasets: [
            {
              label: 'الحجوزات',
              data: [65, 82, 71, 108, 95, 112, 129, 118, 98, 135, 122, 148],
              backgroundColor: '#f15a24',
              //borderRadius: 8,
              //borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 1000, easing: 'easeOutQuart' },
          plugins: { legend: { position: 'top', rtl: true } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: (v) => v + ' ألف' } },
            x: { ticks: { font: { family: 'Cairo' } } },
          },
        },
      });
    }
  }

  private createRevenuesChart() {
    {
      new Chart(this.RevenuesChart.nativeElement, {
        type: 'bar',
        data: {
          labels: [
            'يناير',
            'فبراير',
            'مارس',
            'أبريل',
            'مايو',
            'يونيو',
            'يوليو',
            'أغسطس',
            'سبتمبر',
            'أكتوبر',
            'نوفمبر',
            'ديسمبر',
          ],
          datasets: [
            {
              label: 'الإيرادات',
              data: [65, 82, 71, 108, 95, 112, 129, 118, 98, 135, 122, 148],
              backgroundColor: '#09B479',
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
            y: { beginAtZero: true, ticks: { callback: (v) => v + ' ألف' } },
            x: { ticks: { font: { family: 'Cairo' } } },
          },
        },
      });
    }
  }

  private createExpensesChart() {
    new Chart(this.expensesChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['شاليه', 'فندق', 'منتزه', 'قاعة افراح', 'شقة', 'أخرى'],
        datasets: [
          {
            data: [42, 18, 15, 12, 28, 9],
            backgroundColor: [
              '#e74c3c',
              '#3498db',
              '#ca6702',
              '#9b59b6',
              '#1abc9c',
              '#95a5a6',
            ],
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
            callbacks: { label: (ctx) => ctx.label + ': ' + ctx.parsed + '%' },
          },
        },
      },
    });
  }

  kpisStats: kpisStats | null = null;
  errorMessage: string | null = null;
  hasLoaded = false;
  // ====================== pagination ======================
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private apiService: DashboardService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadkpisStats();
  }

  // ======================
  // LOAD BY id
  // ======================

  loadkpisStats(): void {
    this.apiService.getkpisStats().subscribe({
      next: (res) => {
        this.kpisStats = res;
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }
}
