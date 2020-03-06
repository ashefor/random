declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { ValidatorService } from 'src/app/services/validators';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { AreaService } from 'src/app/services/area.service';
import { Seller } from 'src/app/interfaces/seller';
import { ManagerService } from 'src/app/services/manager.service';
import { SellerService } from 'src/app/services/seller.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  imgLabel: string;
  manufacturers: Array<any>;
  filteredAreas: Array<any> = [];
  sellers: Array<any>;
  managers: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  manufacturerId: any;

  // default object values
  default: any;
  defaultForm: Seller = { address: '', manufacturer_id: 'select', name: '', status: 'select', manager_id: 'select' };

  create: Seller = { address: '', manufacturer_id: 'select', name: '', status: 'select', manager_id: 'select' };
  edit: Seller = { address: '', manufacturer_id: 'select', name: '', status: 'select', manager_id: 'select' };

  currentSeller: any;
  group: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, private validators: ValidatorService, private manufacturer: ManufacturerService, private area: AreaService,
    private manager: ManagerService, private seller: SellerService, private data: DataHandlerService, private cache: CacheService,
    private toastr: ToastrService) {
    this.title = 'Distributors';
    title.setTitle('Suplias - Distributors');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    try {
      this.manufacturerId = JSON.parse(data.getUserData().manufacturer)._id;
    } catch (e) { }
    this.group = data.getUserData().group;
  }

  ngOnInit() {
    this.cache.distributors.subscribe((value) => {
      this.sellers = value;
      this.sorted = value;
    });
    this.fetchSellers();
    this.fetchManufacturers();
    this.fetchManagers();
  }

  fetchManufacturers() {
    this.manufacturer.fetchLite().then((manufacturers: Array<any>) => {
      this.manufacturers = manufacturers;
    }).catch((err) => {
      console.log(err);
    });
  }

  fetchManagers() {
    this.manager.fetch().then((managers: Array<any>) => {
      this.managers = managers;
    }).catch((err) => {
      console.log(err);
    });
  }

  fetchSellers() {
    if (this.group !== 'manager') {
      if (!this.manufacturerId) {
        this.seller.fetch().then(() => { });
      } else {
        this.seller.fetchByManufacturer(this.manufacturerId).then(() => { });
      }
    } else {
      this.seller.fetchByManager(this.data.getUserData()._id).then(() => { });
    }
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
        this.seller.delete(id).then(() => {
          this.resetForms(0);
          this.fetchSellers();
          this.toastr.success('Distributor deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(seller) {
    this.edit.address = seller.address;
    this.edit.manager_id = seller.manager;
    this.edit.manufacturer_id = seller.manufacturer_id;
    this.edit.name = seller.name;
    this.edit.status = seller.status;
    this.currentSeller = seller;
    this.setMode(2);
  }

  checkValid(obj: Seller) {
    const [addr, manId, mId, name, status] = [obj.address, obj.manager_id, obj.manufacturer_id, obj.name, obj.status];

    if ((addr !== '' && manId !== 'select' && mId !== 'select' && name !== '' && status !== 'select')) {
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

  createAction() {
    const create = this.create;
    const [address, manId, mId, name, status] =
    [create.address, create.manager_id, create.manufacturer_id, create.name, create.status];
    this.seller.create(name, address, status, mId, manId).then(() => {
      this.fetchSellers();
      this.closeCreate(0);
      this.toastr.success('Distributor created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentSeller.address = this.edit.address;
    this.currentSeller.manager = this.edit.manager_id;
    this.currentSeller.manufacturer_id = this.edit.manufacturer_id;
    this.currentSeller.name = this.edit.name;
    this.currentSeller.status = this.edit.status;
    this.seller.edit(this.currentSeller).then(() => {
      this.fetchSellers();
      this.closeEdit(0);
      this.toastr.success('Distributor edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.sellers;
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
    this.create = { address: '', manufacturer_id: 'select', name: '', status: 'select', manager_id: 'select' };
    this.edit = { address: '', manufacturer_id: 'select', name: '', status: 'select', manager_id: 'select' };
    this.currentSeller = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.sellers;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.sellers.filter((item) => {
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
        this.sorted = this.sellers.filter((item) => {
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
        this.sorted = this.sellers;
        break;
    }
  }

  sortByManufacturer(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.sellers;
        this.sortOption1 = 'none';
        break;

      default:
        this.sorted = this.sellers.filter((item) => {
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

  getManufacturer(id: string) {
    return this.manufacturers.find(item => {
      return item._id === id;
    }).name;
  }

  getManager(id: string) {
    return this.managers.find(item => {
      return item._id === id;
    }).name;
  }
}
