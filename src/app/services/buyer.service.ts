import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class BuyerService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  fetchBuyers() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/location/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const locations = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/store_type/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const stores = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  let buyers = data.data;
                  buyers.map((buyer) => {
                    buyer.store = stores.find(store => {
                      return store._id === buyer.store_type_id;
                    }).name;
                    buyer.location = locations.find(location => {
                      return location._id === buyer.location_id;
                    }).name;
                  });
                  buyers = buyers.sort(function (a, b) {
                    const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setBuyers(buyers);
                  resolve(buyers);
                } else if (data.code === 200 && data.data.length === 0) {
                  this.cache.setBuyers([]);
                  resolve([]);
                }
              }, error => {
                reject(error);
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setBuyers([]);
              resolve([]);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setBuyers([]);
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLite() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          this.cache.buyer_lite.next(data.data.sort(function (a, b) {
            const A = a.name.toLowerCase(), B = b.name.toLowerCase();
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          }));
          resolve(data.data);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchSingleBuyer(buyerId: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', buyerId);
      this.http.post(`${host}/buyer/read_details`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const buyer = data.data;
          this.cache.saveSingleBuyer(buyer);
          resolve(buyer);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }
}
