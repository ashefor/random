import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class FeeService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(manufacturer_id: string, user_id: string, value: number, seller_id: string) {
    const form = new FormData();
    form.append('value', `${value}`);
    form.append('manufacturer_id', manufacturer_id);
    form.append('user_id', user_id);
    form.append('seller_id', seller_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/fee/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
      this.http.get(`${host}/fee/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let fees: Array<any> = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const sellers = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  const manufacturers = data.data;
                  // tslint:disable-next-line
                  this.http.get(`${host}/user_account/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200 && data.data.length !== 0) {
                      const accounts = data.data;
                      fees.map(async (fee) => {
                        fee.seller = sellers.find((seller) => {
                          return seller._id === fee.seller_id;
                        }).name;
                        const maker = manufacturers.find((manufacturer) => {
                          return manufacturer._id === fee.manufacturer_id;
                        });
                        fee.manufacturer = maker.name;
                        const user_account = await accounts.find((account) => {
                          return account.user_id === fee.manufacturer_id;
                        });
                        if (Number(user_account.balance) >= 0) {
                          fee.outstanding = 0;
                        } else {
                          fee.outstanding = -1 * Number(user_account.balance);
                        }
                      });
                      fees = fees.sort(function(a, b) {
                        const A = a.seller.toLowerCase(), B = b.seller.toLowerCase();
                        if (A < B) {
                          return -1;
                        }
                        if (A > B) {
                          return 1;
                        }
                        return 0;
                      });
                      this.cache.setFees(fees);
                      resolve(fees);
                    } else if (data.code === 200 && data.data.length === 0) {
                      this.cache.setFees([]);
                      resolve([]);
                    } else {
                      reject(data);
                    }
                  }, error => {
                    reject(error);
                  });
                } else if (data.code === 200 && data.data.length === 0) {
                  this.cache.setFees([]);
                  resolve([]);
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setFees([]);
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setFees([]);
          resolve([]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLite() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/fee/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          resolve(data.data);
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

  delete(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/fee/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_fee: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _fee._id);
      form.append('value', `${_fee.value}`);
      form.append('manufacturer_id', _fee.manufacturer_id);
      form.append('user_id', _fee.user_id);
      form.append('seller_id', _fee.seller_id);

      this.http.post(`${host}/fee/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(_fee) {
    let status;
    if (_fee.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _fee._id);
      form.append('status', status);
      this.http.post(`${host}/fee/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  payDues(manufacturer_id: string, cost: any) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      form.append('user_id', manufacturer_id);
      this.http.post(`${host}/user_account/read_by_user`, form, { headers: this.dataHandler.setHeader() })
        // tslint:disable-next-line
        .subscribe((data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            form = new FormData();
            form.append('user_account_id', data.data[0]._id);
            form.append('value', `${cost}`);
            form.append('description', `Payment of fee owed`);
            form.append('tag', '-');
            this.http.post(`${host}/user_account_log/deposit`, form, { headers: this.dataHandler.setHeader() })
              // tslint:disable-next-line
              .subscribe((data: any) => {
                console.log(data);
                if (data.code === 200) {
                  resolve();
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
          } else {
            resolve();
          }
        }, error => {
          reject(error);
        });
    });
  }
}
