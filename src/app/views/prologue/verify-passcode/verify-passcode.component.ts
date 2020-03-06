import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataHandlerService } from 'src/app/services/data.service';
import { VerifyPayload } from '../reset-password/reset-password.component';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-verify-passcode',
  templateUrl: './verify-passcode.component.html',
  styleUrls: ['./verify-passcode.component.css']
})
export class VerifyPasscodeComponent implements OnInit {
  payload: VerifyPayload;
  phone: string;
  passcode = '';
  constructor(route: ActivatedRoute, dataHandler: DataHandlerService, private authService: AuthenticationService,
    private router: Router, private toastr: ToastrService) {
    this.payload = dataHandler.decrypt(route.snapshot.paramMap.get('object'));
  }

  parsePasscode(e) {
    this.passcode = String(e.srcElement.value);
  }

  ngOnInit() {
    const phoneArray = Array.from(this.payload.username);
    for (let i = 3; i <= 7; i++) {
      phoneArray[i] = '*';
    }
    this.phone = phoneArray.join('');
  }

  resetPassword() {
    if (this.payload.key === 12345) {
      this.toastr.error('Invalid passcode');
      return false;
    } else {
      this.authService.resetAuth(this.payload.key, this.payload.username).then(() => {
        this.router.navigate(['login']);
        const msg = `Your password has been reset and the new password sent to your phone number.
        Ensure to change it as soon as possible`;
        this.toastr.success(msg);
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }
  }

}
