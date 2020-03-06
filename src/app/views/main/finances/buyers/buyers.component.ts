import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BuyerService } from 'src/app/services/buyer.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { LedgerService } from 'src/app/services/ledger.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-buyers',
  templateUrl: './buyers.component.html',
  styleUrls: ['./buyers.component.css']
})
export class BuyersComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  buyers: any[];
  queryArray: any[];
  buyerLedgers: any[];
  ledgerLogs: any[];

  p = 1;
  p1 = 1;
  p2 = 1;
  p3 = 1;

  query = '';
  currentBuyer: any;
  currentLedger: any;

  loading = false;

  logPool = [];
  ledgerPool = [];

  modeWatch: Observable<number>;

  constructor(private _title: Title, private buyer: BuyerService, private cache: CacheService, private toastr: ToastrService,
    private ledger: LedgerService) {
    this.title = 'Finances (Buyers)';
    _title.setTitle('Suplias - Finances (Buyers)');

    this.modes = ['buyers_list', 'buyer_ledgers', 'ledger_logs'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
  }

  ngOnInit() {
    this.cache.buyer_lite.subscribe((value) => {
      if (value) {
        this.buyers = value;
      } else {
        this.fetchBuyers();
      }
    });
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  fetchBuyers() {
    this.buyer.fetchLite().then(() => { }).catch((error) => this.toastr.error(error.message));
  }

  search() {
    const searchPool = this.buyers;

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

  backToBuyerList() {
    this.buyerLedgers = null;
    this.currentBuyer = null;
    this.setMode(0);
    this.title = 'Finances (Buyers)';
    this._title.setTitle('Suplias - Finances (Buyers)');
  }

  backToLedgerList() {
    this.ledgerLogs = null;
    this.currentLedger = null;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
  }

  fetchLedgers(buyer: any) {
    this.currentBuyer = buyer;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
    this.title = `Finances (Buyers) - ${this.currentBuyer.name}`;
    this._title.setTitle(`Suplias - ${this.currentBuyer.name}`);

    const buyerLedgers = this.ledgerPool.filter((ledger) => ledger.owner === buyer._id);

    if (buyerLedgers.length === 0) {
      this.ledger.fetchLedgers(buyer._id).then((ledgers: any[]) => {
        this.buyerLedgers = ledgers;
        this.ledgerPool = [...this.ledgerPool, ...ledgers];
      }).catch((error) => this.toastr.error(error.message));
    } else {
      this.buyerLedgers = buyerLedgers;
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
    if (this.currentBuyer) {
      this.loading = true;
      this.ledger.fetchLedgers(this.currentBuyer._id).then((ledgers: any[]) => {
        this.buyerLedgers = ledgers;
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
