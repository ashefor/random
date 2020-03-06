declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Title } from '@angular/platform-browser';
import _ from 'lodash';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  year;
  interestForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, title: Title) {
    this.interestForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      company: ['', Validators.compose([Validators.required])],
      title: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      stores: ['', Validators.compose([Validators.required])],
      products: ['', Validators.compose([Validators.required])],
      launchDate: ['', Validators.compose([Validators.required])],
    });
    title.setTitle('Suplias');
  }

  ngOnInit() {
    this.year = new Date().getFullYear();
    window.addEventListener('scroll', _.debounce(this.toggleNavOnScroll, 100));

    const hamburgerButton = document.getElementById('hamburger');
    hamburgerButton.addEventListener('click', this.toggleHamburger);

    // Hide Responsive Nav on Item Click
    const navLink = document.querySelectorAll('a.nav-link');
    const navbarResponsive = document.getElementById('navbarResponsive');
    Array.from(navLink).forEach(link => {
      link.addEventListener('click', () => {
        if (navbarResponsive.classList.contains('show')) {
          navbarResponsive.classList.remove('show');
          this.toggleHamburger();
        }
      });
    });
  }

  isLoggedIn() {
    const ustk = localStorage.getItem('ustk');
    if ((ustk === null) || (ustk === undefined)) {
      return false;
    } else {
      return true;
    }
  }

  toggleNavOnScroll() {
    const scrollY = window.pageYOffset || document.body.scrollTop;
    const navbar = document.getElementById('nav');
    // const heroHeight = document.getElementById('hero').clientHeight - 300;

    if (navbar && scrollY >= 100) {
      navbar.classList.add('navbar-scrolling');
    } else if (navbar && scrollY < 100) {
      navbar.classList.remove('navbar-scrolling');
    }
  }

  toggleHamburger() {
    const navbar = document.getElementById('nav');
    const hamburgerButton = document.getElementById('hamburger');
    navbar.classList.toggle('navbar-background');
    hamburgerButton.classList.toggle('open');
  }

  formSubmission() {
    const form = {
      name: this.interestForm.controls.name.value,
      company: this.interestForm.controls.company.value,
      title: this.interestForm.controls.title.value,
      email: this.interestForm.controls.email.value,
      stores: this.interestForm.controls.stores.value,
      products: this.interestForm.controls.products.value,
      launchDate: this.interestForm.controls.launchDate.value
    };
    this.authService.interestFormAction(form).then(() => {
      this.interestForm.reset();
      swal('', `Your entry has been saved. We'll notify you when Suplias goes live.`, 'success');
    }).catch((error: any) => {
      swal('', `A problem occured: ${error.message}`, 'error');
    });
  }
}
