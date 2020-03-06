declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { Promotion } from 'src/app/interfaces/promotion';
import { PromotionService } from 'src/app/services/promotion.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ProductService } from 'src/app/services/product.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.css']
})

export class PromotionComponent implements OnInit {
  title: any;
  icon: any;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  promotions: Array<any>;
  temp: any;
  manufacturer_id: any;
  staff_id: any;
  products: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  // Objects for template-driven forms
  default: any;
  defaultForm: Promotion;
  public create: Promotion;
  public edit: Promotion;

  currentPromotion: any;

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(public http: HttpClient, title: Title, private data: DataHandlerService, private promotion: PromotionService,
    private product: ProductService, private cache: CacheService, private toastr: ToastrService) {
    title.setTitle('Suplias - Promotions');
    this.title = 'Promotions';
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.manufacturer_id = JSON.parse(this.data.getUserData().manufacturer)._id;
    this.staff_id = this.data.getUserData()._id;
    this.statuses = [
      { name: 'Active', value: 'active' },
      { name: 'Inactive', value: 'inactive' },
    ];
  }

  ngOnInit() {
    this.defaultForm = {
      title: '', description: '', status: 'select', manufacturer_id: this.manufacturer_id,
      manufacturer_staff_id: this.staff_id, product_id: 'select'
    };
    this.create = {
      title: '', description: '', status: 'select', manufacturer_id: this.manufacturer_id,
      manufacturer_staff_id: this.staff_id, product_id: 'select'
    };
    this.edit = {
      title: '',
      description: '',
      status: 'select',
      manufacturer_id: this.manufacturer_id,
      manufacturer_staff_id: this.staff_id,
      product_id: 'select'
    };
    this.cache.promotions.subscribe((value) => {
      this.promotions = value;
      this.sorted = value;
    });

    this.fetchPromotions();
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
        this.promotion.delete(id).then(() => {
          this.resetForms(0);
          this.fetchPromotions();
          this.toastr.success('Promotion deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(promotion) {
    this.edit.title = promotion.title;
    this.edit.description = promotion.description;
    this.edit.status = promotion.status;
    this.edit.product_id = promotion.product_id;
    this.editSrc = promotion.picture;
    this.editImage = null;
    this.currentPromotion = promotion;
    this.setMode(2);
  }

  checkValid(obj: Promotion) {
    // console.log(obj);
    const [title, description, status, product_id] = [obj.title, obj.description, obj.status, obj.product_id];

    return (title !== '' && description !== '' && status !== 'select' && product_id !== 'select');
  }

  resetForms(index: number) {
    this.create = {
      title: '', description: '', status: 'select', manufacturer_id: this.manufacturer_id,
      manufacturer_staff_id: this.staff_id, product_id: 'select'
    };
    this.edit = {
      title: '', description: '', status: 'select', manufacturer_id: this.manufacturer_id,
      manufacturer_staff_id: this.staff_id, product_id: 'select'
    };
    this.currentPromotion = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
    this.editImage = this.default;
    this.createImage = this.default;
    this.editSrc = this.default;
    this.createSrc = this.default;
  }

  closeCreate(index: number): void {
    this.resetForms(index);
  }

  closeEdit(index: number): void {
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
    const [title, description, status, manufacturer, staff, product] =
      [create.title, create.description, create.status, create.manufacturer_id, create.manufacturer_staff_id, create.product_id];
    this.promotion.create(title, description, status, manufacturer, staff, product, this.createImage).then(() => {
      this.fetchPromotions();
      this.closeCreate(0);
      this.toastr.success('Promotion created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchPromotions() {
    this.promotion.fetchByManufacturer(this.manufacturer_id).then((data: any) => {
      console.log(data)
    });
  }

  editAction() {
    this.currentPromotion.title = this.edit.title;
    this.currentPromotion.description = this.edit.description;
    this.currentPromotion.status = this.edit.status;
    this.currentPromotion.product_id = this.edit.product_id;

    this.promotion.edit(this.currentPromotion, this.editImage).then(() => {
      this.fetchPromotions();
      this.closeEdit(0);
      this.toastr.success('Promotion edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.promotions;
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
      if (v.title && q) {
        if (v.title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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
          image.onload = function () {
            const [height, weight] = [image.naturalHeight, image.naturalWidth];
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
          image.onload = function () {
            const [height, weight] = [image.naturalHeight, image.naturalWidth];
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

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.promotions;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.promotions.filter((item) => {
          return item.status === 'active';
        }).sort(function (a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
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
        this.sorted = this.promotions.filter((item) => {
          return item.status === 'inactive';
        }).sort(function (a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
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
        this.sorted = this.promotions;
        break;
    }
  }

  fetchProducts() {
    this.product.fetchByManufacturerLite(this.manufacturer_id).then((products: Array<any>) => {
      console.log(products);
      this.products = products;
    });
  }

  uploadFile() {
    const fileInput = document.getElementById('files');
    fileInput.click();
  }

  toggleStatus(promotion: any) {
    const toggleBtn = <HTMLInputElement>document.querySelector(`#status_${promotion._id}`);
    this.promotion.toggleStatus(promotion).then(() => {
      let msg;
      if (promotion.status === 'active') {
        promotion.status = 'inactive';
        this.promotions.splice(this.promotions.findIndex((s) => s._id === promotion._id), 1, promotion);
        msg = 'deactivated';
        toggleBtn.checked = false;
      } else {
        promotion.status = 'active';
        this.promotions.splice(this.promotions.findIndex((s) => s._id === promotion._id), 1, promotion);
        msg = 'activated';
        toggleBtn.checked = true;
      }
      this.toastr.success(`Promotion ${msg}`);
    }).catch((error: any) => {
      promotion.status === 'active' ? toggleBtn.checked = true : toggleBtn.checked = false;
      this.toastr.error(error.message);
    });
  }
}
