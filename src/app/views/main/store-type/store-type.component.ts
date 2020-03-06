declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Status } from '../../../interfaces/status';
import { Title } from '@angular/platform-browser';
import { StoreType } from 'src/app/interfaces/store-type';
import { StoreTypeService } from 'src/app/services/store-type.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-store-type',
  templateUrl: './store-type.component.html',
  styleUrls: ['./store-type.component.css']
})
export class StoreTypeComponent implements OnInit {
  title: any;
  icon: any;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  storeTypes: Array<any>;
  temp: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  default: any;
  defaultForm: StoreType = { name: '', description: '', status: 'select'};
  create: StoreType = { name: '', description: '', status: 'select'};
  edit: StoreType = { name: '', description: '', status: 'select'};

  currentStoreType: any;

  modeWatch: Observable<number>;

  p = 1;
  itemsPerPage = 6;
  constructor(public http: HttpClient, title: Title, private store: StoreTypeService, private cache: CacheService,
    private toastr: ToastrService) {
    title.setTitle('Suplias - Channels');
    this.title = 'Channels';
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.cache.stores.subscribe((value) => {
      this.sorted = value;
      this.storeTypes = value;
    });
    this.fetchStoreTypes();
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
        this.store.delete(id).then(() => {
          this.resetForms(0);
          this.fetchStoreTypes();
          this.toastr.success('Store type deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(storeType) {
    this.edit.description = storeType.description;
    this.edit.name = storeType.name;
    this.edit.status = storeType.status;
    this.currentStoreType = storeType;
    this.setMode(2);
  }

  itemIndex(indexOnPage: number): number {
    return (this.itemsPerPage * (this.p - 1)) + indexOnPage;
  }
  checkValid(obj: StoreType) {
    const [name, description, status] = [obj.name, obj.description, obj.status];

    if (name !== '' && description !== '' && status !== 'select') {
      return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { name: '', description: '', status: 'select'};
    this.edit = { name: '', description: '', status: 'select'};
    this.currentStoreType = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  closeCreate(index: number): void {
    this.resetForms(index);
  }

  closeEdit(index: number): void {
    this.resetForms(index);
  }

  createAction() {
    const create = this.create;
    const [name, description, status] = [create.name, create.description, create.status];
    this.store.create(name, description, status).then(() => {
      this.fetchStoreTypes();
      this.closeCreate(0);
      this.toastr.success('Store type created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchStoreTypes() {
    this.store.fetch().then(() => { });
  }

  editAction() {
    this.currentStoreType.name = this.edit.name;
    this.currentStoreType.description = this.edit.description;
    this.currentStoreType.status = this.edit.status;

    this.store.edit(this.currentStoreType).then(() => {
      this.fetchStoreTypes();
      this.closeEdit(0);
      this.toastr.success('Store type edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.storeTypes;
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

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.storeTypes;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.storeTypes.filter((item) => {
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
        this.sorted = this.storeTypes.filter((item) => {
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
        this.sorted = this.storeTypes;
        break;
    }
  }
}
