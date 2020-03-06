import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';
import { SecureRandString } from '../utils/rand';

const host = environment.host;
const fileHost = environment.fileHost;

@Injectable({
  providedIn: 'root'
})
export class ManufacturerService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(name: string, email: string, address: string, status: string, upload: any) {
    let form = new FormData();
    form.append('file', upload);
    form.append('tag', email);
    form.append('title', SecureRandString());
    form.append('overwrite', 'true');

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
        if (this.validate(data) === true) {
          form = new FormData();
          form.append('name', name);
          form.append('email', email);
          form.append('address', address);
          form.append('status', status);
          form.append('upload_id', data.data);
          form.append('user_id', this.getUserId());

          // tslint:disable-next-line
          this.http.post(`${host}/manufacturer/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              resolve();
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

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let manufacturers = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/brand/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const brands = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  const uploads = data.data;
                  manufacturers.map((manufacturer) => {
                    manufacturer.brandCount = brands.filter(brand => {
                      return brand.manufacturer_id === manufacturer._id;
                    }).length;
                    manufacturer.image = `${fileHost}${uploads.find((upload) => {
                      return upload._id === manufacturer.upload_id;
                    }).path}`;
                  });
                  manufacturers = manufacturers.sort(function(a, b) {
                    const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setManufacturers(manufacturers);
                  resolve(manufacturers);
                } else if (data.code === 200 && data.data.length === 0) {
                  this.cache.setManufacturers([]);
                  resolve([]);
                } else {
                  reject(data);
                }
              });
            }
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setManufacturers([]);
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchOne(id: string, header: any) {
    let form = new FormData();
    form.append('_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/manufacturer/read`, form, { headers: header }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const manufacturers = data.data;
          manufacturers.forEach((manufacturer, index) => {
            form = new FormData();
            form.append('_id', manufacturer.upload_id);

            // tslint:disable-next-line
            this.http.post(`${host}/upload/read`, form, { headers: header }).subscribe((data: any) => {
              if (this.validate(data) === true) {
                manufacturer.image = `${fileHost}${data.data[0].path}`;
                if (index === manufacturers.length - 1) {
                  resolve(manufacturers);
                }
              }
            });
          });
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLite() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          this.cache.manufacturer_lite.next(data.data.sort(function(a, b) {
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

  delete(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/manufacturer/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_manufacturer: any, image) {
    return new Promise((resolve, reject) => {
      if (image !== null) {
        let form = new FormData();
        form.append('file', image);
        form.append('tag', _manufacturer.email);
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            console.log(data.data);
            form = new FormData();
            form.append('_id', _manufacturer._id);
            form.append('name', _manufacturer.name);
            form.append('email', _manufacturer.email);
            form.append('address', _manufacturer.address);
            form.append('status', _manufacturer.status);
            form.append('upload_id', data.data);
            form.append('user_id', this.getUserId());

          // tslint:disable-next-line
          this.http.post(`${host}/manufacturer/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            console.log(data);
            if (data.code === 200) {
              resolve();
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
          }
        });
      } else {
        const form = new FormData();
        form.append('_id', _manufacturer._id);
        form.append('name', _manufacturer.name);
        form.append('email', _manufacturer.email);
        form.append('address', _manufacturer.address);
        form.append('status', _manufacturer.status);
        form.append('upload_id', _manufacturer.upload_id);
        form.append('user_id', this.getUserId());

      // tslint:disable-next-line
      this.http.post(`${host}/manufacturer/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
      }
    });
  }

  toggleStatus(_manufacturer) {
    let status;
    if (_manufacturer.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _manufacturer._id);
      form.append('status', status);
      this.http.post(`${host}/manufacturer/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  getUserId() {
    const userData = this.dataHandler.getUserData();
    return userData._id;
  }
}
