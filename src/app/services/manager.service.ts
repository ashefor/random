import { Injectable } from '@angular/core';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(phone: string, name: string, email: string, status: string, hash: string) {
    const form = new FormData();
    form.append('phone', phone);
    form.append('name', name);
    form.append('email', email);
    form.append('status', status);
    form.append('hash', hash);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/manager/signup`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
      this.http.get(`${host}/manager/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const managers = data.data.sort(function(a, b) {
            const A = a.name.toLowerCase(), B = b.name.toLowerCase();
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.cache.setAccountManagers(managers);
          resolve(managers);
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setAccountManagers([]);
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

      this.http.post(`${host}/manager/remove`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(manager: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', manager._id);
      form.append('phone', manager.phone);
      form.append('name', manager.name);
      form.append('email', manager.email);
      form.append('status', manager.status);
      form.append('user_id', manager.user_id);

      this.http.post(`${host}/manager/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(manager) {
    let status;
    if (manager.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', manager._id);
      form.append('status', status);
      this.http.post(`${host}/manager/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
