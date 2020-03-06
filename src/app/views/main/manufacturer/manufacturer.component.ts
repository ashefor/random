declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { Manufacturer } from 'src/app/interfaces/manufacturer';
import { ValidatorService } from 'src/app/services/validators';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.css']
})
export class ManufacturerComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  imgLabel: string;
  manufacturers: Array<any>;

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  // default object values
  default: any;
  defaultForm: Manufacturer = {address: '', email: '', name: '', status: 'select' };

  create: Manufacturer = {address: '', email: '', name: '', status: 'select' };
  edit: Manufacturer = {address: '', email: '', name: '', status: 'select' };

  currentManufacturer: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, private validators: ValidatorService, private manufacturer: ManufacturerService, private cache: CacheService,
    private toastr: ToastrService) {
    this.title = 'Manufacturers';
    title.setTitle('Suplias - Manufacturers');
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
    this.cache.manufacturers.subscribe((value) => {
      this.sorted = value;
      this.manufacturers = value;
    });
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
        this.manufacturer.delete(id).then(() => {
          this.resetForms(0);
          this.fetchManufacturers();
          this.toastr.success('Manufacturer deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(manufacturer) {
    this.edit.address = manufacturer.address;
    this.edit.email = manufacturer.email;
    this.edit.name = manufacturer.name;
    this.edit.status = manufacturer.status;
    this.editSrc = manufacturer.image;
    this.editImage = null;
    this.currentManufacturer = manufacturer;
    this.setMode(2);
  }

  emailValidate(email: string) {
    return this.validators.emailValidator(email);
  }

  checkValid(obj: Manufacturer) {
    const [addr, email, name, status] = [obj.address, obj.email, obj.name, obj.status];
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

    if (this.mode === this.modes[1] && (email !== '' && name !== '' && addr !== '' && image &&
    this.emailValidate(email) === true && status !== 'select')) {
      return true;
    }
    if (this.mode === this.modes[2] && (email !== '' && name !== '' && addr !== '' &&
    this.emailValidate(email) === true && status !== 'select')) {
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

  preview(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) === null) {
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
    const [name, email, address, status] = [create.name, create.email, create.address, create.status];
    this.manufacturer.create(name, email, address, status, this.createImage).then(() => {
      this.fetchManufacturers();
      this.closeCreate(0);
      this.toastr.success('Manufacturer created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchManufacturers() {
    this.manufacturer.fetchAll().then(() => { }).catch((error) => this.toastr.error(error.message));
  }

  editAction() {
    this.currentManufacturer.name = this.edit.name;
    this.currentManufacturer.email = this.edit.email;
    this.currentManufacturer.address = this.edit.address;
    this.currentManufacturer.status = this.edit.status;
    this.manufacturer.edit(this.currentManufacturer, this.editImage).then(() => {
      this.fetchManufacturers();
      this.closeEdit(0);
      this.toastr.success('Manufacturer edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.manufacturers;
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

  resetForms(index: number) {
    this.create = {address: '', email: '', name: '', status: 'select' };
    this.createImage = this.default;
    this.createSrc = this.default;
    this.edit = {address: '', email: '', name: '', status: 'select' };
    this.editImage = this.default;
    this.editSrc = this.default;
    this.currentManufacturer = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.manufacturers;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.manufacturers.filter((item) => {
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
        this.sorted = this.manufacturers.filter((item) => {
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
        this.sorted = this.manufacturers;
        break;
    }
  }

  uploadFile() {
    const fileInput = document.getElementById('files');
    fileInput.click();
  }
}
