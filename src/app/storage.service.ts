import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private localStorage = window.localStorage;
  private sessionStorage = window.sessionStorage;

  constructor() { }

  getValue(name: string, storageType: string): string {
    if (storageType === "local") {
      return localStorage.getItem(name);
    } else if (storageType === "session") {
      return sessionStorage.getItem(name);
    }
  }

  setValue(name: string, value: string, storageType: string): void {
    if (storageType === "local") {
      localStorage.setItem(name,value);
    } else if (storageType === "session") {
      sessionStorage.setItem(name,value);
    }
  }

  deleteValue(name: string, storageType: string): void {
    if (storageType === 'local') {
      localStorage.removeItem(name);
    } else if (storageType === 'session') {
      sessionStorage.removeItem(name);
    }
  }
}
