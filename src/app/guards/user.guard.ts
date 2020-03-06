declare var require: any;

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '../../environments/environment';

const crypto = require('crypto-js');

@Injectable({
  providedIn: 'root'
})

export class UserGuard implements CanActivate {
  private cipher: string;
  private userDataEncrypted: any;
  private userDataDecrypted: any;
  private sessionToken: any;
  private userGroup: string;

  constructor(private router: Router) {
    this.cipher = environment.cipher;
  }

  canActivate() {
    this.userDataEncrypted = localStorage.getItem('udt');
    this.sessionToken = localStorage.getItem('ustk');

    if (this.sessionToken === null || this.sessionToken === undefined) {
      const darkMode = JSON.parse(localStorage.getItem('darkMode')) || 'false';
      window.localStorage.clear();
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      this.router.navigate(['login']);
      return false;
    }

    if (this.userDataEncrypted !== null && this.userDataEncrypted !== undefined) {
      this.userDataDecrypted = JSON.parse(crypto.AES.decrypt(this.userDataEncrypted, this.cipher).toString(crypto.enc.Utf8));
      this.userGroup = this.userDataDecrypted.group;
      if ((this.userGroup !== null && this.userGroup !== undefined)) {
        return true;
      }
    } else {
      this.userDataDecrypted = JSON.parse(crypto.AES.decrypt(this.userDataEncrypted, this.cipher).toString(crypto.enc.Utf8));
      this.userGroup = this.userDataDecrypted.group;
      if ((this.userGroup !== null && this.userGroup !== undefined)) {
        return true;
      }
    }
    return false;
  }
}
