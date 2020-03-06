import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Notification } from 'src/app/interfaces/notification';
import { NotificationService } from 'src/app/services/notification.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  modeWatch: Observable<number>;
  _title: string;
  notificationTypes: Array<{title: string, value: string}>;
  orderTypes: Array<{title: string, value: string}>;
  form: FormGroup;
  preview: Array<{ title: string, body: string, phone: string }>;

  constructor(title: Title, formBuilder: FormBuilder, private notification: NotificationService, private toastr: ToastrService) {
    this._title = 'Notification';
    title.setTitle('Suplias - Notification');
    this.modeWatch = of(0);

    this.notificationTypes = [
      { title: 'Buyer notification', value: 'buyer_notification' },
      { title: 'Buyer order notification', value: 'buyer_order_notification' },
      { title: 'Seller order notification', value: 'seller_order_notification' },
      { title: 'Seller notification', value: 'seller_notification' },
    ];

    this.orderTypes = [
      { title: 'Draft', value: 'draft' },
      { title: 'Pending', value: 'pending' },
      { title: 'In progress', value: 'in-progress' },
      { title: 'Completed', value: 'completed' },
      { title: 'Cancelled', value: 'cancelled' },
    ];

    this.form = formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      message: ['', Validators.compose([Validators.required])],
      type: [null, Validators.compose([Validators.required, this.preventNull])],
      order_tag: [null, Validators.compose([this.preventNullOrderTag.bind(this)])],
      send_to_all: [true],
      send_sms_too: [false],
      recipients: ['', Validators.compose([this.noEmptyRecipients.bind(this)])],
      excluded: ['']
    });
  }

  ngOnInit() {
  }

  createFormBody(preview: boolean): Notification {
    let formBody: Notification, include, exclude, commit;

    preview ? commit = 'false' : commit = 'true';

    const normalNotification = (this.type.value === this.notificationTypes[0].value);

    if (this.send_to_all.value === true) {
      include = '*';
      (this.excluded.value !== '') ? (exclude = this.excluded.value) : (exclude = '-');
    } else {
      include = this.recipients.value;
      exclude = '-';
    }

    if (normalNotification) {
      formBody = {
        title: this.title.value,
        message: this.message.value,
        exclude,
        include,
        commit,
        send_sms_too: `${this.send_sms_too.value}`
      };
    } else {
      formBody = {
        tag: this.order_tag.value,
        title: this.title.value,
        message: this.message.value,
        exclude,
        include,
        commit,
        send_sms_too: `${this.send_sms_too.value}`
      };
    }

    return formBody;
  }

  previewNotification() {
    const [previewBtn, submitBtn] = [document.getElementById('previewBtn'), document.getElementById('submitBtn')] as HTMLButtonElement[];
    const body = this.createFormBody(true);

    previewBtn.disabled = true;
    submitBtn.disabled = true;

    if (this.type.value === this.notificationTypes[0].value) {
      this.notification.previewNormalBuyerNotification(body)
        .then((res: any) => {
          this.preview = res;
          previewBtn.disabled = false;
          submitBtn.disabled = false;
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
    if (this.type.value === this.notificationTypes[1].value) {
      this.notification.previewBuyerOrderNotification(body)
        .then((res: any) => {
          this.preview = res;
          previewBtn.disabled = false;
          submitBtn.disabled = false;
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
    if (this.type.value === this.notificationTypes[2].value) {
      this.notification.previewSellerOrderNotification(body)
        .then((res: any) => {
          this.preview = res;
          previewBtn.disabled = false;
          submitBtn.disabled = false;
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
    if (this.type.value === this.notificationTypes[3].value) {
      this.notification.previewNormalSellerNotification(body)
        .then((res: any) => {
          this.preview = res;
          previewBtn.disabled = false;
          submitBtn.disabled = false;
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
  }

  sendNotification() {
    const [previewBtn, submitBtn] = [document.getElementById('previewBtn'), document.getElementById('submitBtn')] as HTMLButtonElement[];
    const body = this.createFormBody(false);

    previewBtn.disabled = true;
    submitBtn.disabled = true;

    if (this.type.value === this.notificationTypes[0].value) {
      this.notification.sendNormalBuyerNotification(body)
        .then(() => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.success('Notification sent successfully');
          setTimeout(() => {
            this.form.reset();
            this.closePreview();
          }, 1000);
        })
        .catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
    if (this.type.value === this.notificationTypes[1].value) {
      this.notification.sendBuyerOrderNotification(body)
        .then(() => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.success('Notification sent successfully');
          setTimeout(() => {
            this.form.reset();
            this.closePreview();
          }, 1000);
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
    if (this.type.value === this.notificationTypes[2].value) {
      this.notification.sendSellerOrderNotification(body)
        .then(() => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.success('Notification sent successfully');
          setTimeout(() => {
            this.form.reset();
            this.closePreview();
          }, 1000);
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
    if (this.type.value === this.notificationTypes[3].value) {
      this.notification.sendNormalSellerNotification(body)
        .then(() => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.success('Notification sent successfully');
          setTimeout(() => {
            this.form.reset();
            this.closePreview();
          }, 1000);
        }).catch((err) => {
          previewBtn.disabled = false;
          submitBtn.disabled = false;
          this.toastr.error(err.message);
        });
    }
  }

  closePreview() {
    this.preview = null;
  }

  //#region Form Watchers
    watchNotificationType(e) {
      const selectedType = e.srcElement.value;
      if ((selectedType !== this.notificationTypes[1].value) || (selectedType !== this.notificationTypes[2].value)) {
        this.order_tag.reset();
      }
    }

    watchSendToAll(e) {
      const checked = e.srcElement.checked;
      if (checked) {
        this.recipients.reset();
      }
    }
  //#endregion

  //#region Custom Form Validators
    preventNull(control: AbstractControl) {
      if (!control.value || control.value === null || control.value === 'null') {
        return { isNull: true };
      }
      return null;
    }
    preventNullOrderTag(control: AbstractControl) {
      if (this.form) {
        if ((!control.value ||
            control.value === null ||
            control.value === 'null') &&
            ((this.form.get('type').value === this.notificationTypes[1].value) ||
             ((this.form.get('type').value === this.notificationTypes[2].value))
            )
          ) { return { isNull: true }; }
      }
      return null;
    }
    noEmptyRecipients(control: AbstractControl) {
      if (this.form) {
        if (control.value === '' && this.form.get('send_to_all').value === false) {
          return { emptyRecipients: true };
        }
      }
      return null;
    }
  //#endregion

  //#region Form Getters
    get title() {
      return this.form.get('title');
    }

    get message() {
      return this.form.get('message');
    }

    get type() {
      return this.form.get('type');
    }

    get order_tag() {
      return this.form.get('order_tag');
    }

    get send_to_all() {
      return this.form.get('send_to_all');
    }

    get send_sms_too() {
      return this.form.get('send_sms_too');
    }

    get recipients() {
      return this.form.get('recipients');
    }

    get excluded() {
      return this.form.get('excluded');
    }
  //#endregion
}
