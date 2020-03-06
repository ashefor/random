import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataHandlerService } from 'src/app/services/data.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface Change {
  old: string;
  new: string;
  confirm: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  title: any;
  change: Change = { old: '', new: '', confirm: '' };

  form: FormGroup;

  constructor(title: Title, dataHandler: DataHandlerService, private authService: AuthenticationService, formBuilder: FormBuilder,
    private toastr: ToastrService) {
    this.title = 'Profile';
    this.user = dataHandler.getUserData();
    if (this.user.group !== 'admin') {
      // tslint:disable-next-line
      this.user.manufacturer !== undefined ? this.user.manufacturer = JSON.parse(this.user.manufacturer) : null;
      // tslint:disable-next-line
      this.user.seller !== undefined ? this.user.seller = JSON.parse(this.user.seller) : null;
    }
    title.setTitle(`Suplias - ${dataHandler.getUserData().name}`);
    this.form = formBuilder.group({
      oldPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ngOnInit() {
  }

  convertDate(timestamp) {
    // tslint:disable-next-line
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date(timestamp * 1000),
      // Convert the passed timestamp to milliseconds
      yyyy = d.getUTCFullYear(),
      mm = d.getUTCMonth();

    return `${months[mm]} ${yyyy}`;
  }

  validate(obj: Change) {
    const [old, _new, confirm] = [obj.old, obj.new, obj.confirm];
    return (old !== '' && _new !== '' && confirm !== '' && this.confirmPassword(obj) === true && this.checkOldNew(obj) === false);
  }

  confirmPassword(obj: Change) {
    return obj.new === obj.confirm;
  }

  resetForm() {
    this.form.reset();
  }

  checkOldNew(obj: Change) {
    return obj.old === obj.new;
  }

  changePassword(obj: Change = this.change) {
    const inputs = Array.from(document.querySelectorAll('input'));
    const submit = <HTMLButtonElement> document.getElementById('submit');
    inputs.forEach(input => {
      input.disabled = true;
    });
    submit.disabled = true;
    this.authService.changePassword(this.user['phone'], obj.old, obj.new).then(() => {
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
}
