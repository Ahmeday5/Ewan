import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../core/services/sidebar.service';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, AfterViewInit {
  isSidebarOpen: boolean = false;
  isCollapsed: boolean = false;
  isMobile = false;

  menuItems: any[] = [];

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService,
     private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.updateMenuItems();
    this.updateSidebarState();

    // استرجاع حالة الـ submenu
    this.menuItems.forEach((section) => {
      section.items?.forEach((item: any) => {
        if (item.submenu && item.label) {
          const saved = localStorage.getItem(`submenu_${item.label}`);
          if (saved !== null) {
            item.isOpen = saved === 'true';
          }
        }
      });
    });

    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      this.isCollapsed = savedCollapsed === 'true';
    }

    this.sidebarService.sidebar$.subscribe((isOpen) => {
      this.isSidebarOpen = isOpen;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile) {
          this.sidebarService.close();
        }
      });
  }

  handleSpecialAction(subItem: any): void {
    if (subItem.key === 'تسجيل الخروج') {
      if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        this.sidebarService.close();
        // logoutCurrent() handles navigation to the correct login page
        // based on userType (admin → /auth/login, owner → /ownerProperties/login)
        this.authService.logoutCurrent();
      }
    }
  }

  closeSidebar() {
    this.sidebarService.close();
  }

  toggleCollapse(): void {
    if (window.innerWidth >= 993) {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
      window.dispatchEvent(new Event('resize'));
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => this.updateSidebarState());
  }

  private updateSidebarState(): void {
    this.isMobile = window.innerWidth <= 992;

    if (this.isMobile) {
      this.isSidebarOpen = false;
      this.isCollapsed = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSubmenu(sectionIndex: number, itemIndex: number): void {
    const section = this.menuItems[sectionIndex];
    if (!section?.items) return;

    const item = section.items[itemIndex];
    if (!item) return;

    item.isOpen = !item.isOpen;

    // حفظ حالة الفتح
    if (item.label) {
      localStorage.setItem(`submenu_${item.label}`, item.isOpen.toString());
    }
  }

  private updateMenuItems(): void {
    // Use the current URL to determine which portal is active.
    // This is reliable because the guard has already validated the route,
    // and this method is only called from ngOnInit (after navigation).
    if (this.router.url.startsWith('/ownerProperties')) {
      this.menuItems = this.getOwnerMenuItems();
    } else {
      this.menuItems = this.getAdminMenuItems();
    }
  }

  private getOwnerMenuItems(): any[] {
    return [
      {
        items: [
          {
            label: 'حجوزاتي',
            path: '/ownerProperties/properties',
            icons: 'fas fa-calendar-check',
            isOpen: false,
          },
        ],
      },
    ];
  }

  private getAdminMenuItems(): any[] {
    return [
      {
        items: [
          {
            label: 'الصفحة الرئيسية',
            path: 'dashboard/mainDashboard',
            icons: 'fas fa-house',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'العقارات',
            path: 'properties/mainProperties',
            icons: 'fas fa-building',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'الحجوزات',
            path: 'bookings/mainBooking',
            icons: 'fas fa-calendar-check',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'المستخدمين',
            path: 'users/mainUsers',
            icons: 'fas fa-users',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'المرافق والخدمات',
            path: 'categories/facilities',
            icons: 'fa-solid fa-layer-group',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'المديرين',
            path: 'admins/admin',
            icons: 'fas fa-users-cog',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'الاسئلة الشائعة',
            path: 'faq/list',
            icons: 'fas fa-question-circle',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'الاشعارات',
            path: 'Notificaion/MainNotificaion',
            icons: 'fas fa-bell',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'بيانات التواصل',
            path: 'contact-us',
            icons: 'fas fa-headset',
            isOpen: false,
          },
        ],
      },
      {
        items: [
          {
            label: 'الشروط والأحكام',
            path: 'terms',
            icons: 'fas fa-file-contract',
            isOpen: false,
          },
        ],
      },
    ];
  }
}
