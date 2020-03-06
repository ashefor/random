import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { Title } from '@angular/platform-browser';
import { BuyerService } from 'src/app/services/buyer.service';
import { StoreTypeService } from 'src/app/services/store-type.service';
import { LocationService } from 'src/app/services/location.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-buyer',
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.css']
})
export class BuyerComponent implements OnInit {
  title: string;
  statuses: Array<Status>;
  buyers: Array<any>;
  locations: Array<any>;
  storeTypes: Array<any>;

  itemsPerPage = 6;
  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';
  p = 1;

  constructor(title: Title, private buyer: BuyerService,
     private store: StoreTypeService,
     private location: LocationService,
    private cache: CacheService,
    private toastr: ToastrService) {
    this.title = 'Buyers';
    title.setTitle('Suplias - Buyers');
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.cache.buyers.subscribe((value) => {
      this.sorted = value;
      this.buyers = value;
    });
    this.fetchBuyers();
  }

  fetchBuyers() {
    this.buyer.fetchBuyers().catch((error) => {
      this.toastr.error(error.message);
    });
  }

  itemIndex(indexOnPage: number): number {
    return (this.itemsPerPage * (this.p - 1)) + indexOnPage;
  }
  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.buyers;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.buyers.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.buyers.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.buyers;
        break;
    }
  }

  search() {
    let searchPool = this.buyers;
    if (this.sortOption !== 'none') {
      searchPool = this.sorted;
    }

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
}
