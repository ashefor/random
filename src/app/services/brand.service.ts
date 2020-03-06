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
export class BrandService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(name: string, status: string, manufacturerId: string, upload: any) {
    let form = new FormData();
    form.append('file', upload);
    form.append('tag', SecureRandString());
    form.append('title', SecureRandString());
    form.append('overwrite', 'true');

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
        if (this.validate(data) === true) {
          form = new FormData();
          form.append('name', name);
          form.append('status', status);
          form.append('manufacturer_id', manufacturerId);
          form.append('upload_id', data.data);

          // tslint:disable-next-line
          this.http.post(`${host}/brand/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
    });
  }

  uploadBulk(products: Array<any>, brand_id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      products.forEach((product, index) => {
        form.append('brand_id[]', brand_id);
        form.append('sku_id[]', product.sku_id);
        form.append('name[]', product.name);
        form.append('description[]', product.description);
        form.append('case_count[]', product.case_count);
        form.append('weight[]', '0');
        form.append('size[]', '0');
        form.append('mpu[]', product.mpu);
        form.append('price[]', product.price);
        if (index === products.length - 1) {
          this.http.post(`${host}/product/create_bulk`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
    });
  }

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/brand/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let brands = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const uploads = data.data;
              // brand.image = `${fileHost}${data.data[0].path}`;

              // tslint:disable-next-line
              this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  const manufacturers = data.data;
                  // brand.manufacturer = data.data[0].name;
                  // form = new FormData();
                  // form.append('brand_id', brand._id);
                  // tslint:disable-next-line
                  this.http.get(`${host}/product/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200) {
                      const products: Array<any> = data.data;
                      brands.map((brand) => {
                        brand.image = `${fileHost}${uploads.find((upload: any) => {
                          return upload._id === brand.upload_id;
                        }).path}`;
                        brand.products = products.filter((product) => product.brand_id === brand._id).length;
                        brand.manufacturer = manufacturers.find((manufacturer) => {
                          return manufacturer._id === brand.manufacturer_id;
                        }).name;
                      });
                      brands = brands.sort(function(a, b) {
                        const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                        if (A < B) {
                          return -1;
                        }
                        if (A > B) {
                          return 1;
                        }
                        return 0;
                      });
                      this.cache.setBrands(brands);
                      resolve();
                    } else {
                      reject(data);
                    }
                  });
                } else if (data.code === 200 && data.data.length === 0) {
                  this.cache.setBrands([]);
                  resolve();
                } else {
                  reject(data);
                }
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setBrands([]);
              resolve();
            } else {
              reject(data);
            }
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setBrands([]);
          resolve();
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
      this.http.get(`${host}/brand/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const brands = data.data;
          resolve(brands);
        } else if (data.code === 200 && data.data.length === 0) {
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

      this.http.post(`${host}/brand/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_brand: any, image) {
    return new Promise((resolve, reject) => {
      if (image !== null) {
        let form = new FormData();
        form.append('file', image);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            console.log(data.data);
            form = new FormData();
            form.append('_id', _brand._id);
            form.append('name', _brand.name);
            form.append('status', _brand.status);
            form.append('manufacturer_id', _brand.manufacturer_id);
            form.append('upload_id', data.data);

          // tslint:disable-next-line
          this.http.post(`${host}/brand/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
        form.append('_id', _brand._id);
        form.append('name', _brand.name);
        form.append('status', _brand.status);
        form.append('manufacturer_id', _brand.manufacturer_id);
        form.append('upload_id', _brand.upload_id);

      // tslint:disable-next-line
      this.http.post(`${host}/brand/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(_brand) {
    let status;
    if (_brand.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _brand._id);
      form.append('name', _brand.name);
      form.append('manufacturer_id', _brand.manufacturer_id);
      form.append('status', status);
      form.append('upload_id', _brand.upload_id);
      this.http.post(`${host}/brand/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchByManufacturer(manufacturer_id) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('manufacturer_id', manufacturer_id);
      this.http.post(`${host}/brand/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let brands = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const uploads = data.data;
              // brand.image = `${fileHost}${data.data[0].path}`;

              // tslint:disable-next-line
              this.http.get(`${host}/product/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const products: Array<any> = data.data;
                  brands.map((brand) => {
                    brand.image = `${fileHost}${uploads.find((upload: any) => {
                      return upload._id === brand.upload_id;
                    }).path}`;
                    brand.products = products.filter((product) => product.brand_id === brand._id).length;
                  });
                  brands = brands.sort(function(a, b) {
                    const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setBrands(brands);
                  resolve();
                } else {
                  reject(data);
                }
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setBrands([]);
              resolve();
            } else {
              reject(data);
            }
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setBrands([]);
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLiteByManufacturer(manufacturer_id) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('manufacturer_id', manufacturer_id);
      this.http.post(`${host}/brand/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const brands = data.data;
          resolve(brands);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }
}
