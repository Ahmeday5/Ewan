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
      id = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, id);
    }

    return id;
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
