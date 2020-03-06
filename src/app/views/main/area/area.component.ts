declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { DataHandlerService } from 'src/app/services/data.service';
import { Status } from 'src/app/interfaces/status';
import { Area } from 'src/app/interfaces/area';
import { AreaService } from 'src/app/services/area.service';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { LocationAreaService } from 'src/app/services/location-area.service';
import { CacheService } from 'src/app/services/cache.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent implements OnInit {
  manufacturer_id: any;
  title: any;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  areas: Array<any>;
  temp: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  default: any;
  defaultForm: Area;
  public create: Area;
  public edit: Area;

  currentArea: any;
  p = 1;

  modeWatch: Observable<number>;

  constructor(data: DataHandlerService, private http: HttpClient, title: Title, private area: AreaService,
    private locationArea: LocationAreaService, private cache: CacheService, private toastr: ToastrService) {
    this.manufacturer_id = JSON.parse(data.getUserData().manufacturer)._id;
    this.defaultForm = { name: '', manufacturer_id: this.manufacturer_id, status: 'select' };
    this.create = { name: '', manufacturer_id: this.manufacturer_id, status: 'select' };
    this.edit = { name: '', manufacturer_id: this.manufacturer_id, status: 'select' };
    title.setTitle('Suplias - Areas');
    this.title = 'Areas';
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.cache.areas.subscribe((value) => {
      this.areas = value;
      this.sorted = value;
    });
    this.fetchAreas();
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
        this.area.delete(id).then(() => {
          this.resetForms(0);
          this.fetchAreas();
          this.toastr.success('Area deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(area) {
    this.edit.name = area.name;
    this.edit.manufacturer_id = area.manufacturer_id;
    this.edit.status = area.status;
    this.currentArea = area;
    this.setMode(2);
  }

  checkValid(obj: Area) {
    const [mId, name, status] = [obj.manufacturer_id, obj.name, obj.status];

    if (status !== 'select' && name !== '' && mId !== '') {
      return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { name: '', manufacturer_id: this.manufacturer_id, status: 'select' };
    this.edit = { name: '', manufacturer_id: this.manufacturer_id, status: 'select' };
    this.currentArea = this.default;
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
    const [mId, name, status] = [create.manufacturer_id, create.name, create.status];
    this.area.create(name, status, mId).then(() => {
      this.fetchAreas();
      this.closeCreate(0);
      this.toastr.success('Area created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchAreas() {
    this.area.fetchAll(this.manufacturer_id).then(() => {});
  }

  editAction() {
    this.currentArea.manufacturer_id = this.edit.manufacturer_id;
    this.currentArea.name = this.edit.name;
    this.currentArea.status = this.edit.status;

    this.area.edit(this.currentArea).then(() => {
      this.fetchAreas();
      this.closeEdit(0);
      this.toastr.success('Area edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.areas;
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
        this.sorted = this.areas;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.areas.filter((item) => {
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
        this.sorted = this.areas.filter((item) => {
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
        this.sorted = this.areas;
        break;
    }
  }
}
