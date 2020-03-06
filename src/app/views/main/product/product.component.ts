declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { Product } from 'src/app/interfaces/product';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { CacheService } from 'src/app/services/cache.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  title: any;
  icon: any;
  min_qty: any;
  imgLabel: any;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  brands: Array<any>;
  products: Array<any>;

  brandId: any;
  brandName: any;

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  manufacturerId: any;

  default: any;

  // Objects for template-driven forms
  defaultForm: Product;
  create: Product;
  edit: Product;

  currentProduct: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, public route: ActivatedRoute, private product: ProductService, data: DataHandlerService,
    private toastr: ToastrService, cache: CacheService) {
    this.imgLabel = 'Choose image';
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    title.setTitle('Suplias - Products');
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.brandId = route.snapshot.paramMap.get('brandId');
    cache.brands.subscribe((value) => {
      if (value) {
        const brand = value.find((_brand) => _brand._id === this.brandId);
        if (brand) {
          this.brandName = brand.name;
        } else {
          this.brandName = 'Products';
        }
      } else {
        this.brandName = 'Products';
      }
    });
    this.title = this.brandName;
    title.setTitle(`Suplias - ${this.brandName}`);
    this.defaultForm = { skuId: '', name: '', brandId: this.brandId, caseCount: 0, description: '',
    minQty: 0, status: 'select', price: 0 };
    this.create = { skuId: '', name: '', brandId: this.brandId, caseCount: 0, description: '',
    minQty: 0, status: 'select', price: 0 };
    this.edit = { skuId: '', name: '', brandId: this.brandId, caseCount: 0, description: '',
    minQty: 0, status: 'select', price: 0 };
    try {
      this.manufacturerId = JSON.parse(data.getUserData().manufacturer)._id;
    } catch (e) { }
  }

  ngOnInit() {
    // tslint:disable-next-line
    this.min_qty = `Min. qty purchaseable is the minimum amount of this product a buyer can purchase. Also, only multiples of this min. qty can be purchased.`;
    this.fetchProducts();
  }

  setMode(index: number): void {
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
        this.product.delete(id).then(() => {
          this.resetForms(0);
          this.fetchProducts();
          this.toastr.success('Product deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(product) {
    this.edit.brandId = product.brand_id;
    this.edit.caseCount = product.case_count;
    this.edit.description = product.description;
    this.edit.minQty = product.mpu;
    this.edit.name = product.name;
    this.edit.skuId = product.sku_id;
    this.edit.status = product.status;
    this.edit.price = product.price;
    this.editSrc = product.image;
    this.editImage = null;
    this.currentProduct = product;
    this.setMode(2);
  }

  checkValid(obj: Product) {
    const [skuId, name, brand, count, desc, minQty, status, price ] = [
      obj.skuId, obj.name, obj.brandId, obj.caseCount, obj.description, obj.minQty, obj.status, obj.price
    ];

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

    if (this.mode === this.modes[1] && skuId !== '' && name !== '' && brand !== 'select' && count !== 0 && desc !== '' &&
      minQty !== 0 && status !== 'select' && image && price !== 0) {
      return true;
    }
    if (this.mode === this.modes[2] && skuId !== '' && name !== '' && brand !== 'select' && count !== 0 && desc !== '' &&
      minQty !== 0 && status !== 'select' && price !== 0) {
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
    const [skuId, name, desc, caseCount, mpu, status, brandId, price] = [create.skuId, create.name, create.description, create.caseCount,
      create.minQty, create.status, create.brandId, create.price];
    this.product.create(skuId, name, desc, caseCount, mpu, status, brandId, price, this.createImage).then(() => {
      this.fetchProducts();
      this.closeCreate(0);
      this.toastr.success('Product created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentProduct.brand_id = this.edit.brandId;
    this.currentProduct.case_count = this.edit.caseCount;
    this.currentProduct.description = this.edit.description;
    this.currentProduct.mpu = this.edit.minQty;
    this.currentProduct.name = this.edit.name;
    this.currentProduct.sku_id = this.edit.skuId;
    this.currentProduct.status = this.edit.status;
    this.currentProduct.price = this.edit.price;
    this.product.edit(this.currentProduct, this.editImage).then(() => {
      this.fetchProducts();
      this.closeEdit(0);
      this.toastr.success('Product edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.products;
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
    console.log(e);
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error('Only images are supported');
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

  fetchProducts() {
    this.product.fetchByBrand(this.brandId).then((products: Array<any>) => {
      console.log(products);
      if (products.length !== 0) {
        this.products = products.sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sorted = this.products;
      } else {
        this.products = [];
        this.sorted = [];
      }
    });
  }

  resetForms(index: number) {
    this.create = { skuId: '', name: '', brandId: this.brandId, caseCount: 0, description: '',
    minQty: 0, status: 'select', price: 0 };
    this.createImage = this.default;
    this.createSrc = this.default;
    this.edit = { skuId: '', name: '', brandId: this.brandId, caseCount: 0, description: '',
    minQty: 0, status: 'select', price: 0 };
    this.editImage = this.default;
    this.editSrc = this.default;
    this.currentProduct = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.products;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.products.filter((item) => {
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
        this.sorted = this.products.filter((item) => {
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
        this.sorted = this.products;
        break;
    }
  }

  uploadFile() {
    const fileInput = document.getElementById('files');
    fileInput.click();
  }

  toggleStatus(product: any) {
    const toggleBtn = <HTMLInputElement> document.querySelector(`#status_${product._id}`);
    this.product.toggleStatus(product).then(() => {
      let msg;
      if (product.status === 'active') {
        product.status = 'inactive';
        this.products.splice(this.products.findIndex((s) => s._id === product._id), 1, product);
        msg = 'deactivated';
        toggleBtn.checked = false;
      } else {
        product.status = 'active';
        this.products.splice(this.products.findIndex((s) => s._id === product._id), 1, product);
        msg = 'activated';
        toggleBtn.checked = true;
      }
      this.toastr.success(`Product ${msg}`);
    }).catch((error: any) => {
      product.status === 'active' ? toggleBtn.checked = true : toggleBtn.checked = false;
      this.toastr.error(error.message);
    });
  }
}
