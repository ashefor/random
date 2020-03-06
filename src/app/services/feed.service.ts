import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';
import { SecureRandString } from '../utils/rand';

const host = environment.host, fileHost = environment.fileHost;

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  fetchAll(manufacturer_id?: string) {
    return new Promise((resolve, reject) => {
      if (!manufacturer_id) {
        this.http.get(`${host}/feed/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            let feed = data.data;
            // tslint:disable-next-line
            this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                const uploads = data.data;
                // tslint:disable-next-line
                this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    const manufacturers: Array<any> = data.data;
                    feed.map((_feed) => {
                      _feed.upload_id !== '-' ? _feed.image = `${fileHost}${uploads.find((upload) => {
                        return upload._id === _feed.upload_id;
                      }).path}` : _feed.image = null;
                      const _manufacturer = manufacturers.find((manufacturer) => manufacturer._id === _feed.manufacturer_id);
                      console.log(_feed.manufacturer);
                      !_manufacturer ? _feed.manufacturer = 'All manufacturers' : _feed.manufacturer = _manufacturer.name;
                    });
                    feed = feed.sort(function(a, b) {
                      const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                      if (A < B) {
                        return -1;
                      }
                      if (A > B) {
                        return 1;
                      }
                      return 0;
                    });
                    console.log(feed);
                    this.cache.setFeed(feed);
                    resolve();
                  } else {
                    reject(data);
                  }
                }, error => {
                  reject(error);
                });
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else if (data.code === 200 && data.data.length === 0) {
            this.cache.setFeed([]);
            resolve();
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        this.http.get(`${host}/feed/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            let feed = data.data;
            feed = feed.filter((_feed) => _feed.manufacturer_id === manufacturer_id);
            if (feed.length > 0) {
              // tslint:disable-next-line
              this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const uploads = data.data;
                  feed.map((_feed) => {
                    _feed.upload_id !== '-' ? _feed.image = `${fileHost}${uploads.find((upload) => {
                      return upload._id === _feed.upload_id;
                    }).path}` : _feed.image = null;
                  });
                  feed = feed.sort(function(a, b) {
                    const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  console.log(feed);
                  this.cache.setFeed(feed);
                  resolve();
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else {
              this.cache.setFeed([]);
              resolve();
            }
          } else if (data.code === 200 && data.data.length === 0) {
            this.cache.setFeed([]);
            resolve();
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  fetchLite(manufacturer_id?: string) {
    return new Promise((resolve, reject) => {
      if (!manufacturer_id) {
        this.http.get(`${host}/feed/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (data.code === 200) {
            resolve(data.data);
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        this.http.get(`${host}/feed/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (data.code === 200) {
            resolve(data.data.filter((_feed) => _feed.manufacturer_id === manufacturer_id));
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  create(title: string, description: string, ttl: number, status: string, manufacturer_id: string, upload?: any) {
    return new Promise((resolve, reject) => {
      if (upload) {
        let form = new FormData();
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (data.code === 200) {
            form = new FormData();
            form.append('title', title);
            form.append('description', description);
            form.append('ttl', `${ttl}`);
            form.append('status', status);
            form.append('manufacturer_id', manufacturer_id);
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/feed/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                resolve();
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        const form = new FormData();
        form.append('title', title);
        form.append('description', description);
        form.append('ttl', `${ttl}`);
        form.append('status', status);
        form.append('manufacturer_id', manufacturer_id);
        form.append('upload_id', '-');

        // tslint:disable-next-line
        this.http.post(`${host}/feed/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
  }

  edit(_feed: any, upload?: any) {
    return new Promise((resolve, reject) => {
      if (upload) {
        let form = new FormData();
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (data.code === 200) {
            form = new FormData();
            form.append('_id', _feed._id);
            form.append('title', _feed.title);
            form.append('description', _feed.description);
            form.append('ttl', `${_feed.ttl}`);
            form.append('status', _feed.status);
            form.append('manufacturer_id', _feed.manufacturer_id);
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/feed/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                resolve();
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        const form = new FormData();
        form.append('_id', _feed._id);
        form.append('title', _feed.title);
        form.append('description', _feed.description);
        form.append('ttl', `${_feed.ttl}`);
        form.append('status', _feed.status);
        form.append('manufacturer_id', _feed.manufacturer_id);
        form.append('upload_id', _feed.upload_id);

        // tslint:disable-next-line
        this.http.post(`${host}/feed/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
  }

  toggleStatus(feed) {
    let status;
    if (feed.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', feed._id);
      form.append('status', status);
      this.http.post(`${host}/feed/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

      this.http.post(`${host}/feed/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
