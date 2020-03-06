import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ManufacturerService } from './manufacturer.service';
import { SellerService } from './seller.service';
import { DataHandlerService } from './data.service';

const host = environment.host;
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(public http: HttpClient, private manufacturer: ManufacturerService, private seller: SellerService,
    private dataHandler: DataHandlerService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  passcodeBody = (otp: string) => {
    return `Use this passcode to reset your password: ${otp}. This passcode expires in 15 minutes.`;
  }

  newPasswordBody = (password: string) => {
    return `Your password has been reset. This is your new password: ${password}. Ensure to change it as soon as possible.`;
  }

  login(phone: string, hash: string, remember: boolean) {
    console.log(phone, hash, remember);
    let form = new FormData();
    form.append('phone', phone);
    form.append('hash', hash);
    form.append('remember', String(remember));
    const response = { token: '', user: {}, code: 200, message: ''}, header: any = {};

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/administrator/login`, form).subscribe((data: any) => {
        console.log(data);
        if (this.validate(data) === true) {
          response.token = data['data']['token'];
          header['user_session_token'] = response.token;
          form = new FormData();
          form.append('phone', phone);
          // tslint:disable-next-line
          this.http.post(`${host}/administrator/read_by_phone`, form, { headers: header }).subscribe((data: any) => {
            if (this.validate(data) === true) {
              response['user'] = data.data[0];
              response['user']['group'] = 'admin';
              resolve(response);
            } else {
              response['code'] = 401;
              response['message'] = 'Login not allowed!';
              reject(response);
            }
          });
        } else {
          // tslint:disable-next-line
          this.http.post(`${host}/manager/login`, form).subscribe((data: any) => {
            console.log(data);
            if (this.validate(data) === true) {
              response.token = data['data']['token'];
              header['user_session_token'] = response.token;
              form = new FormData();
              form.append('phone', phone);

              // tslint:disable-next-line
              this.http.post(`${host}/manager/read_by_phone`, form, { headers: header }).subscribe((data: any) => {
                console.log(data);
                if (this.validate(data) === true) {
                  response['user'] = data.data[0];
                  response['user']['group'] = 'manager';
                  resolve(response);
                } else {
                  response['code'] = 401;
                  response['message'] = 'Login not allowed!';
                  reject(response);
                }
              });
            } else {
              // tslint:disable-next-line
              this.http.post(`${host}/sales_officer/login`, form).subscribe((data: any) => {
                console.log(data);
                if (this.validate(data) === true) {
                  response.token = data['data']['token'];
                  header['user_session_token'] = response.token;
                  form = new FormData();
                  form.append('phone', phone);

                  // tslint:disable-next-line
                  this.http.post(`${host}/sales_officer/read_by_phone`, form, { headers: header }).subscribe(async (data: any) => {
                    console.log(data);
                    if (this.validate(data) === true && data.data[0].role === 'manager') {
                      response['user'] = data.data[0];
                      response['user']['group'] = 'sales';
                      const seller = await this.seller.fetchOne(data.data[0].seller_id, header);
                      const manufacturer = await this.manufacturer.fetchOne(seller[0].manufacturer_id, header);
                      response['user']['manufacturer'] = JSON.stringify(manufacturer[0]);
                      response['user']['seller'] = JSON.stringify(seller[0]);
                      console.log(response);
                      resolve(response);
                    } else if (this.validate(data) === true && data.data[0].role !== 'manager') {
                      response['code'] = 401;
                      response['message'] = 'Login not allowed';
                      reject(response);
                    } else {
                      response['code'] = data.code;
                      response['message'] = data.message;
                      reject(response);
                    }
                  });
                } else {
                  // tslint:disable-next-line
                  this.http.post(`${host}/manufacturer_party/login`, form).subscribe((data: any) => {
                    console.log(data);
                    if (this.validate(data) === true) {
                      response.token = data['data']['token'];
                      header['user_session_token'] = response.token;
                      form = new FormData();
                      form.append('phone', phone);

                      // tslint:disable-next-line
                      this.http.post(`${host}/manufacturer_party/read_by_phone`, form, { headers: header }).subscribe(async (data: any) => {
                        console.log(data);
                        if (this.validate(data) === true) {
                          console.log(data.data[0]);
                          response['user'] = data.data[0];
                          response['user']['group'] = 'manufacturer_staff';
                          const manufacturer = await this.manufacturer.fetchOne(data.data[0].manufacturer_id, header);
                          response['user']['manufacturer'] = JSON.stringify(manufacturer[0]);
                          resolve(response);
                        } else {
                          response['code'] = 401;
                          response['message'] = 'Login not allowed!';
                          reject(response);
                        }
                      });
                    } else {
                      response['code'] = data.code;
                      response['message'] = 'Incorrect login credentials';
                      reject(response);
                    }
                  });
                }
              });
            }
          });
        }
      }, error => {
        response['code'] = error.code;
        response['message'] = error.message;
        reject(response);
      });
    });
  }

  generateRand(length: number) {
    let text = '';
    const possible = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text.toUpperCase();
  }

  sendReset(phone: string) {
    let form = new FormData();
    form.append('username', phone);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/user/read_by_username`, form).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200) {
          if (data.data.length !== 0) {
            const user = data.data[0];
            form = new FormData();
            form.append('key_type', 'short');
            form.append('ttl', '0');
            form.append('tag', user.username);
            form.append('user_id', user._id);

            // tslint:disable-next-line
            this.http.post(`${host}/auth/initiate_open`, form).subscribe((data: any) => {
              console.log(data);
              if (data.code === 200) {
                const key = data.data;
                form = new FormData();
                form.append('recipient', user.username);
                form.append('message', this.passcodeBody(key));
                console.log(this.passcodeBody(key));
                // tslint:disable-next-line
                this.http.post(`${host}/sms/send_via_at`, form).subscribe((data: any) => {
                  console.log(data);
                  if (data.code === 200) {
                    resolve(key);
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
            resolve();
          }
        } else {
          resolve();
        }
      }, error => {
        reject(error);
      });
    });
  }

  resetAuth(key: string, username: string) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      const header = {};
      form.append('key', key);
      form.append('status', 'true');
      // tslint:disable-next-line
      this.http.post(`${host}/auth/update_open`, form).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200) {
          form = new FormData();
          form.append('key', key);
          form.append('remember', 'false');
          // tslint:disable-next-line
          this.http.post(`${host}/auth/get_token`, form).subscribe((data: any) => {
            console.log(data);
            if (data.code === 200) {
              form = new FormData();
              form.append('_id', data.data);
              // tslint:disable-next-line
              this.http.post(`${host}/user_session/read`, form).subscribe((data: any) => {
                if (data.code === 200) {
                  if (data.data.length !== 0) {
                    header['user_session_token'] = data.data[0].token;
                    form = new FormData();
                    form.append('username', username);
                    console.log(username);
                    // tslint:disable-next-line
                    this.http.post(`${host}/user/reset_auth`, form, { headers: header }).subscribe((data: any) => {
                      console.log(data);
                      if (data.code === 200) {
                        form = new FormData();
                        form.append('recipient', username);
                        form.append('message', this.newPasswordBody(data.message));
                        console.log(this.newPasswordBody(data.message));
                        // tslint:disable-next-line
                        this.http.post(`${host}/sms/send_via_at`, form).subscribe((data: any) => {
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
                    }, error => {
                      reject(error);
                    });
                  } else {
                    reject({message: 'Failed to reset password'});
                  }
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
          reject({message: 'Invalid token'});
        }
      }, error => {
        reject(error);
      });
    });
  }

  interestFormAction(body: any) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('name', body.name);
      form.append('email', body.email);
      form.append('job_title', body.title);
      form.append('company', body.company);
      form.append('store_count', body.stores);
      form.append('sku_count', body.products);
      form.append('date_start', body.launchDate);
      form.append('status', 'active');
      // const header: any = {};
      // header['user_session_token'] = 'IToA959pcY7WkE';
      // this.http.post(`${host}/interest/create`, form, { headers: header }).subscribe((data: any) => {
        this.http.post(`${host}/interest/create`, form).subscribe((data: any) => {
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

  changePassword(username: string, old_hash: string, new_hash: string) {
    console.log(username);
    console.log(old_hash);
    console.log(new_hash);
    const form = new FormData();
    form.append('username', username);
    form.append('hash_old', old_hash);
    form.append('hash_new', new_hash);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/user/change_auth`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
  changeBuyerPassword(phone: string, hash: string, send_sms: boolean) {
    const form = new FormData();
    form.append('phone', phone);
    form.append('hash', hash);
    form.append('send_sms_also', String(send_sms));
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/buyer/reset_auth`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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
}
