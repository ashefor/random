import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  manufacturerHierarchy() {

  }
}
