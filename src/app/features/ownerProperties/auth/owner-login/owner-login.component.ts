import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OwnerLoginService } from '../Service/owner-login.service';

@Component({
  selector: 'app-owner-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-login.component.html',
  styleUrl: './owner-login.component.scss',
})
export class OwnerLoginComponent {
  phoneNumber = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private ownerLoginService: OwnerLoginService,
    private router: Router,
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = null;

    if (!form.valid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      await this.ownerLoginService.login(this.phoneNumber, this.password);
      await this.router.navigate(['/ownerProperties/properties']);
    } catch (err: any) {
      this.errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة';
    } finally {
      this.isLoading = false;
    }
  }
}
