import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class InsightService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(title: string, type: string, level: string, target: string, ago: number, status: string) {
    const form = new FormData();
    form.append('title', title);
    form.append('type', type);
    form.append('level', level);
    form.append('target', target);
    form.append('ago', String(ago));
    form.append('status', status);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/insight/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/insight/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          const insights = data.data.sort(function(a, b) {
            const A = a.title, B = b.title;
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          this.cache.setInsights(insights);
          resolve(insights);
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setInsights([]);
          resolve([]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByLevel(level: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('level', level);
      this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          const insights = data.data.sort(function(a, b) {
            const A = a.title, B = b.title;
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          resolve(insights);
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
    console.log(id);
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/insight/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(_insight: any) {
    return new Promise((resolve, reject) => {
      console.log(_insight);
      const form = new FormData();
      form.append('_id', _insight._id);
      form.append('title', _insight.title);
      form.append('type', _insight.type);
      form.append('level', _insight.level);
      form.append('target', _insight.target);
      form.append('ago', String(_insight.ago));
      form.append('status', _insight.status);

      this.http.post(`${host}/insight/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(_insight) {
    let status;
    if (_insight.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _insight._id);
      form.append('status', status);
      this.http.post(`${host}/insight/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchTags(target: string, level: string) {
    const form = new FormData();
    form.append('target', target);
    form.append('level', level);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/insight/filter`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve(data['data']);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchInstances(insight_id: string, parent: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/insight_instance/read_all`, { headers: this.dataHandler.setHeader() })
        .subscribe((data: any) => {
        if (data.code === 200) {
          const instances: any[] = data.data.filter((d) => d.insight_id === insight_id);
          if (instances.length > 0) {
            // tslint:disable-next-line
            this.http.get(`${host}/${parent}/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                const parents: any[] = data.data;
                if (parents.length > 0) {
                  instances.map((instance) => {
                    instance.head = parents.find((p) => p._id === instance.parent_id).name;
                  });
                  resolve(instances);
                } else {
                  resolve([]);
                }
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            resolve([]);
          }
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  toggleInstanceStatus(_id: string, status: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _id);
      form.append('status', status);
      this.http.post(`${host}/insight_instance/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
}
