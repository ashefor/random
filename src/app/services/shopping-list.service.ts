import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataHandlerService } from './data.service';
import { CacheService } from './cache.service';
import { HttpClient } from '@angular/common/http';

const host = environment.host;
@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  readAllShoppingLists() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/shopping/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const lists = data.data;
          this.cache.setShoppingList(lists);
          resolve(lists);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }

  readShoppingItems (shoppingItemId) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('shopping_id', shoppingItemId);
      this.http.post(`${host}/shopping_item/read_by_shopping`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const shopping_item = data.data;
          this.cache.saveShoppingItems(shopping_item);
          resolve(shopping_item);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }
}
