import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
 @ViewChild('ReservationsChart') ReservationsChart!: ElementRef<HTMLCanvasElement>;
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
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [
          {
            label: 'الحجوزات',
            data: [65, 82, 71, 108, 95, 112, 129, 118, 98, 135, 122, 148],
            backgroundColor: '#f15a24',
            //borderRadius: 8,
            //borderSkipped: false,
          },
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'top', rtl: true } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => v + ' ألف' } },
          x: { ticks: { font: { family: 'Cairo' } } }
        }
      }
    });
  }
}

  private createRevenuesChart() {
    {
    new Chart(this.RevenuesChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [
          {
            label: 'الإيرادات',
            data: [65, 82, 71, 108, 95, 112, 129, 118, 98, 135, 122, 148],
            backgroundColor: '#09B479',
            borderRadius: 12,
            borderSkipped: false,
          },
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'top', rtl: true } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => v + ' ألف' } },
          x: { ticks: { font: { family: 'Cairo' } } }
        }
      }
    });
  }
}

  private createExpensesChart() {
    new Chart(this.expensesChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['شاليه', 'فندق', 'منتزه', 'قاعة افراح', 'شقة', 'أخرى'],
        datasets: [{
          data: [42, 18, 15, 12, 28, 9],
          backgroundColor: ['#e74c3c', '#3498db', '#ca6702', '#9b59b6', '#1abc9c', '#95a5a6'],
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        animation: { animateRotate: true, duration: 2500 },
        plugins: {
          legend: { position: 'top', rtl: true },
          tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } }
        }
      }
    });
  }
}
