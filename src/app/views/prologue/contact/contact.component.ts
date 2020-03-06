import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  year: number;
  constructor(title: Title) {
    title.setTitle('Suplias - Contact Us');
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
