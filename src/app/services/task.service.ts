import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';
import { Meta, EditMeta } from '../interfaces/task';
import { SecureRandString } from '../utils/rand';

const host = environment.host, fileHost = environment.fileHost, FCMHost = environment.FCM, FCMServerKey = environment.FCMServerKey;

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  fetchByManufacturer(id: string) {
    const form = new FormData();
    form.append('manufacturer_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/task/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let tasks = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const uploads = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/task_metadata/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const metaData: Array<any> = data.data;
                  tasks.map(async (task) => {
                    await this.fetchResponsesLite(task._id).then((responses: any) => {
                      task.responseCount = responses;
                    }).catch(() => {});
                    task.image = `${fileHost}${uploads.find((upload) => {
                      return upload._id === task.upload_id;
                    }).path}`;
                    const postImage = uploads.find((upload) => {
                      return upload._id === task.feed_upload_id;
                    });
                    if (postImage) {
                      task.postImage = `${fileHost}${postImage.path}`;
                    }
                    task.metaData = metaData.filter((meta) => meta.task_id === task._id);
                  });
                  tasks = tasks.sort(function(a, b) {
                    const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                    if (A < B) {
                      return -1;
                    }
                    if (A > B) {
                      return 1;
                    }
                    return 0;
                  });
                  console.log(tasks);
                  this.cache.setTasks(tasks);
                  resolve();
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else if (data.code === 200 && data.data.length === 0) {
              this.cache.setTasks([]);
              resolve();
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setTasks([]);
          resolve();
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByManufacturerLite(id: string) {
    const form = new FormData();
    form.append('manufacturer_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/task/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          resolve(data.data);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchSingleTask(id: string) {
    let form = new FormData();
    form.append('_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/task/read`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const tasks = data.data;
          form = new FormData();
          tasks.forEach((task, index) => {
            form.append('_id', task.upload_id);
            // tslint:disable-next-line
            this.http.post(`${host}/upload/read`, form, { headers: this.dataHandler.setHeader() }).subscribe(async (data: any) => {
              if (data.code === 200 && data.data.length !== 0) {
                task.image = `${fileHost}${data.data[0].path}`;
                form = new FormData();
                form.append('task_id', task._id);
                // tslint:disable-next-line
                this.http.post(`${host}/task_metadata/read_by_task`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    task.metaData = data.data;
                    if (index === tasks.length - 1) {
                      console.log(tasks);
                      resolve(tasks);
                    }
                  } else {
                    reject(data);
                  }
                }, error => {
                  reject(error);
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

  create(title: string, description: string, ttl: number, status: string, manufacturer_id: string, period: number,
    storeType: string, upload: any, cash: number, points: number, postUpload: any) {

    return new Promise((resolve, reject) => {
      if (postUpload) {
        let form = new FormData();
        form.append('file', postUpload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');
        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (data.code === 200) {
            const post_upload_id = data.data;

            form = new FormData();
            form.append('file', upload);
            form.append('tag', SecureRandString());
            form.append('title', SecureRandString());
            form.append('overwrite', 'true');
            // tslint:disable-next-line
            this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
              if (data.code === 200) {
                form = new FormData();
                form.append('title', title);
                form.append('description', description);
                form.append('ttl', `${ttl}`);
                form.append('status', status);
                form.append('manufacturer_id', manufacturer_id);
                form.append('period', `${period}`);
                form.append('store_type_id', storeType);
                form.append('upload_id', data.data);
                form.append('feed_upload_id', post_upload_id);
                form.append('reward_points', points.toString());
                form.append('reward_wallet', cash.toString());

                // tslint:disable-next-line
                this.http.post(`${host}/task/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    resolve(data.data);
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
        }, error => reject(error));
      } else {
        let form = new FormData();
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');
        // tslint:disable-next-line
        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (data.code === 200) {
            form = new FormData();
            form.append('title', title);
            form.append('description', description);
            form.append('ttl', `${ttl}`);
            form.append('status', status);
            form.append('manufacturer_id', manufacturer_id);
            form.append('period', `${period}`);
            form.append('store_type_id', storeType);
            form.append('upload_id', data.data);
            form.append('feed_upload_id', '-');
            form.append('reward_points', points.toString());
            form.append('reward_wallet', cash.toString());

            // tslint:disable-next-line
            this.http.post(`${host}/task/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                resolve(data.data);
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
      }
    });
  }

  edit(_task: any, image, postUpload: any) {
    return new Promise((resolve, reject) => {
      if (image) {
        if (postUpload) {
          let form = new FormData();
          form.append('file', postUpload);
          form.append('tag', SecureRandString());
          form.append('title', SecureRandString());
          form.append('overwrite', 'true');
          this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
            if (data.code === 200) {
              const post_upload_id = data.data;

              form = new FormData();
              form.append('file', image);
              form.append('tag', SecureRandString());
              form.append('title', SecureRandString());
              form.append('overwrite', 'true');
              // tslint:disable-next-line
              this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
                if (data.code === 200) {
                  form = new FormData();
                  form.append('_id', _task._id);
                  form.append('title', _task.title);
                  form.append('description', _task.description);
                  form.append('ttl', `${_task.ttl}`);
                  form.append('status', _task.status);
                  form.append('manufacturer_id', _task.manufacturer_id);
                  form.append('period', `${_task.period}`);
                  form.append('store_type_id', _task.store_type_id);
                  form.append('upload_id', data.data);
                  form.append('feed_upload_id', post_upload_id);
                  form.append('reward_points', _task.reward_points);
                  form.append('reward_wallet', _task.reward_wallet);

                  // tslint:disable-next-line
                  this.http.post(`${host}/task/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200) {
                      resolve(data.data);
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
          }, error => reject(error));
        } else {
          let form = new FormData();
          form.append('file', image);
          form.append('tag', SecureRandString());
          form.append('title', SecureRandString());
          form.append('overwrite', 'true');

          this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
            if (data.code === 200) {
              console.log(data.data);
              form = new FormData();
              form.append('_id', _task._id);
              form.append('title', _task.title);
              form.append('description', _task.description);
              form.append('ttl', `${_task.ttl}`);
              form.append('status', _task.status);
              form.append('manufacturer_id', _task.manufacturer_id);
              form.append('period', `${_task.period}`);
              form.append('store_type_id', _task.store_type_id);
              form.append('upload_id', data.data);
              form.append('feed_upload_id', _task.feed_upload_id);
              form.append('reward_points', _task.reward_points);
              form.append('reward_wallet', _task.reward_wallet);

            // tslint:disable-next-line
            this.http.post(`${host}/task/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              console.log(data);
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
      } else {
        if (postUpload) {
          let form = new FormData();
          form.append('file', postUpload);
          form.append('tag', SecureRandString());
          form.append('title', SecureRandString());
          form.append('overwrite', 'true');
          this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
            if (data.code === 200) {

              form = new FormData();
              form.append('_id', _task._id);
              form.append('title', _task.title);
              form.append('description', _task.description);
              form.append('ttl', `${_task.ttl}`);
              form.append('status', _task.status);
              form.append('manufacturer_id', _task.manufacturer_id);
              form.append('period', `${_task.period}`);
              form.append('store_type_id', _task.store_type_id);
              form.append('upload_id', _task.upload_id);
              form.append('feed_upload_id', data.data);
              form.append('reward_points', _task.reward_points);
              form.append('reward_wallet', _task.reward_wallet);

              // tslint:disable-next-line
              this.http.post(`${host}/task/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  resolve(data.data);
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else {
              reject(data);
            }
          }, error => reject(error));
        } else {
          const form = new FormData();
          form.append('_id', _task._id);
          form.append('title', _task.title);
          form.append('description', _task.description);
          form.append('ttl', `${_task.ttl}`);
          form.append('status', _task.status);
          form.append('manufacturer_id', _task.manufacturer_id);
          form.append('period', `${_task.period}`);
          form.append('store_type_id', _task.store_type_id);
          form.append('upload_id', _task.upload_id);
          form.append('feed_upload_id', _task.feed_upload_id);
          form.append('reward_points', _task.reward_points);
          form.append('reward_wallet', _task.reward_wallet);

        // tslint:disable-next-line
        this.http.post(`${host}/task/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          console.log(data);
          if (data.code === 200) {
            resolve();
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
        }
      }
    });
  }

  toggleStatus(task) {
    let status;
    if (task.status === 'active') {
      status = 'inactive';
    } else {
      status = 'active';
    }

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', task._id);
      form.append('status', status);
      this.http.post(`${host}/task/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

      this.http.post(`${host}/task/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchResponsesLite(task_id: string) {
    const form = new FormData();
    form.append('task_id', task_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/task_response/read_by_task`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchResponses(task_id: string, manufacturer_id: string) {
    const form = new FormData();
    form.append('task_id', task_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/task_response/read_by_task`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          let responses: any[] = data.data;
          if (responses.length > 0) {
            // tslint:disable-next-line
            this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200 && data.data.length !== 0) {
                const buyers = data.data;
                responses = responses.filter(response => buyers.find(buyer => buyer._id === response.buyer_id));
                if (responses.length > 0) {
                  // tslint:disable-next-line
                  this.http.get(`${host}/store_type/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200 && data.data.length !== 0) {
                      const stores = data.data;
                      // tslint:disable-next-line
                      this.http.get(`${host}/location/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                        if (data.code === 200 && data.data.length !== 0) {
                          const locations = data.data;
                          // tslint:disable-next-line
                          this.http.get(`${host}/task_response_metadata/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                            if (data.code === 200) {
                              const metaData = data.data;
                              // tslint:disable-next-line
                              this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                                console.log(data);
                                if (data.code === 200) {
                                  const uploads = data.data;
                                  responses.map((response) => {
                                    response.buyer = buyers.find((buyer) => {
                                      return buyer._id === response.buyer_id;
                                    });
                                    response.image = `${fileHost}${uploads.find((upload: any) => {
                                      return upload._id === response.upload_id;
                                    }).path}`;
                                    response.buyer.store = stores.find((store) => store._id === response.buyer.store_type_id).name;
                                    response.buyer.location =
                                      locations.find((location) => location._id === response.buyer.location_id).name;
                                    response.metaData = metaData.filter((meta) => meta.task_id === response.task_id &&
                                      meta.buyer_id === response.buyer_id && meta.task_response_id === response._id);
                                    // response.user_account_id = user_accounts.find((acc) => acc.user_id === response.buyer.user_id)._id;
                                    // response.points_id = points.find((point) => point.buyer_id === response.buyer._id &&
                                    //   point.manufacturer_id === manufacturer_id)._id;
                                  });
                                  resolve(responses);
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
                          resolve([]);
                        } else {
                          reject(data);
                        }
                      }, error => {
                        reject(error);
                      });
                    } else if (data.code === 200 && data.data.length === 0) {
                      resolve([]);
                    } else {
                      reject(data);
                    }
                  }, error => {
                    reject(error);
                  });
                } else {
                  resolve([]);
                }
              } else if (data.code === 200 && data.data.length === 0) {
                resolve([]);
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

  fetchImage(response_id: string) {
    const form = new FormData();
    form.append('_id', response_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/task_response/read`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          resolve(data.data[0].upload);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve(null);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  judgeResponses(response: any, verdict: string, buyer_id: string, task: any, billing: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', response._id);
      form.append('status', verdict);
      this.http.post(`${host}/task_response/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
          if (verdict === 'approved') {
            const [cash, points] = [task.reward_wallet, task.reward_points];
            if (cash !== 0 && points !== 0) {
              Promise.all([this.creditPoints(points, task, response.points_id), this.creditWallet(cash, task, buyer_id, billing)])
                .then(() => {
                  const notification = {
                    'title': `Task entry ${verdict}`,
                    // tslint:disable-next-line
                    'body': `Your entry for ${task.title} has been ${verdict}. You have been rewarded with ${this.transform(cash)} and ${points} points.`
                  };

                  // tslint:disable-next-line
                  const message = `Your entry for ${task.title} has been ${verdict}. You have been rewarded with ${this.transform(cash)} and ${points} points.`;
                  this.sendNotification(buyer_id, notification, message);
                  resolve();
              }).catch((error) => {
                reject(error);
              });
            }
            if (cash === 0 && points === 0) {
              const notification = {
                'title': `Task entry ${verdict}`,
                'body': `Your entry for ${task.title} has been ${verdict}.`
              };
              const message = `Your entry for ${task.title} has been ${verdict}.`;
              this.sendNotification(buyer_id, notification, message);
              resolve();
            }
            if (cash !== 0 && points === 0) {
              this.creditWallet(cash, task, buyer_id, billing).then(() => {
                const notification = {
                  'title': `Task entry ${verdict}`,
                  // tslint:disable-next-line
                  'body': `Your entry for ${task.title} has been ${verdict}. You have been rewarded with ${this.transform(cash)}.`
                };

                // tslint:disable-next-line
                const message = `Your entry for ${task.title} has been ${verdict}. You have been rewarded with ${this.transform(cash)}.`;
                this.sendNotification(buyer_id, notification, message);
                resolve();
              }).catch((error) => {
                reject(error);
              });
            }
            if (cash === 0 && points !== 0) {
              this.creditPoints(points, task, response.points_id).then(() => {
                const notification = {
                  'title': `Task entry ${verdict}`,
                  'body': `Your entry for ${task.title} has been ${verdict}. You have been rewarded with ${points} points.`
                };

                const message = `Your entry for ${task.title} has been ${verdict}. You have been rewarded with ${points} points.`;
                this.sendNotification(buyer_id, notification, message);
                resolve();
              }).catch((error) => {
                reject(error);
              });
            }
          } else {
            const notification = {
              'title': `Task entry ${verdict}`,
              'body': `Your entry for ${task.title} has been ${verdict}.`
            };
            const message = `Your entry for ${task.title} has been ${verdict}.`;
            this.sendNotification(buyer_id, notification, message);
            resolve();
          }
        } else {
          reject({message: 'Operation failed!'});
        }
      }, () => {
        reject({message: 'Operation failed!'});
      });
    });
  }

  sendNotification(buyer_id: string, notification: any, message: string) {
    return new Promise((resolve, reject) => {
      const body = {
        'notification': notification,
        'to': null,
        'priority': 'high',
        'data': {
          'message': message
        }
      };
      const form = new FormData();
      form.append('_id', buyer_id);

      this.http.post(`${host}/buyer/read`, form, { headers: this.dataHandler.setHeader() })
        .subscribe(async (data: any) => {
          if (data.code === 200 && data.data.length !== 0) {
            this.fetchBuyerTokens(data.data[0].user_id).then((tokens: Array<any>) => {
              console.log(tokens);
              tokens.map((token) => {
                body['to'] = token;
                this.http.post(FCMHost, body, { headers: this.setFCMHeader() }).subscribe(() => { }, error => {});
              });
              resolve();
            });
          } else if (data.code === 200 && data.data.length === 0) {
            resolve();
          } else {
            reject(data);
          }
        });
    });
  }

  creditWallet(amount: any, body: any, buyer_id: string, billing: any) {
    return new Promise((resolve, reject) => {
      if (!billing) {
        reject({ message: 'Unable to complete reward request. Contact support'});
      } else {
        const form = new FormData();
        form.append('billing_id', billing._id);
        form.append('amount', amount);
        form.append('to_owner', buyer_id);
        form.append('from_owner', body.manufacturer_id);
        form.append('reference', body._id);
        form.append('reversal', `false`);

        this.http.post(`${host}/instruction/execute`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          console.log(data);
          if (data.code === 200) {
            const logs = data.data;
            let [minCheck, maxCheck, evenCheck] = [null, null, null];
            console.log(['min', (logs.filter((log) => log.value < 0).reduce((sum, elem) => sum + elem.value, 0) * -1), billing.minimum]);
            console.log(['max', logs.filter((log) => log.value >= 0).reduce((sum, elem) => sum + elem.value, 0), billing.maximum]);
            Number.isInteger((logs.length / 2)) ? evenCheck = true : evenCheck = false;
            (logs.filter((log) => log.value < 0).reduce((sum, elem) => sum + elem.value, 0) * -1) > billing.minimum ?
              minCheck = true : minCheck = false;
            logs.filter((log) => log.value >= 0).reduce((sum, elem) => sum + elem.value, 0) <= billing.maximum ?
              maxCheck = true : maxCheck = false;

              console.table([minCheck, maxCheck, evenCheck]);

              if (minCheck && maxCheck && evenCheck) {
                // tslint:disable-next-line
                this.http.post(`${host}/instruction/execute_commit`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  console.log(data);
                  if (data.code === 200) {
                    if (data.message === true) {
                      resolve();
                    } else {
                      reject({ message: 'Unable to complete reward request. Contact support'});
                    }
                  } else {
                    reject(data);
                  }
                }, error => {
                  reject(error);
                });
              } else {
                reject({ message: 'Unable to complete reward request. Contact support'});
              }
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  creditPoints(amount: any, task: any, points_id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('points_id', points_id);
      form.append('value', amount);
      form.append('description', task.title);
      form.append('tag', task._id);

      this.http.post(`${host}/points_log/deposit`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchBuyerTokens(user_id: string) {
    return new Promise((resolve, reject) => {
      const tokens = [];
      const form = new FormData();
      form.append('user_id', user_id);
      this.http.post(`${host}/device_token/read_by_user`, form, { headers: this.dataHandler.setHeader() })
        // tslint:disable-next-line
        .subscribe((data: any) => {
          if (data.code === 200 && data.data.length !== 0) {
            data.data.map((item) => {
              tokens.push(item['token']);
            });
            resolve(tokens);
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

  setFCMHeader() {
    const header: any = {};
    header['Authorization'] = 'key=' + FCMServerKey;
    header['Content-Type'] = 'application/json';
    return header;
  }

  addMetaData(metaData: Array<Meta>, task_id: string) {
    return new Promise((resolve, reject) => {
      metaData.map((meta, index) => {
        const form = new FormData();
        form.append('tag', meta.tag);
        form.append('value', meta.value);
        form.append('status', 'active');
        form.append('task_id', task_id);

        this.http.post(`${host}/task_metadata/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (data.code === 200) {
            if (index === metaData.length - 1) {
              resolve();
            }
          } else {
            reject(data);
            return;
          }
        }, error => {
          reject(error);
          return;
        });
      });
    });
  }

  editMetaData(deleteMeta: Array<EditMeta>, otherMeta: Array<EditMeta>) {
    const editMeta = otherMeta.filter((meta) => meta._id !== '');
    const addMeta = otherMeta.filter((meta) => meta._id === '');

    const deletePromise = new Promise((resolve, reject) => {
      if (deleteMeta.length !== 0) {
        deleteMeta.map((meta, index) => {
          const form = new FormData();
          form.append('_id', meta._id);

          this.http.post(`${host}/task_metadata/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              if (index === deleteMeta.length - 1) {
                resolve();
              }
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        });
      } else {
        resolve();
      }
    });

    const editPromise = new Promise((resolve, reject) => {
      if (editMeta.length !== 0) {
        editMeta.map((meta, index) => {
          const form = new FormData();
          form.append('_id', meta._id);
          form.append('tag', meta.tag);
          form.append('value', meta.value);
          form.append('status', 'active');
          form.append('task_id', meta.task_id);

          this.http.post(`${host}/task_metadata/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              if (index === editMeta.length - 1) {
                resolve();
              }
            } else {
              reject(data);
              return;
            }
          }, error => {
            reject(error);
            return;
          });
        });
      } else {
        resolve();
      }
    });

    const addPromise = new Promise((resolve, reject) => {
      if (addMeta.length !== 0) {
        addMeta.map((meta, index) => {
          const form = new FormData();
          form.append('tag', meta.tag);
          form.append('value', meta.value);
          form.append('status', 'active');
          form.append('task_id', meta.task_id);

          this.http.post(`${host}/task_metadata/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              if (index === addMeta.length - 1) {
                resolve();
              }
            } else {
              reject(data);
              return;
            }
          }, error => {
            reject(error);
            return;
          });
        });
      } else {
        resolve();
      }
    });

    return new Promise((resolve, reject) => {
      Promise.all([deletePromise, editPromise, addPromise]).then(() => {
        resolve();
      }).catch((error) => { reject(error); });
    });
  }

  submitResponseMetaData(metaData: any[], buyer_id: string, task_id: string, response_id: string) {
    console.log(buyer_id);
    return new Promise((resolve, reject) => {
      if (metaData.length === 0) {
        resolve();
      } else {
        metaData.map((meta, index) => {
          const form = new FormData();
          form.append('tag', meta.value);
          form.append('value', meta.answer);
          form.append('task_metadata_id', meta._id);
          form.append('buyer_id', buyer_id);
          form.append('task_id', task_id);
          form.append('task_response_id', response_id);

          this.http.post(`${host}/task_response_metadata/create`, form, { headers: this.dataHandler.setHeader() })
            .subscribe((data: any) => {
            if (data.code === 200) {
              if (index === metaData.length - 1) {
                resolve();
              }
            } else {
              reject(data);
              return;
            }
          }, error => {
            reject(error);
            return;
          });
        });
      }
    });
  }

  transform(value: number, country: string = 'NG') {
    let symbol: string;
    switch (country) {
      case 'NG':
        // symbol = '&#8358;';
        symbol = '₦';
        break;

      default:
        symbol = '₦';
        break;
    }

    const amount = value.toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    return `${symbol}${amount}`;
  }

  fetchReceivedLogs(id: string, type: string = 'task') {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('type', type);
      form.append('id', id);
      this.http.post(`${host}/feed_log/read_by_type_id`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (data.code === 200) {
            resolve(data.data);
          } else {
            reject(data);
          }
      }, error => {
        reject(error);
      });
    });
  }
}
