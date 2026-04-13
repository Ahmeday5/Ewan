import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingCount = 0;

  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  show() {
    this.loadingCount++;
    queueMicrotask(() => {
      // بياجل تنفيذ اللودينج لحد مال اليو اي بتاع الانجلر يترسم
      this._loading.next(true);
    });
  }

  hide() {
    this.loadingCount--;

    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      queueMicrotask(() => {
        this._loading.next(false);
      });
    }
  }
}
