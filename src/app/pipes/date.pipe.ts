import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'customDate' })

export class DatePipe implements PipeTransform {
    transform(value: number) {
        return this.convertDate(value);
    }
    convertDate(timestamp) {
        const d = new Date(timestamp * 1000),
            // Convert the passed timestamp to milliseconds
            yyyy = d.getUTCFullYear(), mm = d.getUTCMonth() + 1, // Months are zero based.
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
}
