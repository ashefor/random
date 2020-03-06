import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { SecureRandString } from '../utils/rand';

const host = environment.host;
const fileHost = environment.fileHost;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(sku_id: string, name: string, description: string, case_count: any, mpu: any, status: string,
    brandId: string, price: any, upload: any) {
    let form = new FormData();
    form.append('file', upload);
    form.append('tag', SecureRandString());
    form.append('title', SecureRandString());
    form.append('overwrite', 'true');

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
        if (this.validate(data) === true) {
          form = new FormData();
          form.append('sku_id', sku_id);
          form.append('name', name);
          form.append('description', description);
          form.append('case_count', case_count);
          form.append('weight', '0');
          form.append('size', '0');
          form.append('mpu', mpu);
          form.append('status', status);
          form.append('brand_id', brandId);
          form.append('price', String(price));
          form.append('upload_id', data.data);

          // tslint:disable-next-line
          this.http.post(`${host}/product/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/product/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const products = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const uploads = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/brand/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  const brands = data.data;
                  products.map((product) => {
                    product.image = `${fileHost}${uploads.find((upload) => {
                      return upload._id === product.upload_id;
                    }).path}`;
                    product.brand = brands.find((brand) => {
                      return brand._id === product.brand_id;
                    }).name;
                  });
                  resolve(products);
                } else if (data.code === 200 && data.data.length === 0) {
                  resolve([]);
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else if (data.code === 200 && data.data.length === 0) {
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
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

  fetchByManufacturerLite(manufacturer_id: string) {
    const form = new FormData();
    form.append('manufacturer_id', manufacturer_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/product/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          const products = data.data;
          resolve(products);
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
      this.http.get(`${host}/product/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          const products = data.data;
          resolve(products);
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

      this.http.post(`${host}/product/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_product: any, image) {
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
            form.append('_id', _product._id);
            form.append('sku_id', _product.sku_id);
            form.append('name', _product.name);
            form.append('description', _product.description);
            form.append('case_count', _product.case_count);
            form.append('weight', _product.weight);
            form.append('size', _product.size);
            form.append('mpu', _product.mpu);
            form.append('status', _product.status);
            form.append('brand_id', _product.brand_id);
            form.append('price', _product.price);
            form.append('upload_id', data.data);

          // tslint:disable-next-line
          this.http.post(`${host}/product/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
        console.log('no image');
        const form = new FormData();
        form.append('_id', _product._id);
        form.append('sku_id', _product.sku_id);
        form.append('name', _product.name);
        form.append('description', _product.description);
        form.append('case_count', _product.case_count);
        form.append('weight', _product.weight);
        form.append('size', _product.size);
        form.append('mpu', _product.mpu);
        form.append('status', _product.status);
        form.append('brand_id', _product.brand_id);
        form.append('price', _product.price);
        form.append('upload_id', _product.upload_id);

      // tslint:disable-next-line
      this.http.post(`${host}/product/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(_product) {
    let status;
    if (_product.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _product._id);
      form.append('status', status);
      this.http.post(`${host}/product/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchByBrand(brand_id) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('brand_id', brand_id);
      this.http.post(`${host}/product/read_by_brand`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const products = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const uploads = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/brand/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  const brands = data.data;
                  products.map((product) => {
                    product.image = `${fileHost}${uploads.find((upload) => {
                      return upload._id === product.upload_id;
                    }).path}`;
                    product.brand = brands.find((brand) => {
                      return brand._id === product.brand_id;
                    }).name;
                  });
                  resolve(products);
                } else if (data.code === 200 && data.data.length === 0) {
                  resolve([]);
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else if (data.code === 200 && data.data.length === 0) {
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
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
}
