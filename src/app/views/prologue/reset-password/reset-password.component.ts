import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DataHandlerService } from 'src/app/services/data.service';

interface Reset {
  phone: string;
}

export interface VerifyPayload {
  username: string;
  key: any;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  reset: Reset = { phone: '' };
  phone: any = '';

  constructor(title: Title, private auth: AuthenticationService, private router: Router, private dataHandler: DataHandlerService,
    private toastr: ToastrService) {
    title.setTitle('Suplias - Forgot Password');
  }

  ngOnInit() {
  }

  validate(obj: Reset) {
    const [phone] = [obj.phone];
    if (phone !== '' && !(phone.length < 11)) {
      return true;
    }
    return false;
  }

  parsePhone(e) {
    this.reset.phone = String(e.srcElement.value);
  }

  resetSubmit(obj: Reset = this.reset) {
    this.auth.sendReset(obj.phone).then((key: any) => {
      // tslint:disable-next-line
      key === null || key === undefined ? key = 12345 : key = key;
      const encryptionPayload: VerifyPayload = { key: key, username: obj.phone };
      const object = this.dataHandler.encrypt(encryptionPayload);
      this.router.navigate([`reset-password/${object}`]);
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }
}
