import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';
import { Ledger } from '../views/main/ledger/ledger.component';

const host = environment.host;
const fileHost = environment.fileHost;

@Injectable({
  providedIn: 'root'
})
export class LedgerService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  fetchLedgers(owner: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('owner', owner);

      this.http.post(`${host}/ledger/read_by_owner`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const ledgers = data.data;
          ledgers.forEach((ledger: any) => this.humanReadableLedgerTitle(ledger));
          resolve(ledgers);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLedgersByHead(head: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('head', head);

      this.http.post(`${host}/ledger/read_by_head`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const ledgers = data.data;
          ledgers.list.forEach((ledger: any) => this.humanReadableLedgerTitle(ledger));
          resolve(ledgers);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLogs(ledger_id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('ledger_id', ledger_id);
      // tslint:disable-next-line
      this.http.post(`${host}/ledger_log/read_by_ledger`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve(data.data);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchSummary(manufacturer_id: string) {
    let form = new FormData();
    let ledger: Ledger = { balance: -1, incurred: -1, logs: [], paid: -1 };
    return new Promise((resolve, reject) => {
      form.append('user_id', manufacturer_id);
      this.http.post(`${host}/user_account/read_by_user`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const balance = data.data[0].balance;
          form = new FormData();
          form.append('user_account_id', data.data[0]._id);
          this.http.post(`${host}/user_account_log/read_by_user_account`, form, { headers: this.dataHandler.setHeader() })
            // tslint:disable-next-line
            .subscribe((data: any) => {
              if (data.code === 200 && data.data.length !== 0) {
                const logs: Array<any> = data.data;
                const incurred = logs.filter((log) => log.value < 0 ? log : false).reduce((sum, log) => sum + log.value, 0);
                const paid = logs.filter((log) => log.value >= 0 ? log : false).reduce((sum, log) => sum + log.value, 0);
                ledger = { balance, incurred, logs, paid };
                this.cache.setLedger(ledger);
              } else if (data.code === 200 && data.data.length === 0) {
                ledger = { balance: balance, incurred: 0, logs: [], paid: 0 };
                this.cache.setLedger(ledger);
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setLedger(ledger);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchDetails(tag: string) {
    const form = new FormData();
    form.append('order_id', tag);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order_item/read_by_order`, form, { headers: this.dataHandler.setHeader() })
        .subscribe((data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            const items = data.data;
            // tslint:disable-next-line
            this.http.get(`${host}/product/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200 && data.data.length !== 0) {
                const products: Array<any> = data.data;
                items.forEach((item, index) => {
                  item.product = products.find((product) => product._id === item.product_id).name;
                  if (index === items.length - 1) {
                    resolve(items);
                  }
                });
              } else {
                reject(data);
              }
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

  humanReadableLedgerTitle(ledger: any) {
    if (ledger.head === '0001' && ledger.subhead === '0000') {
      ledger.title = 'Wallet';
    } else if (ledger.head === '1000' && ledger.subhead === '0000') {
      ledger.title = 'Suplias';
    } else if (ledger.head === '2000' && ledger.subhead === '0000') {
      ledger.title = 'Tax';
    } else if (ledger.head === '0000' && ledger.subhead === '1000') {
      ledger.title = 'Monies In';
    } else if (ledger.head === '0010' && ledger.subhead === '0000') {
      ledger.title = 'Seller';
    } else if (ledger.head === '4000' && ledger.subhead === '0000') {
      ledger.title = 'Bank';
    } else if (ledger.head === '0000' && ledger.subhead === '0100') {
      ledger.title = 'Out (General)';
    } else if (ledger.head === '3000' && ledger.subhead === '0000') {
      ledger.title = 'Airtime Credit';
    } else if (ledger.head === '0100' && ledger.subhead === '0000') {
      ledger.title = 'Manufacturer';
    } else { ledger.title = 'Uncategorized'; }
  }
}
