import { Component, OnInit } from '@angular/core';
import { ShoppingListService } from 'src/app/services/shopping-list.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-shopping-lists',
  templateUrl: './shopping-lists.component.html',
  styleUrls: ['./shopping-lists.component.css']
})
export class ShoppingListsComponent implements OnInit {
  title: String;
  allShoppingList: Array<any>;
  currentPage = 1;
  itemsPerPage = 9;
  constructor(private shoppinglist: ShoppingListService,
    private cache: CacheService,
    private toastr: ToastrService,
    private router: Router,
    title: Title) {
    this.title = 'Shopping Lists';
    title.setTitle('Suplias - Shopping Lists');
  }

  ngOnInit() {
    this.cache.shoppingLists.subscribe((value: any) => {
      if (value) {
        this.allShoppingList = value;
      }
    });
    this.fetchShoppingList();
  }

  fetchShoppingList() {
    this.shoppinglist.readAllShoppingLists()
      .catch((error: any) => {
        this.toastr.error(error.message);
      });
  }

  itemIndex(indexOnPage: number): number {
    return (this.itemsPerPage * (this.currentPage - 1)) + indexOnPage;
  }

  openShoppingList(list) {
    const navigationExtras: NavigationExtras = {
      state: {
        buyer: list.buyer
      }
    };
    this.router.navigate(['main/shopping-lists/item', list._id], navigationExtras);
  }
}
