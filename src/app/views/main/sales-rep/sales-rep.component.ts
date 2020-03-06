declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { SalesOfficer } from 'src/app/interfaces/sales-officer';
import { Title } from '@angular/platform-browser';
import { ValidatorService } from 'src/app/services/validators';
import { SellerService } from 'src/app/services/seller.service';
import { SalesOfficerService } from 'src/app/services/sales-officer.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { SellerAreaService } from 'src/app/services/seller-area.service';

@Component({
  selector: 'app-sales-rep',
  templateUrl: './sales-rep.component.html',
  styleUrls: ['./sales-rep.component.css']
})
export class SalesRepComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  imgLabel: string;
  salesReps: Array<any>;
  sellers: Array<any>;
  seller_areas: Array<any>;

  form_seller_areas: Array<any>;
  role = 'rep';

  seller_id: string;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  default: any;
  defaultForm: SalesOfficer = { email: '', hash: '', seller_id: 'select', name: '', phone: '', status: 'select',
    role: 'rep', user_id: '', seller_area_id: 'select' };
  create: SalesOfficer = { email: '', hash: '', seller_id: 'select', name: '', phone: '', status: 'select',
    role: 'rep', user_id: '', seller_area_id: 'select' };
  edit: SalesOfficer = { email: '', hash: '', seller_id: 'select', name: '', phone: '', status: 'select',
    role: 'rep', user_id: '', seller_area_id: 'select' };

  currentSalesRep: any;
  group: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, private validators: ValidatorService, private salesOfficer: SalesOfficerService, private toastr: ToastrService,
    private data: DataHandlerService, private cache: CacheService, private seller: SellerService, private SAService: SellerAreaService) {
    this.title = 'Sales Reps';
    title.setTitle('Suplias - Sales Reps');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.seller_id = data.getUserData().seller_id;
    this.group = data.getUserData().group;
  }

  ngOnInit() {
    this.cache.salesReps.subscribe((value) => {
      this.sorted = value;
      this.salesReps = value;
    });
    this.fetchSalesReps();
    this.fetchSellerAndAreas();
  }

  fetchSellerAndAreas() {
    Promise.all([this.seller.fetch(), this.SAService.fetch()]).then((values: any[]) => {
      this.sellers = values[0];
      this.seller_areas = values[1];
    }).catch(error => this.toastr.error(error.message));
  }

  validateHash(hash: string) {
    return hash.length >= 6;
  }

  validatePhone(phone) {
    if (this.phoneToString(phone).length === 11) {
      return true;
    }
    return false;
  }

  phoneToString(phone) {
    return String(phone);
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
        this.salesOfficer.delete(id).then(() => {
          this.resetForms(0);
          this.fetchSalesReps();
          this.toastr.success('Sales rep deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(salesOfficer) {
    this.edit.email = salesOfficer.email;
    this.edit.hash = salesOfficer.hash;
    this.edit.seller_id = salesOfficer.seller_id;
    this.edit.name = salesOfficer.name;
    this.edit.phone = salesOfficer.phone;
    this.edit.status = salesOfficer.status;
    this.edit.role = salesOfficer.role;
    this.edit.user_id = salesOfficer.user_id;
    this.edit.seller_area_id = salesOfficer.seller_area_id;
    this.currentSalesRep = salesOfficer;
    this.filterSellerAreas({srcElement: {value: salesOfficer.seller_id }});
    this.setMode(2);
  }

  emailValidate(email: string) {
    return this.validators.emailValidator(email);
  }

  checkValid(obj: SalesOfficer) {
    const [email, hash, sId, role, name, phone, status, uId, saID] =
    [obj.email, obj.hash, obj.seller_id, obj.role, obj.name, obj.phone, obj.status, obj.user_id, obj.seller_area_id];

    if (this.mode === this.modes[1] &&
      (email !== '' && hash !== '' && sId !== 'select' && role !== '' && name !== '' && String(phone) !== '' && status !== 'select' &&
      this.emailValidate(email) === true && saID !== 'select')) {
        return true;
    }

    if (this.mode === this.modes[2] &&
      (email !== '' && uId !== '' && sId !== 'select' && role !== '' && name !== '' && String(phone) !== '' && status !== 'select' &&
      this.emailValidate(email) === true && saID !== 'select')) {
        return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { email: '', hash: '', seller_id: 'select', name: '', phone: '', status: 'select',
    role: 'rep', user_id: '', seller_area_id: 'select' };
    this.edit = { email: '', hash: '', seller_id: 'select', name: '', phone: '', status: 'select',
    role: 'rep', user_id: '', seller_area_id: 'select' };
    this.currentSalesRep = this.default;
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  closeCreate(index: number) {
    this.resetForms(index);
  }

  closeEdit(index: number) {
    this.resetForms(index);
  }

  createAction() {
    const create = this.create;
    const [email, hash, sId, role, name, phone, status, saID] =
    [create.email, create.hash, create.seller_id, create.role, create.name, create.phone, create.status, create.seller_area_id];
    this.salesOfficer.create(phone, name, email, status, role, sId, saID, hash).then(() => {
      this.fetchSalesReps();
      this.closeCreate(0);
      this.toastr.success('Sales rep created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentSalesRep.email = this.edit.email;
    this.currentSalesRep.seller_id = this.edit.seller_id;
    this.currentSalesRep.role = this.edit.role;
    this.currentSalesRep.name = this.edit.name;
    this.currentSalesRep.phone = this.edit.phone;
    this.currentSalesRep.status = this.edit.status;
    this.currentSalesRep.user_id = this.edit.user_id;
    this.currentSalesRep.seller_area_id = this.edit.seller_area_id;
    this.salesOfficer.edit(this.currentSalesRep).then(() => {
      this.fetchSalesReps();
      this.closeEdit(0);
      this.toastr.success('Sales rep edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchSalesReps() {
    if (this.group !== 'manager') {
      if (!this.seller_id) {
        this.salesOfficer.fetch(this.role).then(() => { });
      } else {
        this.salesOfficer.fetchBySeller(this.seller_id, this.data.getUserData().seller_area_id, this.role).then(() => { });
      }
    } else {
      this.salesOfficer.fetchByManager(this.data.getUserData()._id, this.role).then(() => { });
    }
  }

  search() {
    let searchPool = this.salesReps;
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
        this.sorted = this.salesReps;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.salesReps.filter((item) => {
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
        this.sorted = this.salesReps.filter((item) => {
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
        this.sorted = this.salesReps;
        break;
    }
  }

  sortBySeller(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.salesReps;
        this.sortOption1 = 'none';
        break;

      default:
        this.sorted = this.salesReps.filter((item) => {
          return item.seller_id === val;
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

  filterSellerAreas(e: any) {
    if (e.srcElement.value && e.srcElement.value !== 'select') {
      this.form_seller_areas = this.seller_areas.filter(SA => SA.seller_id === e.srcElement.value);
    }
  }
}
