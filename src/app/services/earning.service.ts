import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class EarningService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(trigger: string, is_percentage: string, amount: number, seller_id: string) {
    const form = new FormData();
    form.append('trigger', trigger);
    form.append('is_percentage', is_percentage);
    form.append('amount', `${amount}`);
    form.append('seller_id', seller_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/earning/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/earning/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          let earnings: Array<any> = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const sellers = data.data;
              earnings.map((earning) => {
                earning.sellerName = sellers.find((seller) => {
                  return seller._id === earning.seller_id;
                }).name;
              });
              earnings = earnings.sort(function(a, b) {
                const A = a.sellerName.toLowerCase(), B = b.sellerName.toLowerCase();
                if (A < B) {
                  return -1;
                }
                if (A > B) {
                  return 1;
                }
                return 0;
              });
              this.cache.setEarnings(earnings);
              resolve(earnings);
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setEarnings([]);
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setEarnings([]);
          resolve([]);
        } else {
          reject(data);
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

      this.http.post(`${host}/earning/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_earning: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _earning._id);
      form.append('trigger', _earning.trigger);
      form.append('is_percentage', _earning.is_percentage);
      form.append('amount', `${_earning.amount}`);
      form.append('seller_id', _earning.seller_id);

      this.http.post(`${host}/earning/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(_earning) {
    let status;
    if (_earning.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _earning._id);
      form.append('status', status);
      this.http.post(`${host}/earning/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Toggle failed!'});
        }
      }, () => {
        reject({message: 'Toggle failed!'});
      });
    });
  }
}
