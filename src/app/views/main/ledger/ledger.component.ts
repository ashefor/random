import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import printJS from 'node_modules/print-js/src/index.js';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { LedgerService } from 'src/app/services/ledger.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

export interface Ledger {
  balance: number;
  incurred: number;
  paid: number;
  logs: Array<any>;
}

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.css']
})
export class LedgerComponent implements OnInit {
  title: string;
  mode: string;
  modes: Array<string>;
  manufacturerId: any;
  summary: Ledger;
  details: any;
  p = 1;

  modeWatch: Observable<number>;

  constructor(title: Title, data: DataHandlerService, private cache: CacheService, private ledger: LedgerService,
    private toastr: ToastrService) {
    this.manufacturerId = JSON.parse(data.getUserData().manufacturer)._id;
    this.title = 'Ledger';
    title.setTitle('Suplias - Ledger');
    this.modes = [ 'list', 'detail'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
  }

  ngOnInit() {
    this.cache.ledger.subscribe((value) => {
      this.summary = value;
    });
    this.fetchLedger();
  }

  fetchLedger() {
    this.ledger.fetchSummary(this.manufacturerId).then(() => {}).catch((error) => { this.toastr.error(error.message); });
  }

  viewDetail(tag: string) {
    this.mode = this.modes[1];
    this.modeWatch = of(0);
    this.ledger.fetchDetails(tag).then((items: any) => {
      this.details = items;
    }).catch((error) => this.toastr.error(error.message));
  }

  toList() {
    this.details = null;
    this.mode = this.modes[0];
    this.modeWatch = of(0);
  }

  print() {
    document.getElementById('print').hidden = false;
    printJS({printable: 'printable', type: 'html', header: 'Cash summary'});
    document.getElementById('print').hidden = true;
  }
}
