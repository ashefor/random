declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Status } from '../../../interfaces/status';
import { Location } from '../../../interfaces/location';
import { Title } from '@angular/platform-browser';
import { LocationService } from 'src/app/services/location.service';
import { Subscription, Observable, of } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})

export class LocationComponent implements OnInit {
  title: any;
  icon: any;
  modes: Array<any>;
  mode: any;
  locationUrl: string;
  states: Array<any>;
  lgas: Array<any>;
  statuses: Array<Status>;
  locations: Array<any>;
  temp: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';
  itemsPerPage = 6;
  modeWatch: Observable<number>;

  // Objects for template-driven forms
  default: any;
  defaultForm: Location = {name: '', lga: 'select', state: 'Abia', status: 'select'};
  public create: Location = {name: '', lga: 'select', state: 'Abia', status: 'select'};
  public edit: Location = {name: '', lga: 'select', state: 'Abia', status: 'select'};

  currentLocation: any;
  p = 1;

  constructor(public http: HttpClient, title: Title, private location: LocationService, private cache: CacheService,
    private toastr: ToastrService) {
    title.setTitle('Suplias - Locations');
    this.title = 'Locations';
    this.icon = 'compass';
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.locationUrl = environment.locationUrl;
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.cache.locations.subscribe((value) => {
      this.sorted = value;
      this.locations = value;
    });
    this.fetchStates();
    this.fetchLocations();
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
        this.location.delete(id).then(() => {
          this.resetForms(0);
          this.fetchLocations();
          this.toastr.success('Location deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(location) {
    this.edit.name = location.name;
    this.edit.lga = location.lga;
    this.edit.state = location.state;
    this.edit.status = location.status;
    this.currentLocation = location;
    this.fetchLgas(location.state, 'init');
    this.setMode(2);
  }

  itemIndex(indexOnPage: number): number {
    return (this.itemsPerPage * (this.p - 1)) + indexOnPage;
  }
  checkValid(obj: Location) {
    const [lga, name, state, status] = [obj.lga, obj.name, obj.state, obj.status];

    if (lga !== 'select' && name !== '' && state !== 'select' && status !== 'select') {
      return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = {name: '', lga: 'select', state: 'Abia', status: 'select'};
    this.edit = {name: '', lga: 'select', state: 'Abia', status: 'select'};
    this.currentLocation = this.default;
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
    const [name, state, lga, status] = [create.name, create.state, create.lga, create.status];
    this.location.create(name, lga, state, status).then(() => {
      this.fetchLocations();
      this.closeCreate(0);
      this.toastr.success('Location created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchLocations() {
    this.location.fetchAll().then(() => { });
  }

  editAction() {
    this.currentLocation.name = this.edit.name;
    this.currentLocation.lga = this.edit.lga;
    this.currentLocation.state = this.edit.state;
    this.currentLocation.status = this.edit.status;

    this.location.edit(this.currentLocation).then(() => {
      this.fetchLocations();
      this.closeEdit(0);
      this.toastr.success('Location edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.locations;
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
        this.sorted = this.locations;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.locations.filter((item) => {
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
        this.sorted = this.locations.filter((item) => {
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
        this.sorted = this.locations;
        break;
    }
  }

  async fetchStates(): Promise<Subscription> {
    const fetch = await this.http.get(`${this.locationUrl}states`).subscribe((data: any) => {
      this.states = data;
      this.fetchLgas(data[0].name, 'init');
    });
    return fetch;
  }

  async fetchLgas(event: any, src: string): Promise<Subscription> {
    if (src === 'init') {
      this.temp = event;
    } else {
      this.temp = event.srcElement.value;
    }
    const state = this.temp;
    const fetch = await this.http.get(`${this.locationUrl}states/${state}/lgas`).subscribe((data: any) => {
      this.lgas = data;
    });
    return fetch;
  }
}
