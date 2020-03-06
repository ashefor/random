declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { Billing } from 'src/app/interfaces/billing';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { BillingService } from 'src/app/services/billing.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  billings: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  default: any;
  create: Billing;
  edit: Billing;

  currentBilling: any;
  p = 1;

  modeWatch: Observable<number>;

  createForm: FormGroup;
  editForm: FormGroup;

  constructor(title: Title, private cache: CacheService, private toastr: ToastrService, private billing: BillingService,
    formBuilder: FormBuilder) {
    this.title = 'Finances (Billing)';
    title.setTitle('Suplias - Finances (Billing)');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];

    this.create = { code: null, maximum: null, minimum: null, status: null, title: null };
    this.edit = { code: null, maximum: null, minimum: null, status: null, title: null, _id: null };

    this.createForm = formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      code: ['', Validators.compose([Validators.required])],
      minimum: [null, Validators.compose([Validators.required])],
      maximum: [null, Validators.compose([Validators.required])],
      status: ['', Validators.compose([Validators.required])]
    });

    this.editForm = formBuilder.group({
      _id: [''],
      title: ['', Validators.compose([Validators.required])],
      code: ['', Validators.compose([Validators.required])],
      minimum: [null, Validators.compose([Validators.required])],
      maximum: [null, Validators.compose([Validators.required])],
      status: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.fetchBillings();
    this.cache.billings.subscribe((value) => {
      this.billings = value;
      this.sorted = value;
    });
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  resetForms(index: number) {
    this.createForm.reset();
    this.editForm.reset();
    this.create = { code: null, maximum: null, minimum: null, status: null, title: null };
    this.edit = { code: null, maximum: null, minimum: null, status: null, title: null, _id: null };
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  spawnDelete(id: string) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.billing.delete(id).then(() => {
          this.resetForms(0);
          this.fetchBillings();
          this.toastr.success('Billing deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(billing) {
    const { _id, title, code, minimum, maximum, status } = billing, temp = { _id, title, code, minimum, maximum, status };

    Object.keys(temp).map((key) => {
      this.editForm.controls[key].setValue(temp[key]);
    });
    this.currentBilling = billing;
    this.setMode(2);
  }

  closeForm(index: number) {
    this.resetForms(index);
  }

  createAction() {
    if (this.createForm.valid) {
      Object.keys(this.createForm.controls).map((key) => {
        this.create[key] = this.createForm.controls[key].value;
      });

      this.billing.create(this.create).then(() => {
        this.fetchBillings();
        this.closeForm(0);
        this.toastr.success('Billing created');
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  editAction() {
    if (this.editForm.valid) {
      Object.keys(this.editForm.controls).map((key) => {
        this.edit[key] = this.editForm.controls[key].value;
      });

      this.billing.edit(this.edit).then(() => {
        this.fetchBillings();
        this.closeForm(0);
        this.toastr.success('Billing edited');
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  search() {
    let searchPool = this.billings;
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

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.billings;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.billings.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.created, B = b.created;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.billings.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.created, B = b.created;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.billings;
        break;
    }
  }

  fetchBillings() {
    this.billing.fetchAll().then(() => {}).catch((error) => {
      this.toastr.error(error.message);
    });
  }
}
