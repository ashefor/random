import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})

export class SellerAreaService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(phone: string, status: string, manufacturer_id: string, seller_id: string, area_id: string) {
    const form = new FormData();
    form.append('phone', phone);
    form.append('status', status);
    form.append('manufacturer_id', manufacturer_id);
    form.append('seller_id', seller_id);
    form.append('area_id', area_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_area/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll(id: string) {
    const form = new FormData();
    form.append('seller_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_area/read_by_seller`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetch() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/seller_area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const seller_areas: any[] = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const areas = data.data;
              seller_areas.map((SA) => {
                SA.area = areas.find(area => area._id === SA.area_id).name;
              });
              resolve(seller_areas);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
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

      this.http.post(`${host}/seller_area/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(seller_area: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', seller_area._id);
      form.append('phone', seller_area.phone);
      form.append('status', seller_area.status);
      form.append('manufacturer_id', seller_area.manufacturer_id);
      form.append('seller_id', seller_area.seller_id);
      form.append('area_id', seller_area.area_id);

      this.http.post(`${host}/seller_area/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(seller_area) {
    let status;
    if (seller_area.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', seller_area._id);
      form.append('status', status);
      this.http.post(`${host}/seller_area/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchSeller(seller_id: string) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      form.append('_id', seller_id);

      this.http.post(`${host}/seller/read`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          if (data.data.length > 0) {
            const seller = data.data[0];

            form = new FormData();
            form.append('manufacturer_id', seller.manufacturer_id);
            this.http.post(`${host}/area/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data1: any) => {
              if (data1.code === 200) {
                const areas = data1.data.sort(function(a, b) {
                  const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                  if (A < B) {
                    return -1;
                  }
                  if (A > B) {
                    return 1;
                  }
                  return 0;
                });
                resolve({ seller, areas });
              } else {
                reject(data);
              }
            }, error => reject(error));
          } else {
            reject({ message: 'Unable to find seller'});
          }
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }
}
