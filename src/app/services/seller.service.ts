import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(name: string, address: string, status: string, manufacturer_id: string, manager_id: string) {
    let form = new FormData();
    form.append('name', name);
    form.append('address', address);
    form.append('status', status);
    form.append('manufacturer_id', manufacturer_id);
    form.append('user_id', this.getUserId());
    return new Promise((resolve, reject) => {

      // tslint:disable-next-line
      this.http.post(`${host}/seller/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (this.validate(data) === true) {
          form = new FormData();
          form.append('status', 'active');
          form.append('manager_id', manager_id);
          form.append('seller_id', data.data);
          // tslint:disable-next-line
          this.http.post(`${host}/seller_manager/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              resolve();
            }
          });
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  getUserId() {
    const userData = this.dataHandler.getUserData();
    return userData._id;
  }

  fetchLite() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          this.cache.seller_lite.next(data.data.sort(function(a, b) {
            const A = a.name.toLowerCase(), B = b.name.toLowerCase();
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          }));
          resolve(data.data);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetch() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          if (data.data.length > 0) {
            const manufacturers = data.data;
            // tslint:disable-next-line
            this.http.get(`${host}/manager/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                if (data.data.length > 0) {
                  const managers = data.data;
                  // tslint:disable-next-line
                  this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200) {
                      if (data.data.length > 0) {
                        let sellers = data.data;
                        // tslint:disable-next-line
                        this.http.get(`${host}/seller_manager/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                          if (data.code === 200) {
                            if (data.data.length > 0) {
                              const sellerManagers = data.data;
                              sellers.map((seller) => {
                                const sellerManager = sellerManagers.find(item => {
                                  return item.seller_id === seller._id;
                                });
                                seller.manager = sellerManager.manager_id;
                                seller.seller_manager = sellerManager._id;
                                seller.manufacturer = manufacturers.find(manufacturer => {
                                  return manufacturer._id === seller.manufacturer_id;
                                }).name;
                                seller.managerName = managers.find(manager => {
                                  return manager._id === seller.manager;
                                }).name;
                              });
                              sellers = sellers.sort(function(a, b) {
                                const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                                if (A < B) {
                                  return -1;
                                }
                                if (A > B) {
                                  return 1;
                                }
                                return 0;
                              });
                              this.cache.setDistributors(sellers);
                              resolve(sellers);
                            } else {
                              this.cache.setDistributors([]);
                              resolve([]);
                            }
                          } else {
                            reject(data);
                          }
                        });
                      } else {
                        this.cache.setDistributors([]);
                        resolve([]);
                      }
                    } else {
                      reject(data);
                    }
                  }, error => {
                    reject(error);
                  });
                } else {
                  this.cache.setDistributors([]);
                  resolve([]);
                }
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            this.cache.setDistributors([]);
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

  fetchByManufacturer(manufacturer_id: string) {
    const form = new FormData();
    form.append('manufacturer_id', manufacturer_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          if (data.data.length > 0) {
            let sellers = data.data;
            // tslint:disable-next-line
            this.http.get(`${host}/seller_manager/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                if (data.data.length > 0) {
                  const sellerManagers = data.data;
                  sellers.map((seller) => {
                    const sellerManager = sellerManagers.find(item => {
                      return item.seller_id === seller._id;
                    });
                    seller.manager = sellerManager.manager_id;
                    seller.seller_manager = sellerManager._id;
                  });
                  sellers = sellers.sort(function(a, b) {
                    const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setDistributors(sellers);
                  resolve(sellers);
                } else {
                  this.cache.setDistributors([]);
                  resolve([]);
                }
              } else {
                reject(data);
              }
            });
          } else {
            this.cache.setDistributors([]);
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

  fetchOne(id: string, header: any) {
    const form = new FormData();
    form.append('_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller/read`, form, { headers: header }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const sellers = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller_manager/read_all`, { headers: header }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const sellerManagers = data.data;
              sellers.map((seller) => {
                const sellerManager = sellerManagers.find(item => {
                  return item.seller_id === seller._id;
                });
                seller.manager = sellerManager.manager_id;
                seller.seller_manager = sellerManager._id;
              });
              resolve(sellers);
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

  delete(id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', id);

      this.http.post(`${host}/seller/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(seller: any) {
    console.log(seller);
    let form = new FormData();
    form.append('_id', seller._id);
    form.append('name', seller.name);
    form.append('address', seller.address);
    form.append('status', seller.status);
    form.append('user_id', this.getUserId());
    form.append('manufacturer_id', seller.manufacturer_id);

    return new Promise((resolve, reject) => {
      // tslint:disable-next-line
      this.http.post(`${host}/seller/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          form = new FormData();
          form.append('_id', seller.seller_manager);
          form.append('status', 'active');
          form.append('manager_id', seller.manager);
          form.append('seller_id', seller._id);
          // tslint:disable-next-line
          this.http.post(`${host}/seller_manager/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              resolve();
            } else {
              reject(data);
            }
          });
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  toggleStatus(seller) {
    let status;
    if (seller.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', seller._id);
      form.append('status', status);
      this.http.post(`${host}/seller/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchByManager(manager_id: string) {
    const form = new FormData();
    form.append('manager_id', manager_id);
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/manufacturer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const manufacturers = data.data;
          // tslint:disable-next-line
          this.http.post(`${host}/seller_manager/read_by_manager`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const pairs = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe(async (data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  const sellers = data.data;
                  let managerSellers = [];
                  pairs.map((pair) => {
                    managerSellers = managerSellers.concat(sellers.filter((seller) => seller._id === pair.seller_id));
                  });

                  managerSellers.map((seller) => {
                    seller.manager = manager_id;
                    seller.seller_manager = pairs.find((pair) => {
                      return pair.seller_id === seller._id;
                    })._id;
                    seller.manufacturer = manufacturers.find(manufacturer => {
                      return manufacturer._id === seller.manufacturer_id;
                    }).name;
                  });
                  managerSellers = managerSellers.sort(function(a, b) {
                    const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  this.cache.setDistributors(managerSellers);
                  resolve(managerSellers);
                } else if (data.code === 200 && data.data.length === 0) {
                  this.cache.setDistributors([]);
                  resolve([]);
                } else {
                  reject(data);
                }
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setDistributors([]);
              resolve([]);
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setDistributors([]);
          resolve([]);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByManagerLite(manager_id: string) {
    const form = new FormData();
    form.append('manager_id', manager_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_manager/read_by_manager`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const pairs = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/seller/read_all`, { headers: this.dataHandler.setHeader() }).subscribe(async (data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const sellers = data.data;
              let managerSellers = [];
              pairs.map((pair) => {
                managerSellers = managerSellers.concat(sellers.filter((seller) => seller._id === pair.seller_id));
              });
              resolve(managerSellers);
            } else if (data.code === 200 && data.data.length === 0) {
              resolve([]);
            } else {
              reject(data);
            }
          });
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


  fetchSingleSeller(sellerId: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', sellerId);
      this.http.post(`${host}/seller/read_details`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const seller = data.data;
          this.cache.saveSingleSeller(seller);
          resolve(seller);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }
}
