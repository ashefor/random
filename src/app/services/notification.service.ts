import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DataHandlerService } from './data.service';
import { Notification } from '../interfaces/notification';

const host = environment.host;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient, private dataHandler: DataHandlerService) { }

  previewNormalBuyerNotification(notification: Notification) {
    const form = new FormData();
    form.append('filter_type', '*');
    form.append('filter_value', '*');
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_buyers_for`, form).subscribe((data: any) => {
        if (data.code === 200) {
          const response = data.data;
          const _notification: { body: string, title: string, phone: string }[] = [];

          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              if (response[key].notifications[0]) {
                console.log(response[key].notifications[0].notification);
                _notification.push({ ...response[key].notifications[0].notification, phone: key });
              }
            }
          }
          resolve(_notification);
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  previewBuyerOrderNotification(notification: Notification) {
    const form = new FormData();
    form.append('tag', notification.tag);
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_buyers_for_orders`, form).subscribe((data: any) => {
        if (data.code === 200) {
          const response = data.data;
          let _notification: { body: string, title: string };

          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              _notification = response[key].notifications[0].notification;
              break;
            }
          }
          resolve(_notification);
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  previewNormalSellerNotification(notification: Notification) {
    const form = new FormData();
    form.append('filter_type', '*');
    form.append('filter_value', '*');
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_sellers_for`, form).subscribe((data: any) => {
        if (data.code === 200) {
          const response = data.data;
          let _notification: { body: string, title: string };

          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              _notification = response[key].notifications[0].notification;
              break;
            }
          }
          resolve(_notification);
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  previewSellerOrderNotification(notification: Notification) {
    const form = new FormData();
    form.append('tag', notification.tag);
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_sellers_for_orders`, form).subscribe((data: any) => {
        if (data.code === 200) {
          const response = data.data;
          let _notification: { body: string, title: string };

          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              _notification = response[key].notifications[0].notification;
              break;
            }
          }
          resolve(_notification);
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  sendNormalBuyerNotification(notification: Notification) {
    const form = new FormData();
    form.append('filter_type', '*');
    form.append('filter_value', '*');
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_buyers_for`, form).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  sendBuyerOrderNotification(notification: Notification) {
    const form = new FormData();
    form.append('tag', notification.tag);
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_buyers_for_orders`, form).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  sendNormalSellerNotification(notification: Notification) {
    const form = new FormData();
    form.append('filter_type', '*');
    form.append('filter_value', '*');
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_sellers_for`, form).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }

  sendSellerOrderNotification(notification: Notification) {
    const form = new FormData();
    form.append('tag', notification.tag);
    form.append('title', notification.title);
    form.append('message', notification.message);
    form.append('exclude', notification.exclude);
    form.append('include', notification.include);
    form.append('commit', notification.commit);
    form.append('send_sms_too', notification.send_sms_too);

    return new Promise((resolve, reject) => {
      this.http.post(`${host}/notification/poll_sellers_for_orders`, form).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject(data);
        }
      }, error => reject(error));
    });
  }
}
