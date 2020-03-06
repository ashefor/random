import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})

export class AreaService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(name: string, status: string, manufacturer_id: string) {
    const form = new FormData();
    form.append('name', name);
    form.append('status', status);
    form.append('manufacturer_id', manufacturer_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/area/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (this.validate(data) === true) {
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchAll(id: string) {
    const form = new FormData();
    form.append('manufacturer_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/area/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let areas = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/location_area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const locations = data.data;
              areas.map((area) => {
                area.locations = locations.filter((location) => location.area_id === area._id).length;
              });
              areas = areas.sort(function(a, b) {
                const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                if (A < B) {
                  return -1;
                }
                if (A > B) {
                  return 1;
                }
                return 0;
              });
              this.cache.setAreas(areas);
              resolve();
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setAreas([]);
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchLite() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          resolve(data.data);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  delete(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/area/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Delete failed'});
        }
      }, error => {
        reject({message: 'Delete failed'});
      });
    });
  }

  edit(area: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', area._id);
      form.append('name', area.name);
      form.append('status', area.status);
      form.append('manufacturer_id', area.manufacturer_id);

      this.http.post(`${host}/area/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  toggleStatus(area) {
    let status;
    if (area.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', area._id);
      form.append('status', status);
      this.http.post(`${host}/area/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Toggle failed!'});
        }
      }, () => {
        reject({message: 'Toggle failed!'});
      });
    });
  }

  addLocations(locations: Array<string>, area_id: string, manufacturer_id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('status', 'active');
      form.append('area_id', area_id);
      form.append('manufacturer_id', manufacturer_id);

      locations.forEach((location_id, index) => {
        form.append('location_id[]', location_id);
        if (index === locations.length - 1) {
          this.http.post(`${host}/location_area/add_bulk_location`, form, { headers: this.dataHandler.setHeader() })
          .subscribe((data: any) => {
            if (data.code === 200) {
              resolve();
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        }
      });
    });
  }

  toggleLocationAreaStatus(location_area) {
    let status;
    if (location_area.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', location_area._id);
      form.append('status', status);
      this.http.post(`${host}/location_area/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Toggle failed!'});
        }
      }, () => {
        reject({message: 'Toggle failed!'});
      });
    });
  }

  deleteLocationArea(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/location_area/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Delete failed'});
        }
      }, error => {
        reject({message: 'Delete failed'});
      });
    });
  }
}
