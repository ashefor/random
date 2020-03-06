declare var swal: any;
import { Component, OnInit, Input } from '@angular/core';
import { DataHandlerService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {
  @Input() title: string;
  @Input() mode: number;
  @Input() componentInstance: any;

  constructor(private dataHandler: DataHandlerService, public router: Router) { }

  ngOnInit() { }

  goBack() {
    this.componentInstance.setMode(0);
  }

  setUserName() {
    const userData = this.dataHandler.getUserData();
    return userData.name;
  }

  logOut() {
    swal('Are your sure you want to log out?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((logout) => {
      if (logout) {
        const darkMode = JSON.parse(localStorage.getItem('darkMode')) || 'false';
        window.localStorage.clear();
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        this.router.navigate(['']);
      }
    });
  }

}
