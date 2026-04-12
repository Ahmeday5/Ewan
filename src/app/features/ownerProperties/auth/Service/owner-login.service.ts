import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { StoredUser } from '../../../auth/models/login.model';

@Injectable({ providedIn: 'root' })
export class OwnerLoginService {
  private auth = inject(AuthService);

  login(phoneNumber: string, password: string): Promise<StoredUser> {
    return this.auth.ownerLogin(phoneNumber, password);
  }
}
