import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CodeService } from 'src/app/services/code.service';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.css']
})
export class ReferralsComponent implements OnInit {
  code_id: string;
  referrals: Array<any>;

  title: any;
  queryArray: Array<any>;
  query = '';

  p = 1;

  constructor(title: Title, private route: ActivatedRoute, private codeService: CodeService, cache: CacheService) {
    this.code_id = this.route.snapshot.paramMap.get('id');

    cache.codes.subscribe((value) => {
      if (value) {
        const code = value.find((_code) => _code._id === this.code_id);
        if (code) {
          title.setTitle(`Suplias - ${code.code} Referrals`);
          this.title = `${code.code} Referrals`;
        } else {
          title.setTitle(`Suplias - Referrals`);
          this.title = `Referrals`;
        }
      } else {
        title.setTitle(`Suplias - Referrals`);
        this.title = `Referrals`;
      }
    });
  }

  ngOnInit() {
    this.fetchReferrals(this.code_id);
  }

  fetchReferrals(seller_code_id: string) {
    this.codeService.getReferrals(seller_code_id).then((referrals: Array<any>) => {
      if (referrals.length !== 0) {
        this.referrals = referrals.sort((a, b) => {
          const A = a.buyer.toLowerCase(), B = b.buyer.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
      } else {
        this.referrals = [];
      }
    });
  }

  search() {
    const searchPool = this.referrals;

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.buyer && q) {
        if ( v.buyer.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }
}
