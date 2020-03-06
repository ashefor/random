declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Feature } from 'src/app/interfaces/feature';
import { FeatureService } from 'src/app/services/feature.service';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.css']
})
export class FeatureComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  features: Array<any>;

  user_id: string;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  create: Feature;
  edit: Feature;

  currentFeature: any;
  manufacturers: Array<any>;

  modeWatch: Observable<number>;
  p = 1;

  _codes = [
    { name: 'Email Notification', value: 'EMAIL' },
    { name: 'Orders', value: 'ORDER' },
    { name: 'SMS Notification', value: 'SMS' }
  ];

  constructor(title: Title, private featureService: FeatureService, data: DataHandlerService,
    private cache: CacheService, private toastr: ToastrService, private manufacturer: ManufacturerService) {
    this.title = 'Features Flags';
    title.setTitle('Suplias - Features Flags');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.user_id = data.getUserData()._id;
  }

  ngOnInit() {
    this.cache.features.subscribe((value) => {
      this.features = value;
      this.sorted = value;
    });
    this.create = { user_id: this.user_id, code: 'select', manufacturer_id: 'select' };
    this.edit = { user_id: this.user_id, code: 'select', manufacturer_id: 'select' };
    this.fetchFeatures();
    this.fetchManufacturers();
  }

  fetchTitleByCode(_code: string) {
    return this._codes.find((code) => code.value === _code).name;
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  resetForms(index: number) {
    this.create = { user_id: this.user_id, code: 'select', manufacturer_id: 'select' };
    this.edit = { user_id: this.user_id, code: 'select', manufacturer_id: 'select' };
    this.currentFeature = null;
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
        this.featureService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchFeatures();
          this.toastr.success('Feature deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(feature) {
    this.edit.code = feature.code;
    this.edit.manufacturer_id = feature.manufacturer_id;
    this.edit.user_id = feature.user_id;
    this.currentFeature = feature;
    this.setMode(2);
  }

  checkValid(obj: Feature) {
    const [user_id, code, manufacturer_id] = [obj.user_id, obj.code, obj.manufacturer_id];

    return (code !== 'select' && user_id !== '' && manufacturer_id !== 'select');
  }

  closeCreate(index: number) {
    this.resetForms(index);
  }

  closeEdit(index: number) {
    this.resetForms(index);
  }

  createAction() {
    const create = this.create;
    const [code, user_id, manufacturer_id] = [create.code, create.user_id, create.manufacturer_id];
    this.featureService.create(code, manufacturer_id, user_id).then(() => {
      this.fetchFeatures();
      this.closeCreate(0);
      this.toastr.success('Feature created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentFeature.code = this.edit.code;
    this.currentFeature.user_id = this.edit.user_id;
    this.currentFeature.manufacturer_id = this.edit.manufacturer_id;
    this.featureService.edit(this.currentFeature).then(() => {
      this.fetchFeatures();
      this.closeEdit(0);
      this.toastr.success('Feature edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.features;
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
      if (v.manufacturerName && q) {
        if ( v.manufacturerName.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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
        this.sorted = this.features;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.features.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.manufacturerName, B = b.manufacturerName;
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
        this.sorted = this.features.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.manufacturerName, B = b.manufacturerName;
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
        this.sorted = this.features;
        break;
    }
  }

  fetchFeatures() {
    this.featureService.fetchAll().then(() => {}).catch((error) => { this.toastr.error(error.message); });
  }

  fetchManufacturers() {
    this.manufacturer.fetchLite().then((manufacturers: any) => {
      this.manufacturers = manufacturers;
    });
  }
}
