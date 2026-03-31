import { SidebarService } from '../../core/services/sidebar.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  pageTitle: string = '';
  pageSubtitle: string = '';

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService, // حقن AuthService لتسجيل الخروج
    private router: Router, // حقن Router للتعامل مع التنقل
    private activatedRoute: ActivatedRoute, // حقن ActivatedRoute للوصول للروت الحالي
  ) {}

  ngOnInit(): void {
    // 👇 أول مرة (بعد الريفريش)
    this.setPageData();

    // 👇 مع كل navigation بعد كده
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setPageData();
      });
  }

  setPageData(): void {
    let route = this.router.routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const data = route.snapshot.data;

    this.pageTitle = data['title'] || 'لوحة التحكم الرئيسية';
    this.pageSubtitle = data['subtitle'] || '';
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  // دالة تسجيل الخروج
  logoutCurrent() {
    if (confirm('تسجيل الخروج من هذا الجهاز؟')) {
      this.authService.logoutCurrent();
      this.sidebarService.close();
    }
  }

  logoutAll() {
    if (confirm('تسجيل الخروج من جميع الأجهزة؟')) {
      this.authService.logoutAll();
      this.sidebarService.close();
    }
  }

  logoutOthers() {
    if (confirm('تسجيل الخروج من باقي الأجهزة؟')) {
      this.authService.logoutOthers();
    }
  }
}
