declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { SellerService } from 'src/app/services/seller.service';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { Fee } from 'src/app/interfaces/fee';
import { FeeService } from 'src/app/services/fee.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-fee',
  templateUrl: './fee.component.html',
  styleUrls: ['./fee.component.css']
})
export class FeeComponent implements OnInit {
  title: any;
  modes: Array<any>;
  mode: any;
  fees: Array<any>;
  statuses: Array<any>;
  sellers: Array<any> = [];
  manufacturers: Array<any>;
  temp: any;
  tempSellers: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  default: any;
  defaultForm: Fee;
  create: Fee;
  edit: Fee;

  currentFee: any;
  payer: string;
  amountPaying = 0;
  amountOwed: number;

  modeWatch: Observable<number>;

  p = 1;

  constructor(public http: HttpClient, title: Title, private feeService: FeeService, private sellerService: SellerService,
    private manufacturerService: ManufacturerService, private dataService: DataHandlerService, private cache: CacheService,
    private toastr: ToastrService) {
    title.setTitle('Suplias - Fees');
    this.title = 'Fees';
    this.modes = ['view', 'add', 'edit', 'pay'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'}
    ];
    this.defaultForm = { manufacturer_id: 'select', seller_id: 'select', user_id: dataService.getUserData()._id, value: 0 };
    this.create = { manufacturer_id: 'select', seller_id: 'select', user_id: dataService.getUserData()._id, value: 0 };
    this.edit = { manufacturer_id: 'select', seller_id: 'select', user_id: dataService.getUserData()._id, value: 0 };
  }

  ngOnInit() {
    this.cache.fees.subscribe((value) => {
      this.sorted = value;
      this.fees = value;
    });
    this.fetchFees();
    this.fetchManufacturers();
    this.fetchSellers();
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
        this.feeService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchFees();
          this.toastr.success('Fee deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnPay(manufacturer_id: string, amountOwed: number) {
    this.payer = manufacturer_id;
    this.amountOwed = amountOwed;
    this.setMode(3);
  }

  payDues() {
    this.feeService.payDues(this.payer, this.amountPaying).then(() => {
      this.resetForms(0);
      this.fetchFees();
      this.toastr.success('Payment successful');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  spawnEdit(fee) {
    this.edit.manufacturer_id = fee.manufacturer_id;
    this.edit.seller_id = fee.seller_id;
    this.edit.user_id = fee.user_id;
    this.edit.value = fee.value;
    this.currentFee = fee;
    this.setMode(2);
  }

  checkValid(obj: Fee) {
    const [manufacturer_id, seller_id, user_id, value] = [obj.manufacturer_id, obj.seller_id, obj.user_id, obj.value];

    if (value !== 0 && manufacturer_id !== 'select' && seller_id !== 'select' && user_id !== '') {
      return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { manufacturer_id: 'select', seller_id: 'select', user_id: this.dataService.getUserData()._id, value: 0 };
    this.edit = { manufacturer_id: 'select', seller_id: 'select', user_id: this.dataService.getUserData()._id, value: 0 };
    this.currentFee = this.default;
    this.payer = undefined;
    this.amountPaying = 0;
    this.sellers = [];
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
    const [manufacturer_id, seller_id, user_id, value] =
      [create.manufacturer_id, create.seller_id, create.user_id, create.value];
    this.feeService.create(manufacturer_id, user_id, value, seller_id).then(() => {
      this.fetchFees();
      this.closeCreate(0);
      this.toastr.success('Fee created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentFee.seller_id = this.edit.seller_id;
    this.currentFee.value = this.edit.value;
    this.currentFee.user_id = this.edit.user_id;
    this.currentFee.manufacturer_id = this.edit.manufacturer_id;

    this.feeService.edit(this.currentFee).then(() => {
      this.fetchFees();
      this.closeEdit(0);
      this.toastr.success('Fee edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.fees;
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
      if (v.seller && q) {
        if ( v.seller.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  sortByManufacturer(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.fees;
        this.sortOption = 'none';
        break;

      default:
        this.sorted = this.fees.filter((item) => {
          return item.manufacturer_id === val;
        }).sort(function(a, b) {
          const A = a.seller.toLowerCase(), B = b.seller.toLowerCase();
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

  fetchFees() {
    this.feeService.fetchAll().then(() => { });
  }

  fetchSellers() {
    this.sellerService.fetch().then((sellers: Array<any>) => {
      this.tempSellers = sellers;
    });
  }

  fetchManufacturers() {
    this.manufacturerService.fetchLite().then((manufacturers: Array<any>) => {
      if (manufacturers !== []) {
        this.manufacturers = manufacturers.sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
      } else {
        this.manufacturers = [];
      }
    });
  }

  sortSellers(e: any) {
    const manufacturer_id = e.srcElement.value;
    this.sellers = this.tempSellers.filter(item => {
      return item.manufacturer_id === manufacturer_id;
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
  }
}
