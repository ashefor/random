import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { LedgerService } from 'src/app/services/ledger.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-manufacturers',
  templateUrl: './manufacturers.component.html',
  styleUrls: ['./manufacturers.component.css']
})
export class ManufacturersComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  manufacturers: any[];
  queryArray: any[];
  manufacturerLedgers: any[];
  ledgerLogs: any[];

  p = 1;
  p1 = 1;
  p2 = 1;
  p3 = 1;

  query = '';
  currentManufacturer: any;
  currentLedger: any;

  logPool = [];
  ledgerPool = [];

  modeWatch: Observable<number>;

  loading = false;

  constructor(private _title: Title, private manufacturer: ManufacturerService, private cache: CacheService, private toastr: ToastrService,
    private ledger: LedgerService) {
    this.title = 'Finances (Manufacturers)';
    _title.setTitle('Suplias - Finances (Manufacturers)');

    this.modes = ['manufacturers_list', 'manufacturer_ledgers', 'ledger_logs'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
  }

  ngOnInit() {
    this.cache.manufacturer_lite.subscribe((value) => {
      if (value) {
        this.manufacturers = value;
      } else {
        this.fetchManufacturers();
      }
    });
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  fetchManufacturers() {
    this.manufacturer.fetchLite().then(() => { }).catch((error) => this.toastr.error(error.message));
  }

  search() {
    const searchPool = this.manufacturers;

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.name && q) {
        if ( v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  backToManufacturerList() {
    this.manufacturerLedgers = null;
    this.currentManufacturer = null;
    this.setMode(0);
    this.title = 'Finances (Manufacturers)';
    this._title.setTitle('Suplias - Finances (Manufacturers)');
  }

  backToLedgerList() {
    this.ledgerLogs = null;
    this.currentLedger = null;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
  }

  fetchLedgers(manufacturer: any) {
    this.currentManufacturer = manufacturer;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
    this.title = `Finances (Manufacturers) - ${this.currentManufacturer.name}`;
    this._title.setTitle(`Suplias - ${this.currentManufacturer.name}`);

    const manufacturerLedgers = this.ledgerPool.filter((ledger) => ledger.owner === manufacturer._id);

    if (manufacturerLedgers.length === 0) {
      this.ledger.fetchLedgers(manufacturer._id).then((ledgers: any[]) => {
        this.manufacturerLedgers = ledgers;
        this.ledgerPool = [...this.ledgerPool, ...ledgers];
      }).catch((error) => this.toastr.error(error.message));
    } else {
      this.manufacturerLedgers = manufacturerLedgers;
    }
  }

  fetchLogs(ledger: any) {
    this.currentLedger = ledger;
    this.mode = this.modes[2];
    this.modeWatch = of(0);
    const ledgerLogs = this.logPool.filter((log) => log.ledger_id === ledger._id);
    if (ledgerLogs.length === 0) {
      this.ledger.fetchLogs(ledger._id).then((logs: any[]) => {
        this.ledgerLogs = logs;
        this.logPool = [...this.logPool, ...logs];
      }).catch(error => this.toastr.error(error.message));
    } else {
      this.ledgerLogs = ledgerLogs;
    }
  }

  refreshLedgers() {
    if (this.currentManufacturer) {
      this.loading = true;
      this.ledger.fetchLedgers(this.currentManufacturer._id).then((ledgers: any[]) => {
        this.manufacturerLedgers = ledgers;
        this.loading = false;
        ledgers.map((ledger) => {
          const ledgerIndex = this.ledgerPool.findIndex((s) => s._id === ledger._id);
          console.log(ledgerIndex);
          if (ledgerIndex > -1) {
            this.ledgerPool.splice(ledgerIndex, 1, ledger);
          } else {
            this.ledgerPool = [...this.ledgerPool, ledger];
          }
        });
      }).catch((error) => this.toastr.error(error.message));
    }
  }

  refreshLogs() {
    if (this.currentLedger) {
      this.loading = true;
      this.ledger.fetchLogs(this.currentLedger._id).then((logs: any[]) => {
        this.loading = false;
        this.ledgerLogs = logs;
        logs.map((log) => {
          const logIndex = this.logPool.findIndex((s) => s._id === log._id);
          if (logIndex > -1) {
            this.logPool.splice(logIndex, 1, log);
          } else {
            this.logPool = [...this.logPool, log];
          }
        });
      }).catch(error => this.toastr.error(error.message));
    }
  }
}
