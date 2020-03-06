declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { Task, Meta, EditMeta } from 'src/app/interfaces/task';
import { Title } from '@angular/platform-browser';
import { TaskService } from 'src/app/services/task.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from 'src/app/services/brand.service';
import { ProductService } from 'src/app/services/product.service';
import { StoreTypeService } from 'src/app/services/store-type.service';
import { Observable, of } from 'rxjs';

const DAY = 86400, WEEK = 604800, MONTH = 2592000, YEAR = 31104000;
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  imgLabel: string;
  tasks: Array<any>;
  durationTypes: Array<any> = ['days', 'weeks', 'months', 'years'];

  manufacturerId: any;

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  createPostImage: any;
  editPostImage: any;
  createPostSrc: any;
  editPostSrc: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  default: any;
  defaultForm: Task;

  create: Task;
  edit: Task;

  currentTask: any;
  brands: Array<any>;
  products: Array<any>;
  storeTypes: Array<any>;

  createMeta: Array<Meta> = [];
  editMeta: Array<EditMeta> = [];
  deleteMeta: Array<EditMeta> = [];

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, private task: TaskService, private data: DataHandlerService,
    private cache: CacheService, private toastr: ToastrService, private brand: BrandService, private product: ProductService,
    private store: StoreTypeService) {
    this.title = 'Tasks';
    title.setTitle('Suplias - Tasks');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);

    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.imgLabel = 'Choose an image';
    try {
      this.manufacturerId = JSON.parse(data.getUserData().manufacturer)._id;
    } catch (e) { }
    this.defaultForm = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId, periodQty: 0, periodType: this.durationTypes[0], storeType: 'select', rewardCash: 0,
      rewardPoints: 0 };
    this.create = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId, periodQty: 0, periodType: this.durationTypes[0], storeType: 'select', rewardCash: 0,
      rewardPoints: 0 };
    this.edit = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId, periodQty: 0, periodType: this.durationTypes[0], storeType: 'select', rewardCash: 0,
      rewardPoints: 0 };
  }

  ngOnInit() {
    this.cache.tasks.subscribe((value) => {
      this.sorted = value;
      this.tasks = value;
    });
    this.cache.brands.subscribe((brands) => {
      this.brands = brands;
    });
    this.cache.stores.subscribe((value) => {
      this.storeTypes = value;
    });
    this.fetchTasks();
    this.fetchStoreTypes();
  }

  addCreateMeta() {
    const meta: Meta = { id: this.generateRand(3), tag: 'question', value: '' };
    this.createMeta.push(meta);
  }

  removeCreateMeta(id: string) {
    const _id = this.createMeta.findIndex((meta) => meta.id === id);
    this.createMeta.splice(_id, 1);
  }

  validateCreateMeta() {
    if (this.createMeta.length === 0) {
      return true;
    } else {
      const incomplete = this.createMeta.filter((meta) => {
        return meta.tag === '' || meta.value === '';
      });
      if (incomplete.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }

  addEditMeta() {
    const meta: EditMeta = { _id: '', tag: 'question', value: '', created: Date.now(), status: 'active', task_id: this.currentTask._id,
    id: this.generateRand(3) };
    this.editMeta.push(meta);
  }

  removeEditMeta(meta: EditMeta) {
    if (meta.id) {
      const index = this.editMeta.findIndex((_meta) => _meta.id === meta.id);
      index > -1 ? this.editMeta.splice(index, 1) : console.log();
    } else {
      const index = this.editMeta.findIndex((_meta) => _meta._id === meta._id);
      index > -1 ? this.editMeta.splice(index, 1) : console.log();
      this.deleteMeta.push(meta);
    }
  }

  validateEditMeta() {
    if (this.editMeta.length === 0) {
      return true;
    } else {
      const incomplete = this.editMeta.filter((meta) => {
        return meta.tag === '' || meta.value === '';
      });
      if (incomplete.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }

  generateRand(length: number) {
    let text = '';
    const possible = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text.toUpperCase();
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
        this.task.delete(id).then(() => {
          this.resetForms(0);
          this.fetchTasks();
          this.toastr.success('Task deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(task) {
    this.edit.title = task.title;
    this.edit.manufacturerId = task.manufacturer_id;
    this.edit.status = task.status;
    this.edit.description = task.description;
    this.edit.durationQty = this.computeDurationProps(task.ttl).qty;
    this.edit.durationType = this.computeDurationProps(task.ttl).type;
    this.edit.periodQty = this.computeDurationProps(task.period).qty;
    this.edit.periodType = this.computeDurationProps(task.period).type;
    this.edit.storeType = task.store_type_id;
    this.edit.rewardCash = task.reward_wallet;
    this.edit.rewardPoints = task.reward_points;
    console.log(task.metaData);
    this.editMeta = task.metaData;
    this.editSrc = task.image;
    this.editImage = null;
    this.editPostSrc = task.postImage;
    this.editPostImage = null;
    this.currentTask = task;
    this.setMode(2);
  }

  checkValid(obj: Task) {
    const [desc, durationQty, durationType, manufacturerId, status, title, periodQty, periodType, storeType] =
      [obj.description, obj.durationQty, obj.durationType, obj.manufacturerId, obj.status, obj.title, obj.periodQty, obj.periodType,
        obj.storeType];

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

    if (this.mode === this.modes[1] && desc !== '' && durationType !== 'select' && durationQty !== 0 && manufacturerId !== '' &&
      status !== 'select' && title !== '' && image && periodType !== 'select' && periodQty !== 0 && storeType !== 'select' &&
      this.validateCreateMeta()) {
      return true;
    }

    if (this.mode === this.modes[2] && desc !== '' && durationType !== 'select' && durationQty !== 0 && manufacturerId !== '' &&
      status !== 'select' && title !== '' && storeType !== 'select' && this.validateEditMeta()) {
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
    let points = create.rewardPoints, cash = create.rewardCash;
    const [desc, manufacturerId, status, title, ttl, period, storeType] =
      [create.description, create.manufacturerId, create.status, create.title, this.computeTTL(create.durationType, create.durationQty),
        this.computeTTL(create.periodType, create.periodQty), create.storeType];

    points === null ? points = 0 : points = points;
    cash === null ? cash = 0 : cash = cash;

    this.task.create(title, desc, ttl, status, manufacturerId, period, storeType, this.createImage, cash, points, this.createPostImage)
      .then((task_id: string) => {
        if (this.createMeta.length !== 0) {
          this.task.addMetaData(this.createMeta, task_id).then(() => {
            this.fetchTasks();
            this.closeCreate(0);
            this.toastr.success('Task created');
          }).catch((error: any) => {
            this.toastr.error(error.message);
          });
        } else {
          this.fetchTasks();
          this.closeCreate(0);
          this.toastr.success('Task created');
        }
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.edit.rewardCash === null ? this.currentTask.reward_wallet = 0 : this.currentTask.reward_wallet = this.edit.rewardCash;
    this.edit.rewardPoints === null ? this.currentTask.reward_points = 0 : this.currentTask.reward_points = this.edit.rewardPoints;

    this.currentTask.title = this.edit.title;
    this.currentTask.status = this.edit.status;
    this.currentTask.manufacturer_id = this.edit.manufacturerId;
    this.currentTask.description = this.edit.description;
    this.currentTask.ttl = this.computeTTL(this.edit.durationType, this.edit.durationQty);
    this.currentTask.period = this.computeTTL(this.edit.periodType, this.edit.periodQty);
    this.currentTask.store_type_id = this.edit.storeType;

    this.task.edit(this.currentTask, this.editImage, this.editPostImage).then(() => {
      this.task.editMetaData(this.deleteMeta, this.editMeta).then(() => {
        this.fetchTasks();
        this.closeEdit(0);
        this.toastr.success('Task edited');
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.tasks ;
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
        if ( v.title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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

  previewPost(e) {
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
        this.createPostImage = files[0];
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
              context.createPostSrc = reader.result;
            }
          };
        };
        break;

      case this.modes[2]:
        this.editPostImage = files[0];
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
              context.editPostSrc = reader.result;
            }
          };
        };
        break;
      default:
        break;
    }
  }

  fetchTasks() {
    this.task.fetchByManufacturer(this.manufacturerId).then(() => { });
  }

  resetForms(index: number) {
    this.create = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId, periodQty: 0, periodType: this.durationTypes[0], storeType: 'select', rewardCash: 0,
      rewardPoints: 0 };

    this.edit = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId, periodQty: 0, periodType: this.durationTypes[0], storeType: 'select', rewardCash: 0,
      rewardPoints: 0 };

    this.createImage = null;
    this.editImage = null;
    this.createSrc = null;
    this.editSrc = null;

    this.createPostImage = null;
    this.editPostImage = null;
    this.createPostSrc = null;
    this.editPostSrc = null;

    this.currentTask = null;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.tasks;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.tasks.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
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
        this.sorted = this.tasks.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
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
        this.sorted = this.tasks;
        break;
    }
  }

  uploadFile(type: string) {
    const fileInput = type === 'image' ? document.getElementById('files') : document.getElementById('postFiles');
    fileInput.click();
  }

  computeTTL(durationType: string, durationQty: number) {
    let ttl = 0;
    switch (durationType) {
      case 'days':
        ttl = DAY * durationQty;
        break;
      case 'weeks':
        ttl = WEEK * durationQty;
        break;
      case 'months':
        ttl = MONTH * durationQty;
        break;
      case 'years':
        ttl = YEAR * durationQty;
        break;
      default:
        break;
    }
    return ttl;
  }

  computeDurationProps(ttl: number) {
    const duration = { qty: 0, type: '' };
    if (Number.isInteger(ttl / YEAR) === true) {
      duration['qty'] = (ttl / YEAR);
      duration['type'] = 'years';
    } else if (Number.isInteger(ttl / MONTH) === true) {
      duration['qty'] = (ttl / MONTH);
      duration['type'] = 'months';
    } else if (Number.isInteger(ttl / WEEK) === true) {
      duration['qty'] = (ttl / WEEK);
      duration['type'] = 'weeks';
    } else if (Number.isInteger(ttl / DAY) === true) {
      duration['qty'] = (ttl / DAY);
      duration['type'] = 'days';
    }
    return duration;
  }

  fetchStoreTypes() {
    this.store.fetch().then(() => { });
  }

  showImage(img_id: string) {
    const image = document.getElementById(img_id);
    image.click();
  }
}
