import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { OrderService } from 'src/app/services/order.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.css']
})
export class OrderItemComponent implements OnInit {
  filterOptions: string[] = ['cancelled', 'pending'];
  title: string;
  orderItemId;
  orderItems: Array<any>;
  orderDetails;
  editStatus = false;
  buyer: any;
  constructor(private route: ActivatedRoute,
    private cache: CacheService, private orderservice: OrderService, private toastr: ToastrService, private pageTitle: Title,
    private router: Router) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras) {
        try {
          this.buyer = this.router.getCurrentNavigation().extras.state.buyer;
        } catch (e) {

        }
      }
    });
  }

  ngOnInit() {
    if (this.buyer) {
      this.title = `${this.buyer.name}'s Order Items`;
      this.pageTitle.setTitle(`Suplias - Order Items :: ${this.buyer.name}`);
    } else {
      this.title = `Buyer's Order Items`;
      this.pageTitle.setTitle(`Suplias - Orders`);
    }
    this.route.params.subscribe((param: Params) => {
      this.orderItemId = param['id'];
      this.cache.orderItems.subscribe(value => {
        if (value) {
          const items = value.filter(item => item.order_id === this.orderItemId);
          if (items.length) {
            this.orderItems = items;
            if (!this.buyer) {
              this.buyer = this.orderItems[0].order.buyer;
            }
            this.orderDetails = this.orderItems[0].order;
            this.title = `${this.buyer.name}'s Order Items`;
            this.pageTitle.setTitle(`Suplias - Orders - ${this.buyer.name}`);
          }
        }
      });
      this.fetchSingleOrderItem();
    });
  }


  fetchSingleOrderItem() {
    this.orderservice.fetchSingleOrderItem(this.orderItemId).then(() => {
      setTimeout(() => {
        if (!this.orderItems) {
          this.orderItems = [];
        }
      }, 1000);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  showChangeStatus() {
    this.editStatus = !this.editStatus;
  }
  changeStatus(event) {
    const old_tag = this.orderDetails.tag;
    const new_tag = event.target.value;
    const meta = this.orderDetails.meta;
    if (new_tag) {
      this.orderservice.changeOrderTag(this.orderItemId, old_tag, new_tag, meta).then(() => {
        this.toastr.success('Order Status changed');
      });
    }
  }

  getItemPrice(item) {
    return item.product.price * (item.quantity / item.product.case_count);
  }
}
