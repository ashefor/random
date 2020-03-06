import { Injectable } from '@angular/core';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';
import { environment } from 'src/environments/environment';
import { Billing } from '../interfaces/billing';
import { HttpClient } from '@angular/common/http';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  create(billing: Billing) {
    const form = new FormData();
    form.append('title', billing.title);
    form.append('code', billing.code);
    form.append('minimum', `${billing.minimum}`);
    form.append('maximum', `${billing.maximum}`);
    form.append('status', billing.status);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/billing/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/billing/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          if (data.data.length !== 0) {
            const billings = data.data;
            // tslint:disable-next-line
            this.http.get(`${host}/instruction/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                billings.map((billing) => {
                  billing.instructions = data.data.filter((instruction) => instruction.billing_id === billing._id).length;
                });
                this.cache.billings.next(billings.sort((a, b) => {
                  const [A, B] = [a.created, b.created];
                  if (A > B) {
                    return 1;
                  }
                  if (A < B) {
                    return -1;
                  }
                  return 0;
                }));
                resolve(billings);
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            this.cache.billings.next([]);
            resolve([]);
          }
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
      this.http.post(`${host}/billing/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(billing: Billing) {
    const form = new FormData();
    form.append('_id', billing._id);
    form.append('title', billing.title);
    form.append('code', billing.code);
    form.append('minimum', `${billing.minimum}`);
    form.append('maximum', `${billing.maximum}`);
    form.append('status', billing.status);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/billing/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(billing: Billing) {
    let status;
    billing.status === 'active' ? status = 'inactive' : status = 'active';

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', billing._id);
      form.append('status', status);
      this.http.post(`${host}/billing/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchBillingByCode(code: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/billing/read_by_code?code=${code}`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve(data.data[0]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }
}
