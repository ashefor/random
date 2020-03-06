import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  readAllOrders() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/order/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const orders = data.data;
          this.cache.setAllOrders(orders);
          resolve(orders);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }

  fetchSingleOrderItem(orderItemId) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('order_id', orderItemId);
      this.http.post(`${host}/order_item/read_by_order`, form, {headers: this.dataHandler.setHeader()})
      .subscribe((data: any) => {
        if (data.code === 200) {
          const order_items = data.data;
          this.cache.saveOrderItems(order_items);
          resolve(order_items);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }

  changeOrderTag(orderItemId, old_tag, new_tag, meta) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', orderItemId);
      form.append('old_tag', old_tag);
      form.append('new_tag', new_tag);
      form.append('meta', meta);
      this.http.post(`${host}/order_group/update_tag`, form, {headers: this.dataHandler.setHeader()})
      .subscribe((data: any) => {
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

  fetchAllOrders(seller_id: string, min: number, max: number) {
    const form = new FormData();
    let orders: Array<any> = [];
    console.log(seller_id, min, max);
    form.append('seller_id', seller_id);
    form.append('created_min', String(min));
    form.append('created_max', String(max));
    form.append('tag', 'completed');
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order/read_by_seller_tag_range`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200) {
            orders = orders.concat(data.data);
            form.append('tag', 'cancelled');
            this.http.post(`${host}/order/read_by_seller_tag_range`, form, { headers: this.dataHandler.setHeader() })
              // tslint:disable-next-line
              .subscribe(async (data: any) => {
                console.log(data);
                if (data.code === 200) {
                  orders = orders.concat(data.data);
                  form.append('tag', 'pending');
                  this.http.post(`${host}/order/read_by_seller_tag_range`, form, { headers: this.dataHandler.setHeader() })
                    // tslint:disable-next-line
                    .subscribe(async (data: any) => {
                      console.log(data);
                      if (data.code === 200) {
                        orders = orders.concat(data.data);
                        orders = orders.sort(function (a, b) {
                          const A = a.modified, B = b.modified;
                          if (A > B) {
                            return -1;
                          }
                          if (A < B) {
                            return 1;
                          }
                          return 0;
                        });
                        // tslint:disable-next-line
                        this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                          console.log(data);
                          if (data.code === 200 && data.data.length !== 0) {
                            const buyers = data.data;
                            // tslint:disable-next-line
                            this.http.get(`${host}/sales_officer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                              console.log(data);
                              if (data.code === 200 && data.data.length !== 0) {
                                const salesreps = data.data;
                                orders.map((order) => {
                                  const buyer_ = buyers.find((buyer) => buyer._id === order.buyer_id),
                                    handler = salesreps.find((rep) => rep._id === order.sales_officer_id);

                                  if (handler && buyer_) {
                                    order.buyer = buyer_.name;
                                    order.handler = handler.name || '-';
                                  } else {
                                    orders = orders.filter((s) => s._id !== order._id);
                                  }
                                });
                                resolve(orders);
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
                        });
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
            reject(data);
          }
        }, error => {
          reject(error);
        });
    });
  }

  fetchFulfilledStatistics(seller_id: string, min: number, max: number) {
    const form = new FormData();
    console.log(seller_id, min, max);
    form.append('seller_id', seller_id);
    form.append('created_min', String(min));
    form.append('created_max', String(max));
    form.append('tag', 'completed');
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order/read_by_seller_tag_range`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            const orders = data.data;
            const total = data.data.length;
            const cash = await orders.filter(item => {
              return item.payment.toUpperCase() === 'CASH';
            }).length;
            const loyalty = await orders.filter(item => {
              return item.payment.toUpperCase() !== 'CASH';
            }).length;
            resolve({ total, cash, loyalty });
          } else if (data.code === 200 && data.data.length === 0) {
            resolve({ total: 0, cash: 0, loyalty: 0 });
          }
        }, error => {
          reject(error);
        });
    });
  }

  fetchCancelledStatistics(seller_id: string, min: number, max: number) {
    const form = new FormData();
    form.append('seller_id', seller_id);
    form.append('created_min', String(min));
    form.append('created_max', String(max));
    form.append('tag', 'cancelled');
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order/read_by_seller_tag_range`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            const orders: Array<any> = data.data;
            const total = orders.length;
            const buyer = await orders.filter(item => {
              return item.meta.toUpperCase() === 'BUYER';
            }).length;
            const seller = await orders.filter(item => {
              return item.meta.toUpperCase() !== 'BUYER';
            }).length;
            resolve({ total, buyer, seller });
          } else if (data.code === 200 && data.data.length === 0) {
            resolve({ total: 0, buyer: 0, seller: 0 });
          }
        }, error => {
          reject(error);
        });
    });
  }

  fetchOrderStatistics(seller_id: string, min: number, max: number) {
    return new Promise((resolve, reject) => {
      this.fetchFulfilledStatistics(seller_id, min, max).then((report: any) => {
        const fulfilled = report;
        this.fetchCancelledStatistics(seller_id, min, max).then((result: any) => {
          console.log(result);
          const cancelled = result;
          const total = fulfilled.total + cancelled.total;
          resolve({ total, fulfilled, cancelled });
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    });
  }

  fetchSalesRepsStatistics(seller_id: string, min: number, max: number) {
    const form = new FormData();
    form.append('seller_id', seller_id);
    form.append('role', 'rep');

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/sales_officer/read_by_seller_role`, form, { headers: this.dataHandler.setHeader() })
        .subscribe((data: any) => {
          if (data.code === 200 && data.data.length !== 0) {
            const salesreps = data.data;
            salesreps.forEach(async (rep, index) => {
              await this.fetchSalesRepsCompleted(rep._id, min, max).then((result: any) => {
                rep.completed = result;
              });
              await this.fetchSalesRepsCancelled(rep._id, min, max).then((result: any) => {
                rep.cancelled = result;
              });
              await this.fetchSalesRepsRatings(rep._id).then((result: any) => {
                rep.rating = result;
                rep.ratingPretty = result.toFixed(1);
              });
              if (index === salesreps.length - 1) {
                resolve(salesreps);
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

  fetchSalesRepsCompleted(sales_officer_id: string, min: number, max: number) {
    console.log(sales_officer_id, min, max);
    const form = new FormData();
    form.append('sales_officer_id', sales_officer_id);
    form.append('created_min', String(min));
    form.append('created_max', String(max));
    form.append('tag', 'completed');
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order/read_by_sales_officer_tag_range`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            resolve(data.data.length);
          } else if (data.code === 200 && data.data.length === 0) {
            resolve(0);
          }
        }, error => {
          reject(error);
        });
    });
  }

  fetchSalesRepsCancelled(sales_officer_id: string, min: number, max: number) {
    const form = new FormData();
    form.append('sales_officer_id', sales_officer_id);
    form.append('created_min', String(min));
    form.append('created_max', String(max));
    form.append('tag', 'cancelled');
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order/read_by_sales_officer_tag_range`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            let cancelled: Array<any> = data.data;
            cancelled = cancelled.filter(item => {
              return item.meta.toUpperCase() === 'SELLER';
            });
            resolve(cancelled.length);
          } else if (data.code === 200 && data.data.length === 0) {
            resolve(0);
          }
        }, error => {
          reject(error);
        });
    });
  }

  fetchSalesRepsRatings(sales_officer_id: string) {
    const form = new FormData();
    form.append('tag', sales_officer_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order_rating/read_by_tag`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200) {
            const ratings = data.data;
            if (ratings.length !== 0) {
              const rating = ((ratings.reduce((sum, elem) => sum + elem.rating, 0)) / ratings.length);
              resolve(rating);
            } else {
              resolve(0);
            }
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
    });
  }

  fetchSellersStatistics(manager_id: string, min: number, max: number) {
    let form = new FormData();
    form.append('manager_id', manager_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/seller_manager/read_by_manager`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const pairs = data.data, sellers = [];
          console.log(pairs);
          console.log(pairs.length);
          pairs.forEach((pair, index) => {
            form = new FormData();
            form.append('_id', pair.seller_id);
            // tslint:disable-next-line
            this.http.post(`${host}/seller/read`, form, { headers: this.dataHandler.setHeader() }).subscribe(async (data: any) => {
              console.log(data);
              if (data.code === 200 && data.data.length !== 0) {
                const seller = { name: '', _id: '', stats: {} };
                seller.name = data.data[0].name;
                seller._id = data.data[0]._id;
                await this.fetchOrderStatistics(pair.seller_id, min, max).then(async (report: any) => {
                  seller.stats = report;
                  sellers.push(seller);
                  setTimeout(() => {
                    if (index === pairs.length - 1) {
                      console.log(sellers);
                      resolve(sellers);
                    }
                  }, 1000);
                });
              }
            });
          });
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchManufacturerStatistics(manufacturer_id: string, min: number, max: number) {
    const stats = { total: 0, stats: [] };
    let form = new FormData();
    console.log(manufacturer_id, min, max);
    form.append('manufacturer_id', manufacturer_id);
    form.append('created_min', String(min));
    form.append('created_max', String(max));
    form.append('tag', 'completed');
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/order/read_by_manufacturer_tag_range`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          console.log(data);
          if (data.code === 200 && data.data.length !== 0) {
            const orders = data.data;
            stats.total = orders.length;
            orders.forEach((order, index) => {
              form = new FormData();
              form.append('_id', order.buyer_id);
              // tslint:disable-next-line
              this.http.post(`${host}/buyer/read`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200 && data.data.length !== 0) {
                  order.store_type_id = data.data[0].store_type_id;
                  console.log(data.data[0].store_type_id);
                  console.log(orders);
                  if (index === orders.length - 1) {
                    // tslint:disable-next-line
                    this.http.get(`${host}/store_type/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                      if (data.code === 200 && data.data.length !== 0) {
                        console.log(orders);
                        const stores = data.data.filter(item => {
                          return item.status === 'active';
                        });
                        stores.forEach((_store, _index) => {
                          const count = ((orders.filter(items => {
                            return items.store_type_id === _store._id;
                          }).length) / stats.total) * 100;
                          const stat = { store: _store['name'], 'count': count };
                          stats.stats.push(stat);
                          if (_index === stores.length - 1) {
                            resolve(stats);
                          }
                        });
                      } else {
                        reject({ message: 'No store types found' });
                      }
                    }, error => {
                      reject(error);
                    });
                  }
                } else if (data.code === 200 && data.data.length === 0) {
                  reject({ message: 'No buyers found' });
                }
              }, error => {
                reject(error);
              });
            });
          } else if (data.code === 200 && data.data.length === 0) {
            resolve(stats);
          }
        }, error => {
          reject(error);
        });
    });
  }
}
