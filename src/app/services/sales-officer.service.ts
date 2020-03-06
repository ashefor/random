import { Injectable } from '@angular/core';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class SalesOfficerService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(phone: string, name: string, email: string, status: string, role: string, sellerId: string, seller_area_id: string, hash: string) {
    const form = new FormData();
    form.append('phone', phone);
    form.append('name', name);
    form.append('email', email);
    form.append('status', status);
    form.append('role', role);
    form.append('seller_id', sellerId);
    form.append('seller_area_id', seller_area_id);
    form.append('hash', hash);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/sales_officer/signup`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetch(role: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('role', role);
      this.http.post(`${host}/sales_officer/read_by_role`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let officers = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const sellers = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/seller_area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const seller_areas = data.data;
                  // tslint:disable-next-line
                  this.http.get(`${host}/area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200) {
                      const areas = data.data;
                      officers.map((officer) => {
                        officer.seller = sellers.find(seller => {
                          return seller._id === officer.seller_id;
                        }).name;
                        const seller_area = seller_areas.find(SA => SA._id === officer.seller_area_id),
                          area = areas.find(_area => _area._id === seller_area.area_id);
                        officer.area = area.name;
                      });
                      officers = officers.sort(function(a, b) {
                        const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                        if (A < B) {
                          return -1;
                        }
                        if (A > B) {
                          return 1;
                        }
                        return 0;
                      });
                      if (role === 'manager') {
                        this.cache.salesManagers.next(officers);
                      } else {
                        this.cache.salesReps.next(officers);
                      }
                      resolve(officers);
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
              if (role === 'manager') {
                this.cache.salesManagers.next([]);
              } else {
                this.cache.salesReps.next([]);
              }
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          if (role === 'manager') {
            this.cache.salesManagers.next([]);
          } else {
            this.cache.salesReps.next([]);
          }
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

      this.http.post(`${host}/sales_officer/remove`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(sales_officer: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', sales_officer._id);
      form.append('phone', sales_officer.phone);
      form.append('name', sales_officer.name);
      form.append('email', sales_officer.email);
      form.append('status', sales_officer.status);
      form.append('role', sales_officer.role);
      form.append('seller_id', sales_officer.seller_id);
      form.append('seller_area_id', sales_officer.seller_area_id);
      form.append('user_id', sales_officer.user_id);

      this.http.post(`${host}/sales_officer/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(sales_officer) {
    let status;
    if (sales_officer.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', sales_officer._id);
      form.append('status', status);
      this.http.post(`${host}/sales_officer/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Toggle failed!'});
        }
      }, error => {
        reject({message: 'Toggle failed!'});
      });
    });
  }

  fetchBySeller(seller_id: string, seller_area_id: string, role: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('seller_id', seller_id);
      form.append('role', role);
      this.http.post(`${host}/sales_officer/read_by_seller_role`, form, { headers: this.dataHandler.setHeader() })
        .subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let officers = data.data.filter(officer => officer.seller_area_id === seller_area_id);
          if (officers.length > 0) {
            // tslint:disable-next-line
            this.http.get(`${host}/seller_area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                const seller_areas = data.data;
                // tslint:disable-next-line
                this.http.get(`${host}/area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    const areas = data.data;
                    officers.map((officer) => {
                      const seller_area = seller_areas.find(SA => SA._id === officer.seller_area_id),
                        area = areas.find(_area => _area._id === seller_area.area_id);
                      officer.area = area.name;
                    });
                    officers = officers.sort(function(a, b) {
                      const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                      if (A < B) {
                        return -1;
                      }
                      if (A > B) {
                        return 1;
                      }
                      return 0;
                    });
                    if (role === 'manager') {
                      this.cache.salesManagers.next(officers);
                    } else {
                      this.cache.salesReps.next(officers);
                    }
                    resolve(officers);
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
            if (role === 'manager') {
              this.cache.salesManagers.next([]);
            } else {
              this.cache.salesReps.next([]);
            }
            resolve([]);
          }
        } else if (data.code === 200 && data.data.length === 0) {
          if (role === 'manager') {
            this.cache.salesManagers.next([]);
          } else {
            this.cache.salesReps.next([]);
          }
          resolve([]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByManager(manager_id: string, role: string) {
    let form = new FormData();
    return new Promise((resolve, reject) => {
      form.append('role', role);
      this.http.post(`${host}/sales_officer/read_by_role`, form, { headers: this.dataHandler.setHeader() })
        .subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const officers = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const sellers = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/seller_area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const seller_areas = data.data;
                  // tslint:disable-next-line
                  this.http.get(`${host}/area/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200) {
                      const areas = data.data;
                      form = new FormData();
                      form.append('manager_id', manager_id);
                      // tslint:disable-next-line
                      this.http.post(`${host}/seller_manager/read_by_manager`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                        if (data.code === 200 && data.data.length !== 0) {
                          const pairs = data.data;
                          let managerOfficers = [];
                          pairs.map((pair) => {
                            managerOfficers = managerOfficers.concat(officers.filter((officer) => officer.seller_id === pair.seller_id));
                          });
                          managerOfficers.map((officer) => {
                            officer.seller = sellers.find(seller => {
                              return seller._id === officer.seller_id;
                            }).name;
                            const seller_area = seller_areas.find(SA => SA._id === officer.seller_area_id),
                              area = areas.find(_area => _area._id === seller_area.area_id);
                            officer.area = area.name;
                          });
                          managerOfficers = managerOfficers.sort(function(a, b) {
                            const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                            if (A < B) {
                              return -1;
                            }
                            if (A > B) {
                              return 1;
                            }
                            return 0;
                          });
                          if (role === 'manager') {
                            this.cache.salesManagers.next(managerOfficers);
                          } else {
                            this.cache.salesReps.next(managerOfficers);
                          }
                          resolve(managerOfficers);
                        } else if (data.code === 200 && data.data.length === 0) {
                          if (role === 'manager') {
                            this.cache.salesManagers.next([]);
                          } else {
                            this.cache.salesReps.next([]);
                          }
                          resolve([]);
                        }
                      }, error => {
                        reject(error);
                      });
                    } else {
                      reject(data);
                    }
                  }, error => reject(error));
                } else {
                  reject(data);
                }
              }, error => reject(error));
            } else if (data.code === 200 && data.data.length !== 0) {
              if (role === 'manager') {
                this.cache.salesManagers.next([]);
              } else {
                this.cache.salesReps.next([]);
              }
              resolve([]);
            } else {
              reject(data);
            }
          }, error => reject(error));
        } else if (data.code === 200 && data.data.length === 0) {
          if (role === 'manager') {
            this.cache.salesManagers.next([]);
          } else {
            this.cache.salesReps.next([]);
          }
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }


  fetchSingleSalesRep(salesRepId: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', salesRepId);
      this.http.post(`${host}/sales_officer/read_details`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const salesOfficer = data.data;
          this.cache.saveSingleSalesOfficer(salesOfficer);
          resolve(salesOfficer);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }
}
