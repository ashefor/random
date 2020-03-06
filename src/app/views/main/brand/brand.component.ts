declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { ValidatorService } from 'src/app/services/validators';
import { Brand } from 'src/app/interfaces/brand';
import { BrandService } from 'src/app/services/brand.service';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { ActivatedRoute } from '@angular/router';
import { DataHandlerService } from 'src/app/services/data.service';
import * as Papa from 'papaparse';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css']
})
export class BrandComponent implements OnInit {
  icon: string;
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  imgLabel: string;
  brands: Array<any>;
  manufacturers: Array<any>;

  manufacturerId: any;

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  default: any;
  defaultForm: Brand;

  create: Brand;
  edit: Brand;

  currentBrand: any;
  p = 1;
  modeWatch: Observable<number>;

  constructor(private _title: Title, public validators: ValidatorService, private brand: BrandService,
    private manufacturer: ManufacturerService, private route: ActivatedRoute, private data: DataHandlerService,
    private cache: CacheService, private toastr: ToastrService) {
    this.title = 'Brands';
    _title.setTitle('Suplias - Brands');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.imgLabel = 'Choose an image';
  }

  ngOnInit() {
    let manufacturerName;

    try {
      if (!this.data.getUserData().manufacturer) {
        this.manufacturerId = this.route.snapshot.paramMap.get('manufacturerId');
        this.cache.manufacturers.subscribe((value) => {
          if (value) {
            manufacturerName = value.find((manufacturer) => manufacturer._id === this.manufacturerId).name;
            if (manufacturerName && manufacturerName !== '') {
              this.title = `${manufacturerName} Brands`;
              this._title.setTitle(`Suplias - ${manufacturerName} Brands`);
            } else {
              this.title = 'Brands';
              this._title.setTitle(`Suplias - Brands`);
            }
          } else {
            this.title = 'Brands';
            this._title.setTitle(`Suplias - Brands`);
          }
        });
      } else {
        this.manufacturerId = JSON.parse(this.data.getUserData().manufacturer)._id;
        manufacturerName = JSON.parse(this.data.getUserData().manufacturer).name;
      }
      this.defaultForm = { manufacturer: this.manufacturerId, name: '', status: 'select' };
      this.create = { manufacturer: this.manufacturerId, name: '', status: 'select' };
      this.edit = { manufacturer: this.manufacturerId, name: '', status: 'select' };
    } catch (e) { }
    this.cache.brands.subscribe((brands) => {
      this.brands = brands;
      this.sorted = brands;
    });
    this.fetchBrands();
    this.fetchManufacturers();
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  spawnDelete(id) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.brand.delete(id).then(() => {
          this.resetForms(0);
          this.fetchBrands();
          this.toastr.success('Brand deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(brand) {
    this.edit.name = brand.name;
    this.edit.manufacturer = brand.manufacturer_id;
    this.edit.status = brand.status;
    this.editSrc = brand.image;
    this.editImage = null;
    this.currentBrand = brand;
    this.setMode(2);
  }

  checkValid(obj: Brand) {
    const [manufacturer, name, status] = [obj.manufacturer, obj.name, obj.status];

    let image;

    switch (this.mode) {
      case this.modes[1]:
        image = this.createImage;
        break;
      case this.modes[2]:
        image = this.editImage;
        break;
      default:
        break;
    }

    if (this.mode === this.modes[1] && name !== '' && manufacturer !== '' && image && status !== 'select') {
      return true;
    }

    if (this.mode === this.modes[2] && name !== '' && manufacturer !== '' && status !== 'select') {
      return true;
    }
    return false;
  }

  closeCreate(index: number) {
    this.resetForms(index);
  }

  closeEdit(index: number) {
    this.resetForms(index);
  }

  removeImage(type) {
    (<HTMLInputElement>document.getElementById('files')).value = '';
    if (type === 'create') {
      this.createImage = this.default;
      this.createSrc = this.default;
    }
    if (type === 'edit') {
      this.editImage = null;
      this.editSrc = this.default;
    }
  }

  createAction() {
    const create = this.create;
    const [name, status, manufacturerId] = [create.name, create.status, create.manufacturer];
    this.brand.create(name, status, manufacturerId, this.createImage).then(() => {
      this.fetchBrands();
      this.closeCreate(0);
      this.toastr.success('Brand created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentBrand.name = this.edit.name;
    this.currentBrand.status = this.edit.status;
    this.currentBrand.manufacturer_id = this.edit.manufacturer;
    this.brand.edit(this.currentBrand, this.editImage).then(() => {
      this.fetchBrands();
      this.closeEdit(0);
      this.toastr.success('Brand edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.brands;
    if (this.sortOption !== 'none') {
      searchPool = this.sorted;
    }

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.name && q) {
        if ( v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  preview(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error('Only image files are supported');
      return;
    }

    const reader = new FileReader();

    switch (this.mode) {
      case this.modes[1]:
        this.createImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.createSrc = reader.result;
            }
          };
        };
        break;

      case this.modes[2]:
        this.editImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.editSrc = reader.result;
            }
          };
        };
        break;
      default:
        break;
    }
  }

  bulkUpload(e) {
    console.log(e);
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }

    swal(`Upload products?`, {
      icon: 'warning',
      buttons: [true, true],
    }).then((upload) => {
      if (upload) {
        this.uploadBulk(files[0]);
      }
    });
  }

  uploadBulk(file: any) {
    // tslint:disable-next-line
    const parser = new Promise((resolve, reject) => {
      Papa.parse(file, {
        delimiter: '',
        newline: '',
        quoteChar: '"',
        escapeChar: '"',
        headers: true,
        complete: function(results) {
          try {
            const array = results.data, products = [];
            for (let i = 0; i < array.length; i++) {
              if (array[i].length !== 8) {
                reject({message: 'An error occured. Kindly check the csv file and try again'});
                break;
              }
              const itr = { 'sku_id': array[i][0], 'name': array[i][1], 'description': array[i][2], 'case_count': array[i][3],
                'weight': array[i][4], 'size': array[i][5], 'mpu': array[i][6], 'price': array[i][7].replace(/[\s+\,]/g, '')};
              products.push(itr);
              if (i === array.length - 1) {
                resolve(products);
              }
            }
          } catch (e) {
            reject({message: 'An error occured. Kindly check the csv file and try again'});
          }
        }
      });
    });

    parser.then((products: Array<any>) => {
      this.brand.uploadBulk(products, this.currentBrand._id).then(() => {
        this.resetForms(0);
        this.fetchBrands();
        this.toastr.success('Bulk upload successful');
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchBrands() {
    if (this.manufacturerId) {
      this.brand.fetchByManufacturer(this.manufacturerId).then(() => {});
    } else {
      this.brand.fetchAll().then(() => {});
    }
  }

  resetForms(index: number) {
    this.create = { manufacturer: this.manufacturerId, name: '', status: 'select' };
    this.createImage = this.default;
    this.createSrc = this.default;
    this.edit = { manufacturer: this.manufacturerId, name: '', status: 'select' };
    this.editImage = this.default;
    this.editSrc = this.default;
    this.currentBrand = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.brands;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.brands.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.brands.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.brands;
        break;
    }
  }

  fetchManufacturers() {
    if (!this.manufacturerId) {
      this.manufacturer.fetchLite().then((manufacturers: any) => {
        this.manufacturers = manufacturers;
      });
    }
  }

  uploadFile() {
    const fileInput = document.getElementById('files');
    fileInput.click();
  }

  uploadProducts() {
    const fileInput = document.getElementById('products');
    fileInput.click();
  }

  sortByManufacturer(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.brands;
        this.sortOption1 = 'none';
        break;

      default:
        this.sorted = this.brands.filter((item) => {
          return item.manufacturer_id === val;
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = val;
        break;
    }
  }
  toggleStatus(brand: any) {
    const toggleBtn = <HTMLInputElement> document.querySelector(`#status_${brand._id}`);
    this.brand.toggleStatus(brand).then(() => {
      let msg;
      if (brand.status === 'active') {
        brand.status = 'inactive';
        this.brands.splice(this.brands.findIndex((s) => s._id === brand._id), 1, brand);
        msg = 'deactivated';
        toggleBtn.checked = false;
      } else {
        brand.status = 'active';
        this.brands.splice(this.brands.findIndex((s) => s._id === brand._id), 1, brand);
        msg = 'activated';
        toggleBtn.checked = true;
      }
      this.toastr.success(`Brand ${msg}`);
    }).catch((error: any) => {
      brand.status === 'active' ? toggleBtn.checked = true : toggleBtn.checked = false;
      this.toastr.error(error.message);
    });
  }
}
