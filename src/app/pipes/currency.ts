import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'customCurrency' })
export class CurrencyPipe implements PipeTransform {
  transform(value: number, country: string = 'NG') {
    if (value < 0) {
      value = value * -1;
    }
    let symbol: string;
    switch (country) {
      case 'NG':
        // symbol = '&#8358;';
        symbol = '₦';
        break;

      default:
        symbol = '₦';
        break;
    }

    const amount = value.toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    const tempElement = document.createElement('span');
    tempElement.innerHTML = `${symbol}${amount}`;
    return tempElement.innerText;
  }
}
