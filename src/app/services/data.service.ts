declare var require: any;
import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';

const crypto = require('crypto-js');

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {
  private cipher;

  constructor() {
    this.cipher = environment.cipher;
  }

  encrypt(obj: any) {
    return crypto.AES.encrypt(JSON.stringify(obj), this.cipher).toString().replace(/\//g, '*');
  }

  decrypt(objString: string) {
    objString = objString.replace(/\*/g, '/');
    console.log(objString);
    return JSON.parse(crypto.AES.decrypt(objString, this.cipher).toString(crypto.enc.Utf8));
  }

  encryptAlt(obj: any) {
    return crypto.AES.encrypt(JSON.stringify(obj), this.cipher).toString();
  }

  decryptAlt(objString: string) {
    return JSON.parse(crypto.AES.decrypt(objString, this.cipher).toString(crypto.enc.Utf8));
  }

  setUserSession(token: string) {
    const cipherText: string = crypto.AES.encrypt(JSON.stringify(token), this.cipher).toString();
    localStorage.setItem('ustk', cipherText);
  }

  setUserData(data: any) {
    const cipherText: string = crypto.AES.encrypt(JSON.stringify(data), this.cipher).toString();
    localStorage.setItem('udt', cipherText);
  }

  getUserSession() {
    const ustk = localStorage.getItem('ustk');
    return crypto.AES.decrypt(ustk, this.cipher).toString(crypto.enc.Utf8).replace(/\"/g, '');
  }

  getUserData() {
    let udt = localStorage.getItem('udt');
    udt = crypto.AES.decrypt(udt, this.cipher).toString(crypto.enc.Utf8);
    const _udt = JSON.parse(udt);
    return (_udt);
  }

  getDashboardLink() {
    const udt = this.getUserData(), group = udt['group'];
    let link: string;
    switch (group) {
      case 'admin':
        link = 'admin/dashboard';
        break;
      default:
        break;
    }
    return link;
  }

  setHeader() {
    const header: any = {};
    header['user_session_token'] = this.getUserSession();
    return header;
  }
}
