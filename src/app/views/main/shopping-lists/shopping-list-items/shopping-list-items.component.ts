import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ShoppingListService } from 'src/app/services/shopping-list.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-shopping-list-items',
  templateUrl: './shopping-list-items.component.html',
  styleUrls: ['./shopping-list-items.component.css']
})
export class ShoppingListItemsComponent implements OnInit {
  title: string;
  shoppingItemId: string;
  shoppingItems: Array<any>;
  shoppingListDetails;
  totalPrice: number;
  buyer: any;
  constructor(private route: ActivatedRoute, router: Router,
    private shoppingservice: ShoppingListService, private cache: CacheService, private toastr: ToastrService, private pageTitle: Title) {
    this.route.queryParams.subscribe(() => {
      if (router.getCurrentNavigation().extras) {
        try {
          this.buyer = router.getCurrentNavigation().extras.state.buyer;
        } catch (e) {
        }
      }
    });
  }

  ngOnInit() {
    if (this.buyer) {
      this.title = `${this.buyer.name}'s Shopping Items`;
      this.pageTitle.setTitle(`Suplias - Shopping Lists :: ${this.buyer.name}`);
    } else {
      this.title = `Buyer's Shopping Items`;
      this.pageTitle.setTitle(`Suplias - Shopping Lists`);
    }
    this.route.params.subscribe((param: Params) => {
      this.shoppingItemId = param['id'];
      this.cache.shoppingItems.subscribe(value => {
        if (value) {
          const items = value.filter(item => item.shopping_id === this.shoppingItemId);
          if (items.length) {
            this.shoppingItems = items;
            if (!this.buyer) {
              this.buyer = this.shoppingItems[0].shopping.buyer;
            }
            this.totalPrice = this.shoppingItems.reduce((sum, elem) => sum + elem.product.price, 0);
            this.shoppingListDetails = this.shoppingItems[0].shopping;
            this.title = `${this.buyer.name}'s Shopping Items`;
            this.pageTitle.setTitle(`Suplias - Shopping Lists - ${this.buyer.name}`);
          }
        }
      });
      this.fetchSingleShoppingListItem();
    });
  }

  fetchSingleShoppingListItem() {
    this.shoppingservice.readShoppingItems(this.shoppingItemId).then(() => {
      setTimeout(() => {
        if (!this.shoppingItems) {
          this.shoppingItems = [];
        }
      }, 1000);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  getItemPrice(item) {
    return item.product.price * (item.quantity / item.product.case_count);
  }
}
