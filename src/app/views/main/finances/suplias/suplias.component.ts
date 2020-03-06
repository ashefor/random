import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { LedgerService } from 'src/app/services/ledger.service';
import { ToastrService } from 'ngx-toastr';

const HEAD = '1000';

@Component({
  selector: 'app-suplias',
  templateUrl: './suplias.component.html',
  styleUrls: ['./suplias.component.css']
})
export class SupliasComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  supliasLedgers: any[];
  ledgerLogs: any[];

  p = 1;
  p1 = 1;
  p2 = 1;
  p3 = 1;

  query = '';
  currentLedger: any;

  logPool = [];
  ledgerPool = [];

  modeWatch: Observable<number>;

  loading = false;
  total = 0;

  constructor(private _title: Title, private cache: CacheService, private toastr: ToastrService, private ledger: LedgerService) {
    this.title = 'Finances (Suplias)';
    _title.setTitle('Suplias - Finances (Suplias)');

    this.modes = ['suplias_ledgers', 'ledger_logs'];
    this.setMode(0);
  }

  ngOnInit() {
    this.fetchLedgers(HEAD);
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  backToLedgerList() {
    this.ledgerLogs = null;
    this.currentLedger = null;
    this.setMode(0);
  }

  fetchLedgers(head: string) {
    const supliasLedgers = this.ledgerPool.filter((ledger) => ledger.head === head);

    if (supliasLedgers.length === 0) {
      this.ledger.fetchLedgersByHead(head).then((res: any) => {
        this.total = res.total;
        this.supliasLedgers = res.list;
        this.ledgerPool = [...this.ledgerPool, ...res.list];
      }).catch((error) => this.toastr.error(error.message));
    } else {
      this.supliasLedgers = supliasLedgers;
    }
  }

  fetchLogs(ledger: any) {
    this.currentLedger = ledger;
    this.mode = this.modes[1];
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
    this.loading = true;
    this.ledger.fetchLedgersByHead(HEAD).then((res: any) => {
      this.total = res.total;
      this.supliasLedgers = res.list;
      this.loading = false;
      res.list.map((ledger) => {
        const ledgerIndex = this.ledgerPool.findIndex((s) => s._id === ledger._id);
        if (ledgerIndex > -1) {
          this.ledgerPool.splice(ledgerIndex, 1, ledger);
        } else {
          this.ledgerPool = [...this.ledgerPool, ledger];
        }
      });
    }).catch((error) => this.toastr.error(error.message));
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

