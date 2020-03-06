declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Status } from 'src/app/interfaces/status';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Instruction } from 'src/app/interfaces/instruction';
import { InstructionService, Execution } from 'src/app/services/instruction.service';
import { ActivatedRoute } from '@angular/router';
import { BuyerService } from 'src/app/services/buyer.service';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { SellerService } from 'src/app/services/seller.service';
import { Observable, of } from 'rxjs';

interface SandboxResult {
  logs: any[];
  minCheck: boolean;
  maxCheck: boolean;
  evenCheck: boolean;
  testAmount: number;
}

@Component({
  selector: 'app-billing-instructions',
  templateUrl: './billing-instructions.component.html',
  styleUrls: ['./billing-instructions.component.css']
})
export class BillingInstructionsComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  instructions: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  create: Instruction;
  edit: Instruction;
  execution: Execution;

  currentInstruction: any;
  p = 1;
  p1 = 1;

  createForm: FormGroup;
  editForm: FormGroup;
  executionForm: FormGroup;

  buyers: any[];
  manufacturers: any[];
  sellers: any[];
  executionOwners: any[];

  modeWatch: Observable<number>;

  billing_id: string;
  loading: boolean;
  billing: any;
  testMode: boolean;
  sandboxResult: SandboxResult = { logs: [], minCheck: null, maxCheck: null, evenCheck: null, testAmount: null };

  constructor(private _title: Title, cache: CacheService, private toastr: ToastrService, private instruction: InstructionService,
    formBuilder: FormBuilder, route: ActivatedRoute, private buyer: BuyerService, private manufacturer: ManufacturerService,
    private seller: SellerService) {
    this.billing_id = route.snapshot.paramMap.get('billing_id');

    cache.billings.subscribe((value) => {
      if (value) {
        this.billing = value.find((bill) => bill._id === this.billing_id);
        if (this.billing) {
          this.title = `${this.billing.title} Instructions`;
          _title.setTitle(`Suplias - ${this.billing.title} Instructions`);
        } else {
          this.title = 'Billing Instructions';
          _title.setTitle('Suplias - Billing Instructions');
        }
      } else {
        this.title = 'Billing Instructions';
        _title.setTitle('Suplias - Billing Instructions');
      }
    });

    this.modes = ['view', 'add', 'edit', 'execute'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];

    this.create = { amount: null, billing_id: null, code: null, description: null, from_head: null, from_subhead: null,
      index: null, is_percentage: null, status: null, to_head: null, to_subhead: null };
    this.edit = { amount: null, billing_id: null, code: null, description: null, from_head: null, from_subhead: null,
      index: null, is_percentage: null, status: null, to_head: null, to_subhead: null, _id: null };
    this.execution = { amount: null, billing_id: null, to_owner: null, reversal: null, reference: null, from_owner: null };

    this.createForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required])],
      code: ['', Validators.compose([Validators.required])],
      from_head: ['', Validators.compose([Validators.required])],
      from_subhead: ['', Validators.compose([Validators.required])],
      to_head: ['', Validators.compose([Validators.required])],
      to_subhead: ['', Validators.compose([Validators.required])],
      is_percentage: ['', Validators.compose([Validators.required])],
      amount: [null, Validators.compose([Validators.required])],
      index: [null, Validators.compose([Validators.required])],
      status: ['', Validators.compose([Validators.required])],
      billing_id: [this.billing_id, Validators.compose([Validators.required])]
    });

    this.editForm = formBuilder.group({
      _id: [''],
      description: ['', Validators.compose([Validators.required])],
      code: ['', Validators.compose([Validators.required])],
      from_head: ['', Validators.compose([Validators.required])],
      from_subhead: ['', Validators.compose([Validators.required])],
      to_head: ['', Validators.compose([Validators.required])],
      to_subhead: ['', Validators.compose([Validators.required])],
      is_percentage: ['', Validators.compose([Validators.required])],
      amount: [null, Validators.compose([Validators.required])],
      index: [null, Validators.compose([Validators.required])],
      status: ['', Validators.compose([Validators.required])],
      billing_id: ['', Validators.compose([Validators.required])]
    });

    this.executionForm = formBuilder.group({
      billing_id: [null, Validators.compose([Validators.required])],
      amount: [null, Validators.compose([Validators.required])],
      from_owner: ['', Validators.compose([Validators.required])],
      to_owner: ['', Validators.compose([Validators.required])],
      reference: ['', Validators.compose([Validators.required])],
      reversal: ['', Validators.compose([Validators.required])]
    });

    cache.buyers.subscribe((value: any[]) => {
      this.buyers = value;
    });

    cache.manufacturers.subscribe((value: any[]) => {
      this.manufacturers = value;
    });
  }

  ngOnInit() {
    this.fetchInstructions(this.billing_id);
    this.fetchExecuteData();
  }

  spawnExecution(index: number) {
    this.executionForm.controls.billing_id.setValue(this.billing_id);
    this.setMode(index);
  }

  spawnCreate(index: number) {
    this.instructions.length > 0 ? this.createForm.controls.index.setValue(this.instructions[this.instructions.length - 1].index + 1) :
      this.createForm.controls.index.setValue(1);
    this.createForm.controls.billing_id.setValue(this.billing_id);
    this.setMode(index);
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  resetForms(index: number) {
    this.createForm.reset();
    this.editForm.reset();
    this.executionForm.reset();
    this.execution = { amount: null, billing_id: null, to_owner: null, reversal: null, reference: null, from_owner: null };
    this.create = { amount: null, billing_id: null, code: null, description: null, from_head: null, from_subhead: null,
      index: null, is_percentage: null, status: null, to_head: null, to_subhead: null };
    this.edit = { amount: null, billing_id: null, code: null, description: null, from_head: null, from_subhead: null,
      index: null, is_percentage: null, status: null, to_head: null, to_subhead: null, _id: null };
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  spawnDelete(id: string) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.instruction.delete(id).then(() => {
          this.resetForms(0);
          this.fetchInstructions(this.billing_id);
          this.toastr.success('Billing instruction deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(instruction) {
    const { _id, description, code, from_head, from_subhead, to_head, to_subhead, is_percentage, amount, index, status, billing_id } =
      instruction, temp: Instruction = { _id, description, code, from_head, from_subhead, to_head, to_subhead, is_percentage, amount,
      index, status, billing_id };

    Object.keys(temp).map((key) => {
      this.editForm.controls[key].setValue(temp[key]);
    });
    this.currentInstruction = instruction;
    this.setMode(2);
  }

  closeForm(index: number) {
    this.resetForms(index);
  }

  createAction() {
    if (this.createForm.valid) {
      Object.keys(this.createForm.controls).map((key) => {
        this.create[key] = this.createForm.controls[key].value;
      });

      this.instruction.create(this.create).then(() => {
        this.fetchInstructions(this.billing_id);
        this.closeForm(0);
        this.toastr.success('Billing instruction created');
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  editAction() {
    if (this.editForm.valid) {
      Object.keys(this.editForm.controls).map((key) => {
        this.edit[key] = this.editForm.controls[key].value;
      });

      this.instruction.edit(this.edit).then(() => {
        this.fetchInstructions(this.billing_id);
        this.closeForm(0);
        this.toastr.success('Billing instruction edited');
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  executionAction() {
    if (this.executionForm.valid) {
      const [from_owner, to_owner] = [this.executionForm.controls.from_owner.value, this.executionForm.controls.to_owner.value];
      if (from_owner === to_owner && !(from_owner === '*' && to_owner === '*')) {
        this.toastr.error('The sender and receiver cannot be the same!');
      } else {
        Object.keys(this.executionForm.controls).map((key) => {
          this.execution[key] = this.executionForm.controls[key].value;
        });

        this.instruction.execute(this.execution).then(() => {
          this.closeForm(0);
          this.toastr.success('Execution successful. Check appropriate ledgers for logs.');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    }
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.instructions;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.instructions.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.index, B = b.index;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.instructions.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.index, B = b.index;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.instructions;
        break;
    }
  }

  fetchInstructions(billing_id: string) {
    this.loading = true;
    this.instruction.fetchByBilling(billing_id).then((body: any) => {
      this.billing = body.billing;
      this.instructions = body.instructions;
      this.sorted = body.instructions;
      if (this.billing) {
        this.title = `${this.billing.title} Instructions`;
        this._title.setTitle(`Suplias - ${this.billing.title} Instructions`);
      } else {
        this.title = 'Billing Instructions';
        this._title.setTitle('Suplias - Billing Instructions');
      }
      this.loading = false;
    }).catch((error) => {
      this.loading = false;
      this.toastr.error(error.message);
    });
  }

  fetchExecuteData() {
    if (!this.buyers || !this.manufacturers || !this.sellers) {
      Promise.all([this.buyer.fetchLite(), this.manufacturer.fetchLite(), this.seller.fetchLite()]).then((value: any[]) => {
        this.buyers = value[0];
        this.manufacturers = value[1];
        this.sellers = value[2];
        this.executionOwners = [...value[0], ...value[1], ...value[2]].sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
      }).catch((error) => this.toastr.error(error.message));
    }

    if (this.buyers && this.manufacturers && this.sellers) {
      this.executionOwners = [...this.buyers, ...this.manufacturers, ...this.sellers].sort(function(a, b) {
        const A = a.name.toLowerCase(), B = b.name.toLowerCase();
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
    }
  }

  executeTest() {
    swal({
      text: 'Enter test amount',
      content: 'input',
      button: {
        text: 'Run',
        closeModal: false
      }
    }).then(amount => {
      console.log(amount);
      if (!amount) {
        swal.stopLoading();
        swal.close();
        this.toastr.error('Enter a test amount!');
        return;
      }
      if (Number(amount) < this.billing.minimum) {
        swal.stopLoading();
        swal.close();
        this.toastr.error(`Test amount should not be less than the billing's minimum value`);
        return;
      }
      this.instruction.sandboxTest(this.billing._id, amount).then((logs: any[]) => {
        Number.isInteger((logs.length / 2)) ? this.sandboxResult.evenCheck = true : this.sandboxResult.evenCheck = false;
        (logs.filter((log) => log.value < 0).reduce((sum, elem) => sum + elem.value, 0) * -1) > this.billing.minimum ?
          this.sandboxResult.minCheck = true : this.sandboxResult.minCheck = false;
        logs.filter((log) => log.value >= 0).reduce((sum, elem) => sum + elem.value, 0) <= this.billing.maximum ?
          this.sandboxResult.maxCheck = true : this.sandboxResult.maxCheck = false;
        this.sandboxResult.logs = logs;
        this.sandboxResult.testAmount = amount;
        swal.stopLoading();
        swal.close();
        this.testMode = !this.testMode;
      }).catch((error) => {
        swal.stopLoading();
        swal.close();
        this.toastr.error(error.message);
      });
    });
  }

  closeTest() {
    this.testMode = !this.testMode;
  }
}
