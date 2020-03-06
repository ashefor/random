import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';


const host = environment.host;
@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  readAllTickets() {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/ticket/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const tickets = data.data;
          this.cache.setAllTickets(tickets);
          resolve(tickets);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    });
  }
}
