import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataHandlerService } from 'src/app/services/data.service';
import { OrderService } from 'src/app/services/order.service';
import * as moment from 'moment';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';

export interface Stats {
  total: number;
  stats: Array<any>;
}

@Component({
  selector: 'app-manufacturer-orders',
  templateUrl: './manufacturer-orders.component.html',
  styleUrls: ['./manufacturer-orders.component.css']
})
export class ManufacturerOrdersComponent implements OnInit {
  title: string;
  ranges: Array<{name: string, value: string}>;

  dayStats: Stats;
  weekStats: Stats;
  monthStats: Stats;
  yearStats: Stats;
  currentRange = 'today';
  manufacturer_id: any;

  constructor(title: Title, private route: ActivatedRoute, data: DataHandlerService, private orderService: OrderService,
    private cache: CacheService, private toastr: ToastrService) {
    this.ranges = [
      { name: 'This week', value: 'week'},
      { name: 'This month', value: 'month'},
      { name: 'This year', value: 'year'},
    ];
    this.title = `Order Stats`;
    title.setTitle(`Suplias - Order Stats`);
    this.manufacturer_id = JSON.parse(data.getUserData().manufacturer)._id;
  }

  ngOnInit() {
    this.cache.manufacturerOrderDay.subscribe((value) => {
      this.dayStats = value;
    });
    this.cache.manufacturerOrderMonth.subscribe((value) => {
      this.monthStats = value;
    });
    this.cache.manufacturerOrderWeek.subscribe((value) => {
      this.weekStats = value;
    });
    this.cache.manufacturerOrderYear.subscribe((value) => {
      this.yearStats = value;
    });
    const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
    this.fetchDay(this.manufacturer_id, min, max);
  }

  fetchDay(manufacturer_id: string, min: number, max: number) {
    this.orderService.fetchManufacturerStatistics(manufacturer_id, min, max).then((result: any) => {
      this.cache.setManufacturerDayStats({
        total: result.total,
        stats: result.stats
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchWeek(manufacturer_id: string, min: number, max: number) {
    this.orderService.fetchManufacturerStatistics(manufacturer_id, min, max).then((result: any) => {
      this.cache.setManufacturerWeekStats({
        total: result.total,
        stats: result.stats
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchMonth(manufacturer_id: string, min: number, max: number) {
    this.orderService.fetchManufacturerStatistics(manufacturer_id, min, max).then((result: any) => {
      this.cache.setManufacturerMonthStats({
        total: result.total,
        stats: result.stats
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchYear(manufacturer_id: string, min: number, max: number) {
    this.orderService.fetchManufacturerStatistics(manufacturer_id, min, max).then((result: any) => {
      this.cache.setManufacturerYearStats({
        total: result.total,
        stats: result.stats
      });
      console.log(result);
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  sort(e) {
    const val = e.srcElement.value;
    this.currentRange = val;
    switch (val) {
      case 'today':
        if (this.dayStats) {
          this.dayStats = this.dayStats;
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manufacturer_id, min, max);
        } else {
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manufacturer_id, min, max);
        }
        break;
      case 'week':
        if (this.weekStats) {
          this.weekStats = this.weekStats;
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('week').unix(), moment.utc().endOf('week').unix()];
          this.fetchWeek(this.manufacturer_id, min, max);
        } else {
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('week').unix(), moment.utc().endOf('week').unix()];
          this.fetchWeek(this.manufacturer_id, min, max);
        }
        break;
      case 'month':
        if (this.monthStats) {
          this.monthStats = this.monthStats;
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('month').unix(), moment.utc().endOf('month').unix()];
          this.fetchMonth(this.manufacturer_id, min, max);
        } else {
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('month').unix(), moment.utc().endOf('month').unix()];
          this.fetchMonth(this.manufacturer_id, min, max);
        }
        break;
      case 'year':
        if (this.yearStats) {
          this.yearStats = this.yearStats;
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('year').unix(), moment.utc().endOf('year').unix()];
          this.fetchYear(this.manufacturer_id, min, max);
        } else {
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('year').unix(), moment.utc().endOf('year').unix()];
          this.fetchYear(this.manufacturer_id, min, max);
        }
        break;

      default:
        if (this.dayStats) {
          this.dayStats = this.dayStats;
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manufacturer_id, min, max);
        } else {
          // tslint:disable-next-line
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manufacturer_id, min, max);
        }
        break;
    }
  }

}
