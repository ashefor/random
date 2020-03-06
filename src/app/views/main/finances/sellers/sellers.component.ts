import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SellerService } from 'src/app/services/seller.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { LedgerService } from 'src/app/services/ledger.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.css']
})
export class SellersComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  sellers: any[];
  queryArray: any[];
  sellerLedgers: any[];
  ledgerLogs: any[];

  p = 1;
  p1 = 1;
  p2 = 1;
  p3 = 1;

  query = '';
  currentSeller: any;
  currentLedger: any;

  logPool = [];
  ledgerPool = [];

  modeWatch: Observable<number>;

  loading = false;

  constructor(private _title: Title, private seller: SellerService, private cache: CacheService, private toastr: ToastrService,
    private ledger: LedgerService) {
    this.title = 'Finances (Sellers)';
    _title.setTitle('Suplias - Finances (Sellers)');

    this.modes = ['sellers_list', 'seller_ledgers', 'ledger_logs'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
  }

  ngOnInit() {
    this.cache.seller_lite.subscribe((value) => {
      if (value) {
        this.sellers = value;
      } else {
        this.fetchSellers();
      }
    });
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  fetchSellers() {
    this.seller.fetchLite().then(() => { }).catch((error) => this.toastr.error(error.message));
  }

  search() {
    const searchPool = this.sellers;

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

  backToSellerList() {
    this.sellerLedgers = null;
    this.currentSeller = null;
    this.setMode(0);
    this.title = 'Finances (Sellers)';
    this._title.setTitle('Suplias - Finances (Sellers)');
  }

  backToLedgerList() {
    this.ledgerLogs = null;
    this.currentLedger = null;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
  }

  fetchLedgers(seller: any) {
    this.currentSeller = seller;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
    this.title = `Finances (Sellers) - ${this.currentSeller.name}`;
    this._title.setTitle(`Suplias - ${this.currentSeller.name}`);

    const sellerLedgers = this.ledgerPool.filter((ledger) => ledger.owner === seller._id);

    if (sellerLedgers.length === 0) {
      this.ledger.fetchLedgers(seller._id).then((ledgers: any[]) => {
        this.sellerLedgers = ledgers;
        this.ledgerPool = [...this.ledgerPool, ...ledgers];
      }).catch((error) => this.toastr.error(error.message));
    } else {
      this.sellerLedgers = sellerLedgers;
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
    if (this.currentSeller) {
      this.loading = true;
      this.ledger.fetchLedgers(this.currentSeller._id).then((ledgers: any[]) => {
        this.sellerLedgers = ledgers;
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
