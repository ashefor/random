declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationArea } from 'src/app/interfaces/location-area';
import { Status } from 'src/app/interfaces/status';
import { LocationAreaService } from 'src/app/services/location-area.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { Title } from '@angular/platform-browser';
import { LocationService } from 'src/app/services/location.service';
import { ToastrService } from 'ngx-toastr';
import { CacheService } from 'src/app/services/cache.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-location-area',
  templateUrl: './location-area.component.html',
  styleUrls: ['./location-area.component.css']
})
export class LocationAreaComponent implements OnInit {
  areaName: string;
  areaId: string;
  manufacturer_id: any;

  title: any;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  locationAreas: Array<any>;
  locations: Array<any>;
  temp: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  defaultForm: LocationArea;
  public create: LocationArea;
  modeWatch: Observable<number>;

  p = 1;
  p1 = 1;
  p2 = 1;

  constructor(private data: DataHandlerService, title: Title, private locationArea: LocationAreaService,
    private route: ActivatedRoute, private location: LocationService, private toastr: ToastrService, private cache: CacheService) {
    this.areaId = this.route.snapshot.paramMap.get('areaId');
    cache.areas.subscribe((value) => {
      if (value) {
        // tslint:disable-next-line
        const area = value.find((area) => area._id === this.areaId);
        if (area) {
          this.areaName = area.name;
        } else {
          this.areaName = 'Locations';
        }
      } else {
        this.areaName = 'Locations';
      }
    });
    this.manufacturer_id = JSON.parse(this.data.getUserData().manufacturer)._id;
    title.setTitle(`Suplias - ${this.areaName}`);
    this.title = `${this.areaName}`;
    this.modes = ['view', 'add'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.defaultForm = { area_id: this.areaId, status: 'active', manufacturer_id: this.manufacturer_id, locations: [] };
    this.create = { area_id: this.areaId, status: 'active', manufacturer_id: this.manufacturer_id, locations: [] };
  }

  ngOnInit() {
    this.fetchLocationAreas();
    this.fetchLocations();
  }

  setMode(index: number): void {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  addOrRemove(id: string) {
    const locationIndex = this.create.locations.findIndex(item => {
      return item === id;
    });
    if (locationIndex > -1) {
      this.create.locations.splice(locationIndex, 1);
    } else {
      this.create.locations.push(id);
    }
  }

  spawnDelete(id) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.locationArea.delete(id).then(() => {
          this.resetForms(0);
          this.fetchLocationAreas();
          this.toastr.success(`Location removed from ${this.areaName}`);
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  checkValid(obj: LocationArea) {
    const [mId, aId, status, locations] = [obj.manufacturer_id, obj.area_id, obj.status, obj.locations];

    if (status !== '' && status !== 'select' && aId !== '' && mId !== '' && locations.length !== 0) {
      return true;
    }
    return false;
  }

  resetForms(index: number) {
    this.create = { area_id: this.areaId, status: 'active', manufacturer_id: this.manufacturer_id, locations: [] };
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  closeCreate(index: number): void {
    this.resetForms(index);
  }

  createAction() {
    const create = this.create;
    const [mId, aId, locations] = [create.manufacturer_id, create.area_id, create.locations];
    this.locationArea.bulkAdd(locations, aId, mId).then(() => {
      this.fetchLocationAreas();
      this.closeCreate(0);
      this.toastr.success(`Locations added to ${this.areaName}`);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  fetchLocationAreas() {
    this.locationArea.fetchByArea(this.areaId).then((locationAreas: Array<any>) => {
      if (locationAreas.length !== 0) {
        this.locationAreas = locationAreas.sort(function(a, b) {
          const A = a.location.toLowerCase(), B = b.location.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sorted = this.locationAreas;
      } else {
        this.locationAreas = [];
        this.sorted = [];
      }
    });
  }

  locationPresent(id: string) {
    return this.locationAreas.find((locationArea) => locationArea.location_id === id);
  }

  fetchLocations() {
    this.location.fetchAll().then((locations: Array<any>) => {
      if (locations !== []) {
        this.locations = locations.sort(function(a, b) {
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
        this.locations = [];
      }
    });
  }

  search() {
    let searchPool = this.locationAreas;
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
      if (v.location && q) {
        if ( v.location.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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
        this.sorted = this.locationAreas;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.locationAreas.filter((item) => {
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
        this.sorted = this.locationAreas.filter((item) => {
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
        this.sorted = this.locationAreas;
        break;
    }
  }
}
