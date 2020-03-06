import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class CodeService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(code: string, status: string, seller_id: string) {
    const form = new FormData();
    form.append('code', code);
    form.append('status', status);
    form.append('seller_id', seller_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_code/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll(seller_id: string) {
    const form = new FormData();
    form.append('seller_id', seller_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_code/read_by_seller`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          let codes = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller_referral/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const referrals = data.data;
              codes.map((code) => {
                code.referralCount = referrals.filter((referral) => referral.seller_code_id === code._id).length;
              });
              codes = codes.sort(function(a, b) {
                const A = a.created, B = b.created;
                if (A > B) {
                  return -1;
                }
                if (A < B) {
                  return 1;
                }
                return 0;
              });
              this.cache.setCodes(codes);
              resolve(codes);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setCodes([]);
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

      this.http.post(`${host}/seller_code/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_code: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _code._id);
      form.append('code', _code.code);
      form.append('status', _code.status);
      form.append('seller_id', _code.seller_id);

      this.http.post(`${host}/seller_code/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(_code) {
    let status;
    if (_code.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _code._id);
      form.append('status', status);
      this.http.post(`${host}/seller_code/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  getReferrals(code_id: string) {
    const form = new FormData();
    form.append('seller_code_id', code_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_referral/read_by_seller_code`, form, { headers: this.dataHandler.setHeader() })
        .subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const referrals = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const buyers = data.data;
              referrals.map((referral) => {
                referral.buyer = buyers.find((buyer) => {
                  return buyer._id === referral.buyer_id;
                }).name;
              });
              resolve(referrals);
            } else if (data.code === 200 && data.data.length !== 0) {
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }
}
