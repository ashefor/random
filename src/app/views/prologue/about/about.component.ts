import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  year: number;
  constructor(title: Title) {
    title.setTitle('Suplias - About');
  }

  ngOnInit() {
    this.year = new Date().getFullYear();
  }

  isLoggedIn() {
    const ustk = localStorage.getItem('ustk');
    if ((ustk === null) || (ustk === undefined)) {
      return false;
    } else {
      return true;
    }
  }
}
