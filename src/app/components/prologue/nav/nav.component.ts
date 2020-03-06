import { Component, OnInit } from '@angular/core';
import { DataHandlerService } from 'src/app/services/data.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  dashboardLink: string;

  constructor(private dataHandler: DataHandlerService) { }

  ngOnInit() {
  }

  loggedIn() {
    const [token, user] = [localStorage.getItem('ustk'), localStorage.getItem('udt')];
    if (token !== null && token !== undefined && user !== null && user !== undefined) {
      this.dashboardLink = this.dataHandler.getDashboardLink();
      return true;
    }
    return false;
  }
}
