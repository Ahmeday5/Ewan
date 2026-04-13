import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  readonly toasts$      = inject(ToastService).toasts$;
  readonly toastService = inject(ToastService);
  readonly sidebarService = inject(SidebarService);
  readonly isSidebarOpen$ = this.sidebarService.sidebar$;

  ngOnInit(): void {
    this.updateAppHeight();
    window.addEventListener('resize', this.updateAppHeight);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateAppHeight);
  }

  // Sets --app-height to the real inner-window height so that
  // mobile browsers (iOS Safari) use the correct visible viewport
  // instead of the unreliable 100vh which includes hidden chrome.
  private readonly updateAppHeight = (): void => {
    document.documentElement.style.setProperty(
      '--app-height',
      `${window.innerHeight}px`,
    );
  };
}
