import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';
import { environment } from 'src/environments/environment';
import { Instruction } from '../interfaces/instruction';

const host = environment.host;

export interface Execution {
  billing_id: string;
  amount: number;
  from_owner: string;
  to_owner: string;
  reference: string;
  reversal: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  create(instruction: Instruction) {
    const form = new FormData();
    form.append('description', instruction.description);
    form.append('code', instruction.code);
    form.append('from_head', instruction.from_head);
    form.append('from_subhead', instruction.from_subhead);
    form.append('to_head', instruction.to_head);
    form.append('to_subhead', instruction.to_subhead);
    form.append('is_percentage', instruction.is_percentage);
    form.append('amount', `${instruction.amount}`);
    form.append('index', `${instruction.index}`);
    form.append('status', instruction.status);
    form.append('billing_id', instruction.billing_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/instruction/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  fetchAll() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/instruction/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          if (data.data.length !== 0) {
            const instructions = data.data;
            // tslint:disable-next-line
            this.http.get(`${host}/billing/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                instructions.map((instruction) => {
                  instruction.billing = data.data.find((billing) => instruction.billing_id === billing._id).title;
                });
                this.cache.instructions.next(instructions.sort((a, b) => {
                  const [A, B] = [a.created, b.created];
                  if (A > B) {
                    return 1;
                  }
                  if (A < B) {
                    return -1;
                  }
                  return 0;
                }));
                resolve(instructions);
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            this.cache.instructions.next([]);
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

  fetchAllLite() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/instruction/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          this.cache.instructions.next(data.data);
          resolve(data.data);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchByBilling(billing_id: string) {
    let form = new FormData();
    form.append('billing_id', billing_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/instruction/read_by_billing`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const instructions = data.data;
          form = new FormData();
          form.append('_id', billing_id);
          // tslint:disable-next-line
          this.http.post(`${host}/billing/read`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              resolve({ instructions, billing: data.data[0] });
            } else {
              reject(data);
            }
          }, error => {
            reject(data);
          });
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
      this.http.post(`${host}/instruction/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  edit(instruction: Instruction) {
    const form = new FormData();
    form.append('_id', instruction._id);
    form.append('description', instruction.description);
    form.append('code', instruction.code);
    form.append('from_head', instruction.from_head);
    form.append('from_subhead', instruction.from_subhead);
    form.append('to_head', instruction.to_head);
    form.append('to_subhead', instruction.to_subhead);
    form.append('is_percentage', instruction.is_percentage);
    form.append('amount', `${instruction.amount}`);
    form.append('index', `${instruction.index}`);
    form.append('status', instruction.status);
    form.append('billing_id', instruction.billing_id);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/instruction/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  toggleStatus(instruction: Instruction) {
    let status;
    instruction.status === 'active' ? status = 'inactive' : status = 'active';

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', instruction._id);
      form.append('status', status);
      this.http.post(`${host}/instruction/set_status`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  sandboxTest(billing_id: string, amount: number, reference = 'Sandbox test', reversal = false) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('billing_id', billing_id);
      form.append('amount', `${amount}`);
      form.append('from_owner', '*');
      form.append('to_owner', '*');
      form.append('reference', reference);
      form.append('reversal', `${reversal}`);
      this.http.post(`${host}/instruction/execute`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
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

  execute(execution: Execution) {
    const form = new FormData();
    form.append('billing_id', execution.billing_id);
    form.append('amount', `${execution.amount}`);
    form.append('from_owner', execution.from_owner);
    form.append('to_owner', execution.to_owner);
    form.append('reference', execution.reference);
    form.append('reversal', execution.reversal);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/instruction/execute`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200) {
          // tslint:disable-next-line
          this.http.post(`${host}/instruction/execute_commit`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              console.log(data);
              if (data.message === true) {
                resolve();
              } else {
                reject({ message: 'An error occurred. Check your inputs and try again' });
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
    });
  }
}
