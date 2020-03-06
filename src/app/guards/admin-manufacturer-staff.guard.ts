declare var require: any;

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '../../environments/environment';

const crypto = require('crypto-js');

@Injectable({
  providedIn: 'root'
})

export class AdminManufacturerStaffGuard implements CanActivate {
  private cipher: string;
  private userDataEncrypted: any;
  private userDataDecrypted: any;
  private sessionToken: any;
  private userGroup: string;

  constructor(router: Router) {
    this.cipher = environment.cipher;
    this.userDataEncrypted = localStorage.getItem('udt');
    this.sessionToken = localStorage.getItem('ustk');

    if (this.sessionToken === null || this.sessionToken === undefined) {
      const darkMode = JSON.parse(localStorage.getItem('darkMode')) || 'false';
      window.localStorage.clear();
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      router.navigate(['login']);
    }

    if (this.userDataEncrypted !== null && this.userDataEncrypted !== undefined) {
      this.userDataDecrypted = JSON.parse(crypto.AES.decrypt(this.userDataEncrypted, this.cipher).toString(crypto.enc.Utf8));
      this.userGroup = this.userDataDecrypted.group;
    } else {
      this.userGroup = null;
    }
  }

  canActivate() {
    if (this.userGroup === null || this.userGroup === undefined) {
      return false;
    }
    if (this.userGroup !== null && this.userGroup !== undefined) {
      console.log(this.userGroup);
      if (this.userGroup === 'admin' || this.userGroup === 'manufacturer_staff') {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
