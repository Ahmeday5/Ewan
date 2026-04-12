import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor() {}
  private DEVICE_KEY = 'deviceInfo';
  private DEVICE_ID_KEY = 'deviceId';

  // ✅ يرجع الديفايس (ولو مش موجود يعمله)
  getDeviceInfo(): string {
    let info = localStorage.getItem(this.DEVICE_KEY);

    if (!info) {
      info = this.generateDeviceInfo();
      localStorage.setItem(this.DEVICE_KEY, info);
    }

    return info;
  }

  // ✅ deviceId ثابت
  getDeviceId(): string {
    let id = localStorage.getItem(this.DEVICE_ID_KEY);

    if (!id) {
      id = this.generateUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, id);
    }

    return id;
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback for non-secure contexts (HTTP)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // 🔥 توليد البيانات
  private generateDeviceInfo(): string {
    return `
      Platform: ${navigator.platform}
      UserAgent: ${navigator.userAgent}
      Language: ${navigator.language}
    `;
  }

  // ❌ مسح عند اللوج اوت
  clearDeviceData() {
    localStorage.removeItem(this.DEVICE_KEY);
  }
}
