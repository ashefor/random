import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Login } from 'src/app/interfaces/login';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  login: Login = { hash: '', phone: '', remember: true };
  phone: any = '';

  constructor(title: Title, private auth: AuthenticationService, private dataHandler: DataHandlerService,
    private router: Router, private ngZone: NgZone, private toastr: ToastrService) {
  }

  ngOnInit() {
  }

  validate(obj: Login) {
    const [phone, hash] = [obj.phone, obj.hash];
    if (phone !== '' && hash !== '' && !(phone.length < 11) && !(hash.length < 6)) {
      return true;
    }
    return false;
  }

  parsePhone(e) {
    this.login.phone = String(e.srcElement.value);
  }

  loginSubmit(obj: Login = this.login) {
    const [phone, hash, remember] = [obj.phone, obj.hash, obj.remember];
    const result = this.auth.login(phone, hash, remember);

    result.then(async (response: any) => {
      if (response.code === 200) {
        const [token, user] = [response['token'], response['user']];
        this.dataHandler.setUserSession(token);
        this.dataHandler.setUserData(user);
        this.ngZone.run(() => this.router.navigate(['main/dashboard']));
      } else {
        this.toastr.error(response.message);
      }
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }
}
