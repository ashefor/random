declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { Title } from '@angular/platform-browser';
import { ValidatorService } from 'src/app/services/validators';
import { Manager } from 'src/app/interfaces/manager';
import { ManagerService } from 'src/app/services/manager.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  managers: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  default: any;
  defaultForm: Manager = { email: '', hash: '', name: '', phone: '', status: 'select', user_id: '' };
  create: Manager = { email: '', hash: '', name: '', phone: '', status: 'select', user_id: '' };
  edit: Manager = { email: '', hash: '', name: '', phone: '', status: 'select', user_id: '' };

  currentManager: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, private validators: ValidatorService, private manager: ManagerService, private cache: CacheService,
    private toastr: ToastrService) {
    this.title = 'Account Managers';
    title.setTitle('Suplias - Account Managers');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.cache.accountManagers.subscribe((value) => {
      this.sorted = value;
      this.managers = value;
    });
    this.fetchManagers();
  }

  validateHash(hash) {
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
        this.manager.delete(id).then(() => {
          this.resetForms(0);
          this.fetchManagers();
          this.toastr.success('Account manager deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(manager) {
    this.edit.email = manager.email;
    this.edit.hash = manager.hash;
    this.edit.name = manager.name;
    this.edit.phone = manager.phone;
    this.edit.status = manager.status;
    this.edit.user_id = manager.user_id;
    this.currentManager = manager;
    this.setMode(2);
  }

  emailValidate(email: string) {
    return this.validators.emailValidator(email);
  }

  checkValid(obj: Manager) {
    const [email, hash, name, phone, status, uId] =
    [obj.email, obj.hash, obj.name, obj.phone, obj.status, obj.user_id];

    if (this.mode === this.modes[1] &&
      (email !== '' && hash !== '' && name !== '' && String(phone) !== '' && status !== 'select' &&
      this.emailValidate(email) === true)) {
        return true;
    }

    if (this.mode === this.modes[2] &&
      (email !== '' && uId !== '' && name !== '' && String(phone) !== '' && status !== 'select' &&
      this.emailValidate(email) === true)) {
        return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { email: '', hash: '', name: '', phone: '', status: 'select', user_id: '' };
    this.edit = { email: '', hash: '', name: '', phone: '', status: 'select', user_id: '' };
    this.currentManager = this.default;
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
    const [email, hash, name, phone, status] =
    [create.email, create.hash, create.name, create.phone, create.status];
    this.manager.create(phone, name, email, status, hash).then(() => {
      this.fetchManagers();
      this.closeCreate(0);
      this.toastr.success('Account manager created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentManager.email = this.edit.email;
    this.currentManager.name = this.edit.name;
    this.currentManager.phone = this.edit.phone;
    this.currentManager.status = this.edit.status;
    this.currentManager.user_id = this.edit.user_id;
    this.manager.edit(this.currentManager).then(() => {
      this.fetchManagers();
      this.closeEdit(0);
      this.toastr.success('Account manager edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchManagers() {
    this.manager.fetch().then(() => { });
  }

  search() {
    let searchPool = this.managers;
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
        this.sorted = this.managers;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.managers.filter((item) => {
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
        this.sorted = this.managers.filter((item) => {
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
        this.sorted = this.managers;
        break;
    }
  }
}
