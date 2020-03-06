declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { DataHandlerService } from 'src/app/services/data.service';
import { Code } from 'src/app/interfaces/code';
import { CodeService } from 'src/app/services/code.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css']
})
export class CodeComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  codes: Array<any>;

  seller_id: string;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  default: any;
  create: Code;
  edit: Code;

  currentCode: any;
  p = 1;

  modeWatch: Observable<number>;

  constructor(title: Title, private codeService: CodeService, private data: DataHandlerService,
    private cache: CacheService, private toastr: ToastrService) {
    this.title = 'Referral Codes';
    title.setTitle('Suplias - Referral Codes');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.seller_id = data.getUserData().seller_id;
  }

  ngOnInit() {
    this.cache.codes.subscribe((value) => {
      this.codes = value;
      this.sorted = value;
    });
    this.create = { seller_id: this.seller_id, code: '', status: 'select' };
    this.edit = {  seller_id: this.seller_id, code: '', status: 'select' };
    this.fetchCodes(this.seller_id);
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  resetForms(index: number) {
    this.create = { seller_id: this.data.getUserData().seller_id, code: '', status: 'select' };
    this.edit = {  seller_id: this.data.getUserData().seller_id, code: '', status: 'select' };
    this.currentCode = this.default;
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
        this.codeService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchCodes(this.seller_id);
          this.toastr.success('Referral code deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }
  spawnEdit(code) {
    this.edit.seller_id = code.seller_id;
    this.edit.code = code.code;
    this.edit.status = code.status;
    this.currentCode = code;
    this.setMode(2);
  }

  checkValid(obj: Code) {
    const [seller_id, code, status] = [obj.seller_id, obj.code, obj.status];

    if (this.mode === this.modes[1] && code !== '' && seller_id !== '' && status !== 'select') {
      return true;
    }

    if (this.mode === this.modes[2] && code !== '' && seller_id !== '' && status !== 'select') {
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
    const [code, status, seller_id] = [create.code, create.status, create.seller_id];
    this.codeService.create(code.toUpperCase(), status, seller_id).then(() => {
      this.fetchCodes(seller_id);
      this.closeCreate(0);
      this.toastr.success('Referral code created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentCode.code = this.edit.code;
    this.currentCode.status = this.edit.status;
    this.currentCode.seller_id = this.edit.seller_id;
    this.codeService.edit(this.currentCode).then(() => {
      this.fetchCodes(this.seller_id);
      this.closeEdit(0);
      this.toastr.success('Referral code edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.codes;
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
      if (v.code && q) {
        if ( v.code.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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
        this.sorted = this.codes;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.codes.filter((item) => {
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
        this.sorted = this.codes.filter((item) => {
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
        this.sorted = this.codes;
        break;
    }
  }

  fetchCodes(seller_id: string) {
    this.codeService.fetchAll(seller_id).then(() => {}).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  generateCode() {
    this.create.code = this.generateRand(7);
  }

  generateRand(length: number) {
    let text = '';
    const possible = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text.toUpperCase();
  }
}
