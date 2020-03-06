import { Injectable } from '@angular/core';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { ManufacturerService } from './manufacturer.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class ManufacturerPartyService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService,
    private manufacturer: ManufacturerService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(phone: string, name: string, email: string, status: string, manufacturerId: string, hash: string) {
    const form = new FormData();
    form.append('phone', phone);
    form.append('name', name);
    form.append('email', email);
    form.append('status', status);
    form.append('manufacturer_id', manufacturerId);
    form.append('hash', hash);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/manufacturer_party/signup`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (this.validate(data) === true) {
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetch() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const manufacturers = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/manufacturer_party/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              let parties = data.data;
              parties.forEach((party, index) => {
                party.manufacturer = manufacturers.find(manufacturer => {
                  return manufacturer._id === party.manufacturer_id;
                }).name;
                if (index === parties.length - 1) {
                  parties = parties.sort(function(a, b) {
                    const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setManufacturerStaff(parties);
                  resolve(parties);
                }
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setManufacturerStaff([]);
              resolve([]);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setManufacturerStaff([]);
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  delete(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/manufacturer_party/remove`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Delete failed'});
        }
      }, error => {
        reject({message: 'Delete failed'});
      });
    });
  }

  edit(manufacturer_party: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', manufacturer_party._id);
      form.append('phone', manufacturer_party.phone);
      form.append('name', manufacturer_party.name);
      form.append('email', manufacturer_party.email);
      form.append('status', manufacturer_party.status);
      form.append('manufacturer_id', manufacturer_party.manufacturer_id);
      form.append('user_id', manufacturer_party.user_id);

      this.http.post(`${host}/manufacturer_party/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  toggleStatus(manufacturer_party) {
    let status;
    if (manufacturer_party.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', manufacturer_party._id);
      form.append('status', status);
      this.http.post(`${host}/manufacturer_party/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Toggle failed!'});
        }
      }, error => {
        reject({message: 'Toggle failed!'});
      });
    });
  }
}
