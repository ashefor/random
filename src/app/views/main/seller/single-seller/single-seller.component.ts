import { Component, OnInit } from '@angular/core';
import { CacheService } from 'src/app/services/cache.service';
import { SellerService } from 'src/app/services/seller.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-single-seller',
  templateUrl: './single-seller.component.html',
  styleUrls: ['./single-seller.component.css']
})
export class SingleSellerComponent implements OnInit {
  filterOptions: string[] = ['cancelled', 'completed', 'draft', 'in-progress', 'pending'];
  title: String;
  sellerId: string;
  singleSeller;
  sorted: Array<any>;
  constructor(private seller: SellerService,
    private cache: CacheService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private pageTitle: Title) { }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.sellerId = param['id'];
      this.cache.singleSellers.subscribe(value => {
        if (value) {
          const item = value.find(i => i._id === this.sellerId);
          if (item) {
            this.singleSeller = item;
            this.sorted = this.singleSeller.orders;
            this.title = this.singleSeller.name;
            this.pageTitle.setTitle(`Suplias - Distributors - ${this.singleSeller.name}`);
          }
        }
      });
    });
    this.getSingleSeller();
  }


  getSingleSeller() {
    this.seller.fetchSingleSeller(this.sellerId)
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
    this.sorted = this.singleSeller.orders.filter(item => item.tag === order_status);
  }
}
