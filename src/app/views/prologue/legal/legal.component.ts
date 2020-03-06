import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css']
})
export class LegalComponent implements OnInit {
  year: number;
  constructor(title: Title) {
    title.setTitle('Suplias - Privacy policy and User license information');
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
