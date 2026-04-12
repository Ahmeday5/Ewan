import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { StoredUser } from '../../features/auth/models/login.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  pageTitle = '';
  pageSubtitle = '';

  /** True when the current URL belongs to the owner portal. */
  isOwnerPortal = false;

  /**
   * Observable for the active portal's user.
   * Reassigned on every NavigationEnd so the async pipe always reflects
   * the correct session without needing two separate template bindings.
   */
  activeUser$!: Observable<StoredUser | null>;

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.activeUser$ = this.authService.adminCurrentUser$;
  }

  ngOnInit(): void {
    // Sync state immediately (covers hard refresh / direct URL load).
    this.syncPortalState();

    // Re-sync on every navigation so the header stays correct when
    // the user moves between portals.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncPortalState();
        this.setPageData();
      });
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  // ── Admin logout actions ──────────────────────────────────────

  logoutCurrent(): void {
    if (confirm('تسجيل الخروج من هذا الجهاز؟')) {
      this.authService.logoutCurrent();
      this.sidebarService.close();
    }
  }

  logoutAll(): void {
    if (confirm('تسجيل الخروج من جميع الأجهزة؟')) {
      this.authService.logoutAll();
      this.sidebarService.close();
    }
  }

  logoutOthers(): void {
    if (confirm('تسجيل الخروج من باقي الأجهزة؟')) {
      this.authService.logoutOthers();
    }
  }

  // ── Owner logout action ───────────────────────────────────────

  ownerLogout(): void {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      this.authService.ownerLogout();
      this.sidebarService.close();
    }
  }

  // ── Private ───────────────────────────────────────────────────

  private syncPortalState(): void {
    this.isOwnerPortal = this.router.url.startsWith('/ownerProperties');

    // Bind the async pipe to the correct session observable.
    this.activeUser$ = this.isOwnerPortal
      ? this.authService.ownerCurrentUser$
      : this.authService.adminCurrentUser$;

    this.setPageData();
  }

  private setPageData(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) route = route.firstChild;

    const data = route.snapshot.data;
    this.pageTitle = data['title'] || 'لوحة التحكم الرئيسية';
    this.pageSubtitle = data['subtitle'] || '';
  }
}
