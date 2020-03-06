import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { BuyerService } from 'src/app/services/buyer.service';
import { Title } from '@angular/platform-browser';
import { DataHandlerService } from 'src/app/services/data.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-single-buyer',
  templateUrl: './single-buyer.component.html',
  styleUrls: ['./single-buyer.component.css']
})
export class SingleBuyerComponent implements OnInit {
  filterOptions: string[] = ['cancelled', 'completed', 'draft', 'in-progress', 'pending'];
  title: string;
  buyerId: string;
  buyer;
  ticketIds = [];
  form: FormGroup;
  sorted: Array<any>;
  sortOption: any;
  query = '';
  queryArray: Array<any>;
  schedules = [];
  constructor(private singlebuyerservice: BuyerService, private route: ActivatedRoute,
    private cache: CacheService,
    private pageTitle: Title,
    private authService: AuthenticationService,
    formBuilder: FormBuilder, private toastr: ToastrService) {
    this.form = formBuilder.group({
      hash: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      send_sms: [true]
    });

  }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.buyerId = param['id'];
      this.cache.singleBuyers.subscribe((value) => {
        if (value) {
          const singleBuyer = value.find((item) => item._id === this.buyerId);
          if (singleBuyer) {
            this.buyer = singleBuyer;
            console.log(this.buyer.schedule);
            this.buyer.schedule.forEach((obj) => {
              let delivery: any;
              delivery = JSON.parse(obj.meta);
              delivery.day = obj.day;
              this.schedules.push(delivery);
            });
            console.log(this.schedules);
            this.sorted = this.buyer.orders;
            this.title = this.buyer.name;
            this.pageTitle.setTitle(`Suplias - Buyers ${this.buyer.name}`);
            const walletLedger = this.buyer.ledgers.find(ledger => ledger.head === '0001' && ledger.subhead === '0000');
            this.buyer.walletBalance = walletLedger ? walletLedger.balance : 0;
            this.buyer.tickets.map((elem: any) => {
              this.ticketIds.push(elem._id.slice(elem._id.length - 6));
            });
          }
        }
      });
      this.fetchBuyer();
    });
  }


  fetchBuyer() {
    this.singlebuyerservice.fetchSingleBuyer(this.buyerId)
      .catch((error) => {
        this.toastr.error(error.message);
      });
  }

  orderStatusColor(orderstatus) {
    switch (orderstatus) {
      case 'draft':
        return 'blue';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      default:
        return 'brown';
    }
  }

  resetForm() {
    this.form.reset();
  }
  get showError() {
    return (this.form.controls.newPassword.dirty || this.form.controls.newPassword.touched)
      && (this.form.controls.newPassword.value !== this.form.controls.hash.value);
  }
  confirmPassword() {
    const hash = this.form.controls.hash.value;
    const newPassword = this.form.controls.newPassword.value;
    return (hash === newPassword);
  }
  changePassword(form) {
    const inputs = Array.from(document.querySelectorAll('input'));
    const submit = <HTMLButtonElement>document.getElementById('submit');
    inputs.forEach(input => {
      input.disabled = true;
    });
    submit.disabled = true;
    const user = this.buyer;
    const [phone, hash, send_sms] = [user.phone, form.hash, form.send_sms];
    this.authService.changeBuyerPassword(phone, hash, send_sms).then(() => {
      submit.disabled = false;
      inputs.forEach(input => {
        input.disabled = false;
      });
      this.resetForm();
      this.toastr.success('Password changed');
    }).catch((error) => {
      submit.disabled = false;
      inputs.forEach(input => {
        input.disabled = false;
      });
      this.toastr.error(error.message);
    });
  }

  filterTable(e) {
    const order_status = e.target.value;
    this.sorted = this.buyer.orders.filter(item => item.tag === order_status);
  }

  search() {
    let searchPool = this.buyer.orders;
    if (this.sortOption !== 'none') {
      searchPool = this.sorted;
    }
    const q = this.query;
    if (!q) {
      return;
    }
    this.queryArray = searchPool.filter((v) => {
      if (v.ref && q) {
        if (v.ref.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }
}
