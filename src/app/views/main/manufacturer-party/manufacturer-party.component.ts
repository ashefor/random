declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { ManufacturerParty } from 'src/app/interfaces/manufacturer-party';
import { Title } from '@angular/platform-browser';
import { ValidatorService } from 'src/app/services/validators';
import { ManufacturerPartyService } from 'src/app/services/manufacturer-party.service';
import { CacheService } from 'src/app/services/cache.service';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-manufacturer-party',
  templateUrl: './manufacturer-party.component.html',
  styleUrls: ['./manufacturer-party.component.css']
})
export class ManufacturerPartyComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  imgLabel: string;
  manufacturers: Array<any>;
  parties: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  default: any;
  defaultForm: ManufacturerParty = { email: '', hash: '', manufacturer_id: 'select', name: '', phone: '', status: 'select', user_id: '' };
  create: ManufacturerParty = { email: '', hash: '', manufacturer_id: 'select', name: '', phone: '', status: 'select', user_id: '' };
  edit: ManufacturerParty = { email: '', hash: '', manufacturer_id: 'select', name: '', phone: '', status: 'select', user_id: '' };

  currentParty: any;

  modeWatch: Observable<number>;

  p = 1;

  constructor(title: Title, private validators: ValidatorService, private party: ManufacturerPartyService, private cache: CacheService,
    private manufacturer: ManufacturerService, private toastr: ToastrService) {
    this.title = 'Manufacturer Staff';
    title.setTitle('Suplias - Manufacturer Staff');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.cache.manufacturerStaff.subscribe((value) => {
      this.sorted = value;
      this.parties = value;
    });
    this.fetchParties();
    this.fetchManufacturers();
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
        this.party.delete(id).then(() => {
          this.resetForms(0);
          this.fetchParties();
          this.toastr.success('Manufacturer staff deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(party) {
    this.edit.email = party.email;
    this.edit.hash = party.hash;
    this.edit.manufacturer_id = party.manufacturer_id;
    this.edit.name = party.name;
    this.edit.phone = party.phone;
    this.edit.status = party.status;
    this.edit.user_id = party.user_id;
    this.currentParty = party;
    this.setMode(2);
  }

  emailValidate(email: string) {
    return this.validators.emailValidator(email);
  }

  checkValid(obj: ManufacturerParty) {
    const [email, hash, mId, name, phone, status, uId] =
    [obj.email, obj.hash, obj.manufacturer_id, obj.name, obj.phone, obj.status, obj.user_id];

    if (this.mode === this.modes[1] &&
      (email !== '' && hash !== '' && mId !== '' && name !== '' && String(phone) !== '' && status !== 'select' &&
      this.emailValidate(email) === true)) {
        return true;
    }

    if (this.mode === this.modes[2] &&
      (email !== '' && uId !== '' && mId !== '' && name !== '' && String(phone) !== '' && status !== 'select' &&
      this.emailValidate(email) === true)) {
        return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { email: '', hash: '', manufacturer_id: 'select', name: '', phone: '', status: 'select', user_id: '' };
    this.edit = { email: '', hash: '', manufacturer_id: 'select', name: '', phone: '', status: 'select', user_id: '' };
    this.currentParty = this.default;
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
    const [email, hash, mId, name, phone, status] =
    [create.email, create.hash, create.manufacturer_id, create.name, create.phone, create.status];
    this.party.create(phone, name, email, status, mId, hash).then(() => {
      this.fetchParties();
      this.closeCreate(0);
      this.toastr.success('Manufacturer staff created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentParty.email = this.edit.email;
    this.currentParty.manufacturer_id = this.edit.manufacturer_id;
    this.currentParty.name = this.edit.name;
    this.currentParty.phone = this.edit.phone;
    this.currentParty.status = this.edit.status;
    this.currentParty.user_id = this.edit.user_id;
    this.party.edit(this.currentParty).then(() => {
      this.fetchParties();
      this.closeEdit(0);
      this.toastr.success('Manufacturer staff edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchParties() {
    this.party.fetch().then(() => { });
  }

  fetchManufacturers() {
    this.manufacturer.fetchLite().then((manufacturers: Array<any>) => {
      this.manufacturers = manufacturers;
    });
  }

  search() {
    let searchPool = this.parties;
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
        this.sorted = this.parties;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.parties.filter((item) => {
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
        this.sorted = this.parties.filter((item) => {
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
        this.sorted = this.parties;
        break;
    }
  }

  sortByManufacturer(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.parties;
        this.sortOption1 = 'none';
        break;

      default:
        this.sorted = this.parties.filter((item) => {
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
}
