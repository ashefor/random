declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Earning } from '../../../interfaces/earning';
import { Title } from '@angular/platform-browser';
import { EarningService } from 'src/app/services/earning.service';
import { SellerService } from 'src/app/services/seller.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-earning',
  templateUrl: './earning.component.html',
  styleUrls: ['./earning.component.css']
})
export class EarningComponent implements OnInit {
  title: any;
  icon: any;
  modes: Array<any>;
  mode: any;
  sellers: Array<any>;
  statuses: Array<any>;
  earnings: Array<any>;
  temp: any;

  triggers: Array<any>;
  triggerTypes: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  modeWatch: Observable<number>;

  // Objects for template-driven forms
  default: any;
  defaultForm: Earning = { amount: 0, is_percentage: 'select', seller_id: 'select', trigger: 'ORDER' };
  create: Earning = { amount: 0, is_percentage: 'select', seller_id: 'select', trigger: 'ORDER' };
  edit: Earning = { amount: 0, is_percentage: 'select', seller_id: 'select', trigger: 'ORDER' };

  currentEarning: any;
  p = 1;

  constructor(public http: HttpClient, title: Title, private earningService: EarningService, private sellerService: SellerService,
    private cache: CacheService, private toastr: ToastrService) {
    title.setTitle('Suplias - Earnings');
    this.title = 'Earnings';
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Cash', value: 'cash'},
      { name: 'Percentage', value: 'percentage'}
    ];

    this.triggers = [
      { name: 'Order', value: 'ORDER' }
    ];

    this.triggerTypes = [
      { name: 'Percentage', value: 'true' },
      { name: 'Cash', value: 'false' }
    ];
  }

  ngOnInit() {
    this.sortOption = 'all';
    this.cache.earnings.subscribe((value) => {
      this.sorted = value;
      this.earnings = value;
    });
    this.fetchEarnings();
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
        this.earningService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchEarnings();
          this.toastr.success('Earning deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(earning) {
    this.edit.amount = earning.amount;
    this.edit.is_percentage = earning.is_percentage;
    this.edit.seller_id = earning.seller_id;
    this.edit.trigger = earning.trigger;
    this.currentEarning = earning;
    this.setMode(2);
  }

  checkValid(obj: Earning) {
    const [amount, is_percentage, seller_id, trigger] = [obj.amount, obj.is_percentage, obj.seller_id, obj.trigger];

    if (amount !== 0 && is_percentage !== 'select' && seller_id !== 'select' && trigger !== 'select') {
      return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { amount: 0, is_percentage: 'select', seller_id: 'select', trigger: 'ORDER' };
    this.edit = { amount: 0, is_percentage: 'select', seller_id: 'select', trigger: 'ORDER' };
    this.currentEarning = this.default;
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
    const [amount, is_percentage, seller_id, trigger] = [create.amount, create.is_percentage, create.seller_id, create.trigger];
    this.earningService.create(trigger, is_percentage, amount, seller_id).then(() => {
      this.fetchEarnings();
      this.closeCreate(0);
      this.toastr.success('Earning created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentEarning.amount = this.edit.amount;
    this.currentEarning.is_percentage = this.edit.is_percentage;
    this.currentEarning.seller_id = this.edit.seller_id;
    this.currentEarning.trigger = this.edit.trigger;

    this.earningService.edit(this.currentEarning).then(() => {
      this.fetchEarnings();
      this.closeEdit(0);
      this.toastr.success('Earning edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.earnings;
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
      if (v.sellerName && q) {
        if ( v.sellerName.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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
        this.sorted = this.earnings;
        this.sortOption = 'all';
        break;
      case 'percentage':
        this.sorted = this.earnings.filter((item) => {
          return item.is_percentage === 'true';
        }).sort(function(a, b) {
          const A = a.sellerName.toLowerCase(), B = b.sellerName.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'percentage';
        break;
      case 'cash':
        this.sorted = this.earnings.filter((item) => {
          return item.is_percentage === 'false';
        }).sort(function(a, b) {
          const A = a.sellerName.toLowerCase(), B = b.sellerName.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'cash';
        break;

      default:
        this.sorted = this.earnings;
        break;
    }
  }

  fetchEarnings() {
    this.earningService.fetchAll().then(() => { });
  }

  fetchSellers() {
    this.sellerService.fetch().then((sellers: Array<any>) => {
      this.sellers = sellers;
    });
  }

  sentenceCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
