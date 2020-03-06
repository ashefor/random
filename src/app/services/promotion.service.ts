import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';
import { SecureRandString } from '../utils/rand';

const host = environment.host, fileHost = environment.fileHost;

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  fetchByManufacturer(id: string) {
    const form = new FormData();
    form.append('manufacturer_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/promotion/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          let promotions = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/product/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const products = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const uploads = data.data;
                  promotions.map((promotion) => {
                    promotion.productName = products.find((product) => {
                      return product._id === promotion.product_id;
                    }).name;
                    promotion.image = `${fileHost}${uploads.find((upload) => {
                      return upload._id === products.find((product) => {
                        return product._id === promotion.product_id;
                      }).upload_id;
                    }).path}`;
                    promotion.upload_id !== '-' ? promotion.picture = `${fileHost}${uploads.find((upload: any) => {
                      return upload._id === promotion.upload_id;
                    }).path}` : promotion.picture = null;
                  });
                  promotions = promotions.sort(function(a, b) {
                    const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setPromotions(promotions);
                  resolve();
                } else {
                  reject(data);
                }
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setPromotions([]);
              resolve();
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setPromotions([]);
          resolve();
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByManufacturerLite(id: string) {
    const form = new FormData();
    form.append('manufacturer_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/promotion/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          resolve(data.data);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  create(title: string, description: string, status: string, manufacturer, staff, product, upload?: any) {
    let form = new FormData();
    return new Promise((resolve, reject) => {
      if (upload) {
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            form = new FormData();
            form.append('title', title);
            form.append('description', description);
            form.append('status', status);
            form.append('manufacturer_id', manufacturer);
            form.append('manufacturer_staff_id', staff);
            form.append('product_id', product);
            form.append('trigger', '-');
            form.append('trigger_value', '0');
            form.append('reward', '0');
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/promotion/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (this.validate(data) === true) {
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
      } else {
        form = new FormData();
        form.append('title', title);
        form.append('description', description);
        form.append('status', status);
        form.append('manufacturer_id', manufacturer);
        form.append('manufacturer_staff_id', staff);
        form.append('product_id', product);
        form.append('trigger', '-');
        form.append('trigger_value', '0');
        form.append('reward', '0');
        form.append('upload_id', '-');

        // tslint:disable-next-line
        this.http.post(`${host}/promotion/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (this.validate(data) === true) {
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

  edit(promotion: any, image?: any) {
    let form = new FormData();
    return new Promise((resolve, reject) => {
      if (image) {
        form.append('file', image);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            form = new FormData();
            form.append('_id', promotion._id);
            form.append('title', promotion.title);
            form.append('description', promotion.description);
            form.append('status', promotion.status);
            form.append('manufacturer_id', promotion.manufacturer_id);
            form.append('manufacturer_staff_id', promotion.manufacturer_staff_id);
            form.append('product_id', promotion.product_id);
            form.append('trigger', '-');
            form.append('trigger_value', '0');
            form.append('reward', '0');
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/promotion/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
        form.append('_id', promotion._id);
        form.append('title', promotion.title);
        form.append('description', promotion.description);
        form.append('status', promotion.status);
        form.append('manufacturer_id', promotion.manufacturer_id);
        form.append('manufacturer_staff_id', promotion.manufacturer_staff_id);
        form.append('product_id', promotion.product_id);
        form.append('trigger', '-');
        form.append('trigger_value', '0');
        form.append('reward', '0');
        form.append('upload_id', promotion.upload_id);

        this.http.post(`${host}/promotion/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(promotion) {
    let status;
    if (promotion.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', promotion._id);
      form.append('status', status);
      this.http.post(`${host}/promotion/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  delete(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/promotion/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
}
