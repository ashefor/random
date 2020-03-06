import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { LedgerService } from 'src/app/services/ledger.service';

interface ThirdParty {
  name: string;
  head: string;
  total: number;
}

@Component({
  selector: 'app-third-party',
  templateUrl: './third-party.component.html',
  styleUrls: ['./third-party.component.css']
})
export class ThirdPartyComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  thirdParties: ThirdParty[];
  queryArray: any[];
  thirdPartyLedgers: any[];
  ledgerLogs: any[];

  p = 1;
  p1 = 1;
  p2 = 1;
  p3 = 1;

  query = '';
  currentThirdParty: ThirdParty;
  currentLedger: any;

  logPool = [];
  ledgerPool = [];

  modeWatch: Observable<number>;

  loading = false;

  constructor(private _title: Title, private cache: CacheService, private toastr: ToastrService, private ledger: LedgerService) {
    this.title = 'Finances (Third Parties)';
    _title.setTitle('Suplias - Finances (Third Parties)');

    this.modes = ['third_parties_list', 'third_parties_ledgers', 'ledger_logs'];
    this.setMode(0);
  }

  ngOnInit() {
    this.initialListLoad();
  }

  initialListLoad() {
    const heads = ['2000', '3000', '4000', '5000'];

    const ledgerPromises = heads.map(s => {
      return new Promise((resolve, reject) => {
        this.ledger.fetchLedgersByHead(s).then((res: any[]) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      });
    });

    Promise.all(ledgerPromises).then((res: any[]) => {
      res.forEach(r => this.ledgerPool = [...this.ledgerPool, ...r.list]);
      this.thirdParties = [
        { name: 'Tax', head: '2000', total: res[0].total},
        { name: 'Airtime Credit', head: '3000', total: res[1].total},
        { name: 'Bank Transfers', head: '4000', total: res[2].total},
        { name: 'SMS', head: '5000', total: res[3].total}
      ];
    }).catch((error) => this.toastr.error(error.message));
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  search() {
    const searchPool = this.thirdParties;

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

  backToThirdPartyList() {
    this.thirdPartyLedgers = null;
    this.currentThirdParty = null;
    this.setMode(0);
    this.title = 'Finances (Third Parties)';
    this._title.setTitle('Suplias - Finances (Third Parties)');
  }

  backToLedgerList() {
    this.ledgerLogs = null;
    this.currentLedger = null;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
  }

  fetchLedgers(thirdParty: ThirdParty) {
    this.currentThirdParty = thirdParty;
    this.mode = this.modes[1];
    this.modeWatch = of(0);
    this.title = `Finances (Sellers) - ${thirdParty.name}`;
    this._title.setTitle(`Suplias - ${thirdParty.name}`);

    const thirdPartyLedgers = this.ledgerPool.filter((ledger) => ledger.head === thirdParty.head);

    if (thirdPartyLedgers.length === 0) {
      this.ledger.fetchLedgersByHead(thirdParty.head).then((res: any) => {
        this.thirdPartyLedgers = res.list;
        this.ledgerPool = [...this.ledgerPool, ...res.list];
      }).catch((error) => this.toastr.error(error.message));
    } else {
      this.thirdPartyLedgers = thirdPartyLedgers;
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
    if (this.currentThirdParty) {
      this.loading = true;
      this.ledger.fetchLedgersByHead(this.currentThirdParty.head).then((res: any) => {
        this.thirdPartyLedgers = res.list;
        this.loading = false;
        res.list.forEach((ledger) => {
          const ledgerIndex = this.ledgerPool.findIndex((s) => s._id === ledger._id);
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
