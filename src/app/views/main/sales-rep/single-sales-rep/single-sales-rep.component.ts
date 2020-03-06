import { Component, OnInit } from '@angular/core';
import { CacheService } from 'src/app/services/cache.service';
import { ActivatedRoute, Params } from '@angular/router';
import { SalesOfficerService } from 'src/app/services/sales-officer.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-single-sales-rep',
  templateUrl: './single-sales-rep.component.html',
  styleUrls: ['./single-sales-rep.component.css']
})
export class SingleSalesRepComponent implements OnInit {
  filterOptions: string[] = ['cancelled', 'completed', 'draft', 'in-progress', 'pending'];
  title: string;
  salesRepId: string;
  salesOfficer;
  sorted: Array<any>;
  sortOption: any;
  query = '';
  queryArray: Array<any>;
  constructor(private cache: CacheService,
    private route: ActivatedRoute,
    private salesofficerservice: SalesOfficerService,
    private toastr: ToastrService, private pageTitle: Title) {
  }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.salesRepId = param['id'];
    });
    this.cache.singleSalesOfficers.subscribe(value => {
      if (value) {
        const item = value.find(i => i._id === this.salesRepId);
        if (item) {
          this.salesOfficer = item;
          this.sorted = this.salesOfficer.orders;
          this.title = this.salesOfficer.name;
          this.pageTitle.setTitle(`Suplias - Sales Reps - ${this.salesOfficer.name}`);
        }
      }
    });
    this.fetchSingleSalesOfficer();
  }

  fetchSingleSalesOfficer() {
    this.salesofficerservice.fetchSingleSalesRep(this.salesRepId)
      .catch((error) => {
        this.toastr.error(error.message);
      });
  }

  orderStatusColor(orderstatus) {
    switch (orderstatus) {
      case 'draft':
        return 'blue';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      default:
        return 'brown';
    }
  }

  filterTable(e) {
    const order_status = e.target.value;
    this.sorted = this.salesOfficer.orders.filter(item => item.tag === order_status);
  }

  search() {
    let searchPool = this.salesOfficer.orders;
    if (this.sortOption !== 'none') {
      searchPool = this.sorted;
    }
    const q = this.query;
    if (!q) {
      return;
    }
    this.queryArray = searchPool.filter((v) => {
      if (v.ref && q) {
        if (v.ref.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }
}
