import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(code: string, manufacturer_id: string, user_id: string) {
    console.log([code, manufacturer_id, user_id]);
    const form = new FormData();
    form.append('code', code);
    form.append('manufacturer_id', manufacturer_id);
    form.append('user_id', user_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/feature/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
      this.http.get(`${host}/feature/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          let features = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const manufacturers = data.data;
              features.map((feature) => {
                feature.manufacturerName = manufacturers.find((mft) => mft._id === feature.manufacturer_id).name;
              });
              features = features.sort(function(a, b) {
                const A = a.manufacturerName, B = b.manufacturerName;
                if (A > B) {
                  return -1;
                }
                if (A < B) {
                  return 1;
                }
                return 0;
              });
              this.cache.setFeatures(features);
              resolve(features);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setFeatures([]);
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

      this.http.post(`${host}/feature/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_feature: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _feature._id);
      form.append('code', _feature.code);
      form.append('manufacturer_id', _feature.manufacturer_id);
      form.append('user_id', _feature.user_id);

      this.http.post(`${host}/feature/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
      this.http.post(`${host}/feature/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
