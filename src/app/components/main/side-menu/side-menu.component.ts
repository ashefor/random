import { Component, OnInit } from '@angular/core';
import { DataHandlerService } from 'src/app/services/data.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})

export class SideMenuComponent implements OnInit {
  darkMode: string;
  user_group: string;
  manufacturer: any;
  user: any;
  seller: any;

  constructor(data: DataHandlerService) {
    this.darkMode = JSON.parse(localStorage.getItem('darkMode')) || 'false';
    this.user = data.getUserData();
    this.user_group = this.user.group;
    if (this.user_group === 'manufacturer_staff') {
      this.manufacturer = JSON.parse(this.user.manufacturer);
    }
    if (this.user_group === 'sales') {
      this.seller = JSON.parse(this.user.seller);
    }
  }

  ngOnInit() {
    const toggleMenuButton = document.getElementById('toggleMenuButton');
    toggleMenuButton.addEventListener('click', this.toggleSideMenu);
    // setTimeout(() => { document.querySelector('.active').scrollIntoView(); }, 100);
  }

  toggleSideMenu() {
    const sideMenu = document.querySelector('.sidemenu');
    const contentWrap = document.querySelector('.content-wrap');
    const toggleMenuButton = document.getElementById('toggleMenuButton');

    toggleMenuButton.classList.toggle('open');
    sideMenu.classList.toggle('sidemenu-visible');
    contentWrap.classList.toggle('sidemenu-visible');
  }

  toggleMode(e) {
    e.preventDefault();
    this.darkMode = this.darkMode === 'true' ? 'false' : 'true';
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
  }
}
