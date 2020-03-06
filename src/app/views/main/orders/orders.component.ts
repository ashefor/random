import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  filterOptions: string[] = ['cancelled', 'completed', 'draft', 'in-progress', 'pending'];
  title: String;
  allOrders: Array<any>;
  sorted: Array<any>;
  currentPage = 1;
  itemsPerPage = 9;
  constructor(private orderservice: OrderService,
    private cache: CacheService,
    private toastr: ToastrService,
    title: Title,
    private router: Router) {
    this.title = 'Orders';
    title.setTitle('Suplias - Orders');
  }

  ngOnInit() {
    this.cache.allOrders.subscribe((value) => {
      if (value) {
        this.allOrders = value;
        this.sorted = value;
      }
    });
    this.fetchAllOrders();
  }

  fetchAllOrders() {
    this.orderservice.readAllOrders()
      .catch((error: any) => {
        this.toastr.error(error.message);
      });
  }

  itemIndex(indexOnPage: number): number {
    return (this.itemsPerPage * (this.currentPage - 1)) + indexOnPage;
  }

  changeOrderStatusColor(orderstatus) {
    switch (orderstatus) {
      case 'draft':
        return 'draft_color';
      case 'cancelled':
        return 'cancelled_color';
      case 'completed':
        return 'completed_color';
      case 'pending':
        return 'pending_color';
      default:
        return 'in_progress_color';
    }
  }

  filterTable(e) {
    const order_status = e.target.value;
    this.sorted = this.allOrders.filter(item => item.tag === order_status);
  }
  openOrderItems(order) {
    const navigationExtras: NavigationExtras = {
      state: {
        buyer: order.buyer
      }
    };
    this.router.navigate(['main/orders/item', order._id], navigationExtras);
  }
}
