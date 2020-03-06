import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class StoreTypeService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(name: string, description: string, status: string) {
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('status', status);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/store_type/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
      this.http.get(`${host}/store_type/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const storeTypes = data.data.sort(function(a, b) {
            const A = a.name.toLowerCase(), B = b.name.toLowerCase();
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.cache.setStores(storeTypes);
          resolve(storeTypes);
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setStores([]);
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

      this.http.post(`${host}/store_type/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(store_type: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', store_type._id);
      form.append('name', store_type.name);
      form.append('description', store_type.description);
      form.append('status', store_type.status);

      this.http.post(`${host}/store_type/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(store_type) {
    let status;
    if (store_type.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', store_type._id);
      form.append('status', status);
      this.http.post(`${host}/store_type/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
