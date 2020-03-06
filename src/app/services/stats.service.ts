import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService, LineChartData, AccountManagerLineChartData } from './cache.service';
import { SellerService } from './seller.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  visit = 0;
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService,
    private seller: SellerService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  setColor() {
    const bg = ['rgba(60, 83, 235, 0.2)', 'rgba(23, 23, 52, 0.2)', 'rgba(35, 203, 253, 0.2)'];
    const border = ['rgba(60, 83, 235, 1)', 'rgba(23, 23, 52, 1)', 'rgba(35, 203, 253, 1)'];
    return new Promise((resolve) => {
      if (this.visit >= bg.length) {
        this.visit = 0;
      }
      const color = [bg[this.visit], border[this.visit]];
      this.visit++;
      resolve(color);
    });
  }

  getInsightsAdmin(parent: string, level: string, parent_id: string) {
    return new Promise((resolve, reject) => {
      this.getInsightsDeltaAdmin(parent, level, parent_id).then(() => {}).catch((error) => {
        reject(error);
      });
      let form = new FormData();
      form.append('level', level);
      this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const insights = data.data.filter((insight) => insight.status !== 'deleted');
          if (insights.length !== 0) {
            let statistics: Array<LineChartData> = [];
            insights.forEach((insight, index) => {
              form = new FormData();
              form.append('insight_id', insight._id);
              form.append('parent', parent);
              form.append('parent_id', parent_id);

              this.http.post(`${host}/insight_instance/read_by_parent`, form, { headers: this.dataHandler.setHeader() })
                // tslint:disable-next-line
                .subscribe((data: any) => {
                  console.log(data);
                  if (data.code === 200) {
                    if (data.data.length !== 0) {
                      const instance = data.data[0];
                      form = new FormData();
                      form.append('code', instance._id);
                      // tslint:disable-next-line
                      this.http.post(`${host}/statistics/read_by_code`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                        console.log(data);
                        if (data.code === 200) {
                          if (data.data.length !== 0) {
                            const values = [], labels = [], bg = [], border = [], stats = data.data;
                            let previous, change;
                            const current = Number(stats[stats.length - 1].value);
                            if (stats.length > 1) {
                              previous = Number(stats[stats.length - 2].value);
                              if (Number(stats[stats.length - 2].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 2].value)) / Number(stats[stats.length - 2].value)) * 100);
                              }
                            } else {
                              previous = current;
                              if (Number(stats[stats.length - 1].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 1].value)) / Number(stats[stats.length - 1].value)) * 100);
                              }
                            }
                            stats.map((stat) => {
                              values.push(Number(stat.value));
                              labels.push(stat.label);
                              // this.setColor().then(color => {
                              //   bg.push(color[0]);
                              //   border.push(color[1]);
                              // });
                            });
                            // tslint:disable-next-line
                            statistics.push({insight, title: insight['title'], previous, change, current, deltaMode: false,
                            data: [{data: values, label: insight['title']}], labels, colors: [bg, border]});
                            if (index === insights.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                this.cache.stats.next(statistics);
                                localStorage.setItem('d3f4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          } else {
                            statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: false,
                            data: [{data: [], label: insight['title']}], labels: [], colors: []});
                            if (index === insights.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                this.cache.stats.next(statistics);
                                localStorage.setItem('d3f4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          }
                        } else {
                          reject(data);
                        }
                      }, error => {
                        reject(error);
                      });
                    } else {
                      statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: false,
                      data: [{data: [], label: insight['title']}], labels: [], colors: []});
                      if (index === insights.length - 1) {
                        setTimeout(() => {
                          statistics = statistics.sort(function(a, b) {
                            const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                            if (A < B) {
                              return -1;
                            }
                            if (A > B) {
                              return 1;
                            }
                            return 0;
                          });
                          this.cache.stats.next(statistics);
                          localStorage.setItem('d3f4', this.dataHandler.encryptAlt(statistics));
                          resolve();
                        }, 1000);
                      }
                    }
                  } else {
                    reject(data);
                  }
              }, error => {
                reject(error);
              });
            });
          } else {
            this.cache.stats.next([]);
          }
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  getInsightsDeltaAdmin(parent: string, level: string, parent_id: string) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      form.append('level', level);
      this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const insights = data.data.filter((insight) => insight.status !== 'deleted');
          if (insights.length !== 0) {
            let statistics: Array<LineChartData> = [];
            insights.forEach((insight, index) => {
              form = new FormData();
              form.append('insight_id', insight._id);
              form.append('parent', parent);
              form.append('parent_id', parent_id);

              this.http.post(`${host}/insight_instance/read_by_parent`, form, { headers: this.dataHandler.setHeader() })
                // tslint:disable-next-line
                .subscribe((data: any) => {
                  if (data.code === 200) {
                    if (data.data.length !== 0) {
                      const instance = data.data[0];
                      form = new FormData();
                      form.append('code', instance._id);
                      // tslint:disable-next-line
                      this.http.post(`${host}/statistics/read_by_code_delta`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                        if (data.code === 200) {
                          if (data.data.length !== 0) {
                            const values = [], labels = [], bg = [], border = [], stats = data.data;
                            let previous, change;
                            const current = Number(stats[stats.length - 1].value);
                            if (stats.length > 1) {
                              previous = Number(stats[stats.length - 2].value);
                              if (Number(stats[stats.length - 2].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 2].value)) / Number(stats[stats.length - 2].value)) * 100);
                              }
                            } else {
                              previous = current;
                              if (Number(stats[stats.length - 1].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 1].value)) / Number(stats[stats.length - 1].value)) * 100);
                              }
                            }
                            stats.map((stat) => {
                              values.push(Number(stat.value));
                              labels.push(stat.label);
                              // this.setColor().then(color => {
                              //   bg.push(color[0]);
                              //   border.push(color[1]);
                              // });
                            });
                            // tslint:disable-next-line
                            statistics.push({insight, title: insight['title'], previous, change, current, deltaMode: true,
                            data: [{data: values, label: insight['title']}], labels, colors: [bg, border]});
                            if (index === insights.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                localStorage.setItem('d3l4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          } else {
                            statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: true,
                            data: [{data: [], label: insight['title']}], labels: [], colors: []});
                            if (index === insights.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                localStorage.setItem('d3l4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          }
                        } else {
                          reject(data);
                        }
                      }, error => {
                        reject(error);
                      });
                    } else {
                      statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: true,
                      data: [{data: [], label: insight['title']}], labels: [], colors: []});
                      if (index === insights.length - 1) {
                        setTimeout(() => {
                          statistics = statistics.sort(function(a, b) {
                            const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                            if (A < B) {
                              return -1;
                            }
                            if (A > B) {
                              return 1;
                            }
                            return 0;
                          });
                          localStorage.setItem('d3l4', this.dataHandler.encryptAlt(statistics));
                          resolve();
                        }, 1000);
                      }
                    }
                  } else {
                    reject(data);
                  }
              }, error => {
                reject(error);
              });
            });
          } else {
            localStorage.setItem('d3l4', this.dataHandler.encryptAlt([]));
          }
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  getInsights(parent: string, level: string, parent_id: string) {
    console.log([parent, level, parent_id]);
    return new Promise((resolve, reject) => {
      this.getInsightsDelta(parent, level, parent_id);
      let form = new FormData();
      form.append('parent', parent);
      form.append('parent_id', parent_id);
      this.http.post(`${host}/insight_instance/read_by_parent_active`, form, { headers: this.dataHandler.setHeader() })
      // tslint:disable-next-line
      .subscribe((data: any) => {
        console.log(data);
        if (data.code === 200) {
          if (data.data.length !== 0) {
            const instances: any[] = data.data;
            form = new FormData();
            form.append('level', level);
            // tslint:disable-next-line
            this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              console.log(data);
              if (data.code === 200) {
                if (data.data.length !== 0) {
                  const insights = data.data.filter((insight) => insight.status !== 'deleted');
                  if (insights.length !== 0) {
                    let statistics: Array<LineChartData> = [];
                    instances.forEach((instance, index) => {
                      const insight = insights.find((s) => s._id === instance.insight_id);
                      form = new FormData();
                      form.append('code', instance._id);
                      // tslint:disable-next-line
                      this.http.post(`${host}/statistics/read_by_code`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                        console.log(data);
                        if (data.code === 200) {
                          if (data.data.length !== 0) {
                            const values = [], labels = [], bg = [], border = [], stats = data.data;
                            let previous, change;
                            const current = Number(stats[stats.length - 1].value);
                            if (stats.length > 1) {
                              previous = Number(stats[stats.length - 2].value);
                              if (Number(stats[stats.length - 2].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 2].value)) / Number(stats[stats.length - 2].value)) * 100);
                              }
                            } else {
                              previous = current;
                              if (Number(stats[stats.length - 1].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 1].value)) / Number(stats[stats.length - 1].value)) * 100);
                              }
                            }
                            stats.map((stat) => {
                              values.push(Number(stat.value));
                              labels.push(stat.label);
                              // this.setColor().then(color => {
                              //   bg.push(color[0]);
                              //   border.push(color[1]);
                              // });
                            });
                            // tslint:disable-next-line
                            statistics.push({insight, title: insight['title'], previous, change, current, deltaMode: false,
                            data: [{data: values, label: insight['title']}], labels, colors: [bg, border]});
                            if (index === instances.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                this.cache.stats.next(statistics);
                                localStorage.setItem('d3f4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          } else {
                            statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: false,
                            data: [{data: [], label: insight['title']}], labels: [], colors: []});
                            if (index === instances.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                this.cache.stats.next(statistics);
                                localStorage.setItem('d3f4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          }
                        } else {
                          reject(data);
                        }
                      }, error => {
                        reject(error);
                      });
                    });
                  } else {
                    this.cache.stats.next([]);
                  }
                } else {
                  this.cache.stats.next([]);
                }
              } else {
                reject(data);
              }
            }, error => reject(error));
          } else {
            this.cache.stats.next([]);
          }
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  getInsightsDelta(parent: string, level: string, parent_id: string) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      form.append('parent', parent);
      form.append('parent_id', parent_id);
      this.http.post(`${host}/insight_instance/read_by_parent_active`, form, { headers: this.dataHandler.setHeader() })
      // tslint:disable-next-line
      .subscribe((data: any) => {
        if (data.code === 200) {
          if (data.data.length !== 0) {
            const instances: any[] = data.data;
            form = new FormData();
            form.append('level', level);
            // tslint:disable-next-line
            this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                if (data.data.length !== 0) {
                  const insights = data.data.filter((insight) => insight.status !== 'deleted');
                  if (insights.length !== 0) {
                    let statistics: Array<LineChartData> = [];
                    instances.forEach((instance, index) => {
                      const insight = insights.find((s) => s._id === instance.insight_id);
                      form = new FormData();
                      form.append('code', instance._id);
                      // tslint:disable-next-line
                      this.http.post(`${host}/statistics/read_by_code`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                        console.log(data);
                        if (data.code === 200) {
                          if (data.data.length !== 0) {
                            const values = [], labels = [], bg = [], border = [], stats = data.data;
                            let previous, change;
                            const current = Number(stats[stats.length - 1].value);
                            if (stats.length > 1) {
                              previous = Number(stats[stats.length - 2].value);
                              if (Number(stats[stats.length - 2].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 2].value)) / Number(stats[stats.length - 2].value)) * 100);
                              }
                            } else {
                              previous = current;
                              if (Number(stats[stats.length - 1].value) === 0) {
                                change = NaN;
                              } else {
                                // tslint:disable-next-line
                                change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 1].value)) / Number(stats[stats.length - 1].value)) * 100);
                              }
                            }
                            stats.map((stat) => {
                              values.push(Number(stat.value));
                              labels.push(stat.label);
                              // this.setColor().then(color => {
                              //   bg.push(color[0]);
                              //   border.push(color[1]);
                              // });
                            });
                            // tslint:disable-next-line
                            statistics.push({insight, title: insight['title'], previous, change, current, deltaMode: true,
                            data: [{data: values, label: insight['title']}], labels, colors: [bg, border]});
                            if (index === instances.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                localStorage.setItem('d3l4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          } else {
                            statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: true,
                            data: [{data: [], label: insight['title']}], labels: [], colors: []});
                            if (index === instances.length - 1) {
                              setTimeout(() => {
                                statistics = statistics.sort(function(a, b) {
                                  const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                  if (A < B) {
                                    return -1;
                                  }
                                  if (A > B) {
                                    return 1;
                                  }
                                  return 0;
                                });
                                localStorage.setItem('d3l4', this.dataHandler.encryptAlt(statistics));
                                resolve();
                              }, 1000);
                            }
                          }
                        } else {
                          reject(data);
                        }
                      }, error => {
                        reject(error);
                      });
                    });
                  } else {
                    localStorage.setItem('d3l4', this.dataHandler.encryptAlt([]));
                  }
                } else {
                  localStorage.setItem('d3l4', this.dataHandler.encryptAlt([]));
                }
              } else {
                reject(data);
              }
            }, error => reject(error));
          } else {
            localStorage.setItem('d3l4', this.dataHandler.encryptAlt([]));
          }
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  getInsightsAccountManager(parent: string, level: string, manager_id: string) {
    console.log([parent, level, manager_id]);
    return new Promise((resolve, reject) => {
      this.seller.fetchByManagerLite(manager_id).then((data: any[]) => {
        if (data.length > 0) {
          this.getInsightsDeltaAccountManager(parent, level, data);
          data.map((seller) => {
            let form = new FormData();
            form.append('parent', parent);
            form.append('parent_id', seller._id);
            this.http.post(`${host}/insight_instance/read_by_parent_active`, form, { headers: this.dataHandler.setHeader() })
            // tslint:disable-next-line
            .subscribe((data: any) => {
              console.log(data);
              if (data.code === 200) {
                if (data.data.length !== 0) {
                  const instances: any[] = data.data;
                  form = new FormData();
                  form.append('level', level);
                  // tslint:disable-next-line
                  this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    console.log(data);
                    if (data.code === 200) {
                      if (data.data.length !== 0) {
                        const insights = data.data.filter((insight) => insight.status !== 'deleted');
                        if (insights.length !== 0) {
                          let statistics: Array<LineChartData> = [];
                          instances.forEach((instance, index) => {
                            const insight = insights.find((s) => s._id === instance.insight_id);
                            form = new FormData();
                            form.append('code', instance._id);
                            // tslint:disable-next-line
                            this.http.post(`${host}/statistics/read_by_code`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                              console.log(data);
                              if (data.code === 200) {
                                if (data.data.length !== 0) {
                                  const values = [], labels = [], bg = [], border = [], stats = data.data;
                                  let previous, change;
                                  const current = Number(stats[stats.length - 1].value);
                                  if (stats.length > 1) {
                                    previous = Number(stats[stats.length - 2].value);
                                    if (Number(stats[stats.length - 2].value) === 0) {
                                      change = NaN;
                                    } else {
                                      // tslint:disable-next-line
                                      change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 2].value)) / Number(stats[stats.length - 2].value)) * 100);
                                    }
                                  } else {
                                    previous = current;
                                    if (Number(stats[stats.length - 1].value) === 0) {
                                      change = NaN;
                                    } else {
                                      // tslint:disable-next-line
                                      change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 1].value)) / Number(stats[stats.length - 1].value)) * 100);
                                    }
                                  }
                                  stats.map((stat) => {
                                    values.push(Number(stat.value));
                                    labels.push(stat.label);
                                    // this.setColor().then(color => {
                                    //   bg.push(color[0]);
                                    //   border.push(color[1]);
                                    // });
                                  });
                                  // tslint:disable-next-line
                                  statistics.push({insight, title: insight['title'], previous, change, current, deltaMode: false,
                                  data: [{data: values, label: insight['title']}], labels, colors: [bg, border]});
                                  if (index === instances.length - 1) {
                                    setTimeout(() => {
                                      statistics = statistics.sort(function(a, b) {
                                        const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                        if (A < B) {
                                          return -1;
                                        }
                                        if (A > B) {
                                          return 1;
                                        }
                                        return 0;
                                      });
                                      const currentValue = this.cache.accountManagerStats.value || [],
                                        newStat = [...currentValue, { seller, lineChartData: statistics }]
                                        .sort(function(a, b) {
                                          const A = a.seller.name.toLowerCase(), B = b.seller.name.toLowerCase();
                                          if (A < B) {
                                            return -1;
                                          }
                                          if (A > B) {
                                            return 1;
                                          }
                                          return 0;
                                        });
                                      this.cache.accountManagerStats.next(newStat);
                                      localStorage.setItem('d3f4', this.dataHandler.encryptAlt(newStat));
                                      resolve();
                                    }, 1000);
                                  }
                                } else {
                                  statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0,
                                  deltaMode: false, data: [{data: [], label: insight['title']}], labels: [], colors: []});
                                  if (index === instances.length - 1) {
                                    setTimeout(() => {
                                      statistics = statistics.sort(function(a, b) {
                                        const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                        if (A < B) {
                                          return -1;
                                        }
                                        if (A > B) {
                                          return 1;
                                        }
                                        return 0;
                                      });
                                      const currentValue = this.cache.accountManagerStats.value || [],
                                        newStat = [...currentValue, { seller, lineChartData: statistics }]
                                        .sort(function(a, b) {
                                          const A = a.seller.name.toLowerCase(), B = b.seller.name.toLowerCase();
                                          if (A < B) {
                                            return -1;
                                          }
                                          if (A > B) {
                                            return 1;
                                          }
                                          return 0;
                                        });
                                      this.cache.accountManagerStats.next(newStat);
                                      localStorage.setItem('d3f4', this.dataHandler.encryptAlt(newStat));
                                      resolve();
                                    }, 1000);
                                  }
                                }
                              } else {
                                reject(data);
                              }
                            }, error => {
                              reject(error);
                            });
                          });
                        } else {
                          this.cache.accountManagerStats.next(this.cache.accountManagerStats.value);
                        }
                      } else {
                        this.cache.accountManagerStats.next(this.cache.accountManagerStats.value);
                      }
                    } else {
                      reject(data);
                    }
                  }, error => reject(error));
                } else {
                  this.cache.accountManagerStats.next(this.cache.accountManagerStats.value);
                }
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          });
        } else {
          this.cache.accountManagerStats.next([]);
        }
      }).catch((err) => reject(err));
    });
  }

  getInsightsDeltaAccountManager(parent: string, level: string, sellers: any[]) {
    return new Promise((resolve, reject) => {
      sellers.map((seller) => {
        let form = new FormData();
        form.append('parent', parent);
        form.append('parent_id', seller._id);
        this.http.post(`${host}/insight_instance/read_by_parent_active`, form, { headers: this.dataHandler.setHeader() })
        // tslint:disable-next-line
        .subscribe((data: any) => {
          if (data.code === 200) {
            if (data.data.length !== 0) {
              const instances: any[] = data.data;
              form = new FormData();
              form.append('level', level);
              // tslint:disable-next-line
              this.http.post(`${host}/insight/read_by_level`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  if (data.data.length !== 0) {
                    const insights = data.data.filter((insight) => insight.status !== 'deleted');
                    if (insights.length !== 0) {
                      let statistics: Array<LineChartData> = [];
                      instances.forEach((instance, index) => {
                        const insight = insights.find((s) => s._id === instance.insight_id);
                        form = new FormData();
                        form.append('code', instance._id);
                        // tslint:disable-next-line
                        this.http.post(`${host}/statistics/read_by_code`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                          console.log(data);
                          if (data.code === 200) {
                            if (data.data.length !== 0) {
                              const values = [], labels = [], bg = [], border = [], stats = data.data;
                              let previous, change;
                              const current = Number(stats[stats.length - 1].value);
                              if (stats.length > 1) {
                                previous = Number(stats[stats.length - 2].value);
                                if (Number(stats[stats.length - 2].value) === 0) {
                                  change = NaN;
                                } else {
                                  // tslint:disable-next-line
                                  change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 2].value)) / Number(stats[stats.length - 2].value)) * 100);
                                }
                              } else {
                                previous = current;
                                if (Number(stats[stats.length - 1].value) === 0) {
                                  change = NaN;
                                } else {
                                  // tslint:disable-next-line
                                  change = (((Number(stats[stats.length - 1].value) - Number(stats[stats.length - 1].value)) / Number(stats[stats.length - 1].value)) * 100);
                                }
                              }
                              stats.map((stat) => {
                                values.push(Number(stat.value));
                                labels.push(stat.label);
                                // this.setColor().then(color => {
                                //   bg.push(color[0]);
                                //   border.push(color[1]);
                                // });
                              });
                              // tslint:disable-next-line
                              statistics.push({insight, title: insight['title'], previous, change, current, deltaMode: true,
                              data: [{data: values, label: insight['title']}], labels, colors: [bg, border]});
                              if (index === instances.length - 1) {
                                setTimeout(() => {
                                  statistics = statistics.sort(function(a, b) {
                                    const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                    if (A < B) {
                                      return -1;
                                    }
                                    if (A > B) {
                                      return 1;
                                    }
                                    return 0;
                                  });
                                  // tslint:disable-next-line
                                  const currentValue = (localStorage.getItem('d3l4') && localStorage.getItem('d3l4') !== '') ? this.dataHandler.decryptAlt(localStorage.getItem('d3l4')) : [],
                                    newStat = [...currentValue, { seller, lineChartData: statistics }].sort(function(a, b) {
                                      const A = a.seller.name.toLowerCase(), B = b.seller.name.toLowerCase();
                                      if (A < B) {
                                        return -1;
                                      }
                                      if (A > B) {
                                        return 1;
                                      }
                                      return 0;
                                    });
                                  localStorage.setItem('d3l4', this.dataHandler.encryptAlt(newStat));
                                  resolve();
                                }, 1000);
                              }
                            } else {
                              statistics.push({insight, title: insight['title'], previous: 0, change: 0, current: 0, deltaMode: true,
                              data: [{data: [], label: insight['title']}], labels: [], colors: []});
                              if (index === instances.length - 1) {
                                setTimeout(() => {
                                  statistics = statistics.sort(function(a, b) {
                                    const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                                    if (A < B) {
                                      return -1;
                                    }
                                    if (A > B) {
                                      return 1;
                                    }
                                    return 0;
                                  });
                                  // tslint:disable-next-line
                                  const currentValue = (localStorage.getItem('d3l4') && localStorage.getItem('d3l4') !== '') ? this.dataHandler.decryptAlt(localStorage.getItem('d3l4')) : [],
                                    newStat = [...currentValue, { seller, lineChartData: statistics }].sort(function(a, b) {
                                      const A = a.seller.name.toLowerCase(), B = b.seller.name.toLowerCase();
                                      if (A < B) {
                                        return -1;
                                      }
                                      if (A > B) {
                                        return 1;
                                      }
                                      return 0;
                                    });
                                  localStorage.setItem('d3l4', this.dataHandler.encryptAlt(newStat));
                                  resolve();
                                }, 1000);
                              }
                            }
                          } else {
                            reject(data);
                          }
                        }, error => {
                          reject(error);
                        });
                      });
                    } else {
                      if (localStorage.getItem('d3l4') && localStorage.getItem('d3l4') !== '') {
                        localStorage.setItem('d3l4', this.dataHandler.encryptAlt(
                          this.dataHandler.decryptAlt(localStorage.getItem('d3l4'))));
                      }
                    }
                  } else {
                    if (localStorage.getItem('d3l4') && localStorage.getItem('d3l4') !== '') {
                      localStorage.setItem('d3l4', this.dataHandler.encryptAlt(this.dataHandler.decryptAlt(localStorage.getItem('d3l4'))));
                    }
                  }
                } else {
                  reject(data);
                }
              }, error => reject(error));
            } else {
              if (localStorage.getItem('d3l4') && localStorage.getItem('d3l4') !== '') {
                localStorage.setItem('d3l4', this.dataHandler.encryptAlt(this.dataHandler.decryptAlt(localStorage.getItem('d3l4'))));
                this.dataHandler.decryptAlt(localStorage.getItem('d3l4'));
              }
            }
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      });
    });
  }

  switchDelta(_id: string, delta: string, _current: Array<LineChartData>, _default: Array<LineChartData>, _delta: Array<LineChartData>) {
    if (delta === 'false') {
      const deltaStat = _delta.find((stat) => {
        return stat.insight['_id'] === _id;
      });
      const statIndex = _current.findIndex((stat) => {
        return stat.insight['_id'] === _id;
      });
      _current.splice(statIndex, 1, deltaStat);
      this.cache.stats.next(_current);
    } else if (delta === 'true') {
      const defaultStat = _default.find((stat) => {
        return stat.insight['_id'] === _id;
      });
      const statIndex = _current.findIndex((stat) => {
        return stat.insight['_id'] === _id;
      });
      _current.splice(statIndex, 1, defaultStat);
      this.cache.stats.next(_current);
    }
  }

  switchDeltaAccountManager(_id: string, delta: string, _current: Array<AccountManagerLineChartData>,
    _default: Array<AccountManagerLineChartData>, _delta: Array<AccountManagerLineChartData>) {
    if (delta === 'false') {
      let deltaStat, statIndex;

      _delta.map((d) => {
        d.lineChartData.map((l) => {
          if (l.insight._id === _id) {
            deltaStat = d;
          }
        });
      });

      _current.map((c, index) => {
        c.lineChartData.map((l) => {
          if (l.insight._id === _id) {
            statIndex = index;
          }
        });
      });

      _current.splice(statIndex, 1, deltaStat);
      this.cache.accountManagerStats.next(_current);
    } else if (delta === 'true') {
      let defaultStat, statIndex;

      _default.map((d) => {
        d.lineChartData.map((l) => {
          if (l.insight._id === _id) {
            defaultStat = d;
          }
        });
      });

      _current.map((c, index) => {
        c.lineChartData.map((l) => {
          if (l.insight._id === _id) {
            statIndex = index;
          }
        });
      });
      _current.splice(statIndex, 1, defaultStat);
      this.cache.accountManagerStats.next(_current);
    }
  }
}
