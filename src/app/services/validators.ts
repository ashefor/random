import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  emailValidator(value) {
    const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(value);

    if (re) {
        return true;
    }

    return false;
  }

  phoneValidator(phone: string) {
    if (phone !== '') {
      if (phone.length < 11) {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }
}
