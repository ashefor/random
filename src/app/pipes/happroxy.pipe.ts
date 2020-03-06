import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'happroxy' })
export class HapproxyPipe implements PipeTransform {

  transform(value: number, type: string) {
    let pipedValue;
    switch (type) {
      case 'time':
        pipedValue = this.happroxy_time(value);
        break;

      case 'number':
        pipedValue = this.happroxy_number(value);
        break;
    
      default:
        pipedValue = this.happroxy_number(value);
        break;
    }
    return pipedValue;
  }

  happroxy_time(timestamp) {
    const base = { hour: 3600, minute: 60, day: 86400 };
    const timeNow = new Date().getTime() / 1000;
    const margin = timeNow - timestamp;

    let time = margin / base.hour;
    let result: any;

    if (time < 1) {
      let minutes = margin / base.minute;
      result = `${minutes} min ago`;
      if (minutes <= 0) {
        result = `Just now`;
      }
      if (minutes === 1) {
        result = `1 min ago`;
      }
      if (Number.isInteger(minutes) === false) {
        minutes = Math.round(minutes);
        result = `~ ${minutes} min ago`;
        if (minutes === 1) {
          result = `~ 1 min ago`;
        }
        if (minutes <= 0) {
          result = `Just now`;
        }
      }
    }

    if (time < 24 && time >= 1) {
      result = `${time} hr ago`;
      if (time === 1) {
        result = `1 hr ago`;
      }
      if (Number.isInteger(time) === false) {
        time = Math.round(time);
        result = `~ ${time} hrs ago`;
        if (time === 1) {
          result = `~ 1 hr ago`;
        }
      }
    }

    if (time >= 24) {
      const days = margin / base.day;
      if (days >= 1 && days < 2) {
        result = `Yesterday`;
      }
      if (days >= 2 && days < 3) {
        result = `2 days ago`;
      }
      if (days >= 3 && days < 4) {
        result = `3 days ago`;
      }
      if (days >= 4 && days < 5) {
        result = `4 days ago`;
      }
      if (days >= 5 && days < 6) {
        result = `5 days ago`;
      }
      if (days >= 6 && days < 7) {
        result = `6 days ago`;
      }
      if (days >= 7) {
        result = this.convertDate(timestamp);
      }
    }
    return result;
  }

  convertDate(timestamp) {
    const d = new Date(timestamp * 1000),
      // Convert the passed timestamp to milliseconds
      yyyy = d.getUTCFullYear(),
      mm = d.getUTCMonth() + 1,	// Months are zero based.
      dd = d.getUTCDate();
    let date, m = `${mm}`, ddd = `${dd}`;

      if (mm < 10) {
        m = `0${mm}`;
      }
      if (dd < 10) {
        ddd = `0${dd}`;
      }
    // ie: 21/02/2019
    date = `${ddd}/${m}/${yyyy}`;
    return date;
  }

  roundTo1dp = (num: number) => Math.round(num * 10) / 10;

  happroxy_number(num: number): string {
    let result: string;
  
    if (num >= 1000 && num < 1000000) {
      const quotient = num/1000;
      result = `${this.roundTo1dp(quotient)}k`;
    }
    else if (num >= 1000000 && num < 1000000000) {
      const quotient = num/1000000;
      result = `${this.roundTo1dp(quotient)}M`;
    }
    else if (num >= 1000000000 && num < 1000000000000) {
      const quotient = num/1000000000;
      result = `${this.roundTo1dp(quotient)}B`;
    }
    else {
      result = num.toLocaleString('en');
    }

    return result;
  }
}
