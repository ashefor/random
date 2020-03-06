import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class LocationAreaService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  fetchByArea(id: string) {
    const form = new FormData();
    form.append('area_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/location_area/read_by_area`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const lAreas: Array<any> = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/location/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const locations = data.data;
              lAreas.map((area) => {
                area.location = locations.find((location) => {
                  return location._id === area.location_id;
                }).name;
              });
              resolve(lAreas);
            } else if (data.code === 200 && data.data.length === 0) {
              resolve([]);
            } else {
              reject(data);
            }
          });
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByManufacturer(id: string) {
    const form = new FormData();
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/location_area/read_all`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const lAreas = data.data.filter(item => {
            return item.manufacturer_id === id;
          });
          resolve(lAreas);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  bulkAdd(locations: Array<string>, area_id: string, manufacturer_id: string) {
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

  toggleStatus(location_area) {
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

  delete(id: string) {
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
