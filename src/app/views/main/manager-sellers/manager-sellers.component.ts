import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataHandlerService } from 'src/app/services/data.service';
import { OrderService } from 'src/app/services/order.service';
import * as moment from 'moment';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';

interface OrderStats {
  total: number;
  cancelled_buyer: number;
  cancelled_seller: number;
  fulfilled: number;
  cancelled: number;
  cash: number;
  loyalty: number;
}

export interface SellerStats {
  name: string;
  _id: string;
  stats: OrderStats;
}


@Component({
  selector: 'app-manager-sellers',
  templateUrl: './manager-sellers.component.html',
  styleUrls: ['./manager-sellers.component.css']
})
export class ManagerSellersComponent implements OnInit {
  title: string;
  ranges: Array<{name: string, value: string}>;
  criteria: Array<{name: string, value: string}>;

  dayStats: Array<SellerStats>;
  weekStats: Array<SellerStats>;
  monthStats: Array<SellerStats>;
  yearStats: Array<SellerStats>;

  manager_id: string;

  currentRange = 'today';
  currentCriterion = 'fulfilled';

  constructor(title: Title, private route: ActivatedRoute, data: DataHandlerService, private orderService: OrderService,
    private cache: CacheService, private toastr: ToastrService) {
    this.manager_id = data.getUserData()._id;
    this.ranges = [
      { name: 'This week', value: 'week'},
      { name: 'This month', value: 'month'},
      { name: 'This year', value: 'year'},
    ];
    this.criteria = [
      { name: 'Cancelled (total)', value: 'cancelled'},
      { name: 'Cancelled (buyer)', value: 'cancelled_buyer'},
      { name: 'Cancelled (seller)', value: 'cancelled_seller'}
    ];
    this.title = `Distributor Stats`;
    title.setTitle(`Suplias - Distributor Stats`);
  }

  ngOnInit() {
    this.cache.managerOrderDay.subscribe((value) => {
      this.dayStats = value;
    });
    this.cache.managerOrderMonth.subscribe((value) => {
      this.monthStats = value;
    });
    this.cache.managerOrderWeek.subscribe((value) => {
      this.weekStats = value;
    });
    this.cache.managerOrderYear.subscribe((value) => {
      this.yearStats = value;
    });
    const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
    this.fetchDay(this.manager_id, min, max);
  }

  fetchDay(manager_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    let tempStats: Array<SellerStats> = [];
    this.orderService.fetchSellersStatistics(manager_id, min, max).then((report: any) => {
      report.forEach((seller, index) => {
        const sellerStat: SellerStats = {
          _id: seller._id,
          name: seller.name,
          stats: {
            total: seller['stats']['total'],
            fulfilled: seller['stats']['fulfilled']['total'],
            cancelled: seller['stats']['cancelled']['total'],
            cash: seller['stats']['fulfilled']['cash'],
            loyalty: seller['stats']['fulfilled']['loyalty'],
            cancelled_buyer: seller['stats']['cancelled']['buyer'],
            cancelled_seller: seller['stats']['cancelled']['seller'],
          }
        };
        tempStats = tempStats.concat(sellerStat);
        if (index === report.length - 1) {
          const dayStats = tempStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          this.cache.setManagerDayStats(dayStats);
        }
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchWeek(manager_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    let tempStats: Array<SellerStats> = [];
    this.orderService.fetchSellersStatistics(manager_id, min, max).then((report: any) => {
      report.forEach((seller, index) => {
        const sellerStat: SellerStats = {
          _id: seller._id,
          name: seller.name,
          stats: {
            total: seller['stats']['total'],
            fulfilled: seller['stats']['fulfilled']['total'],
            cancelled: seller['stats']['cancelled']['total'],
            cash: seller['stats']['fulfilled']['cash'],
            loyalty: seller['stats']['fulfilled']['loyalty'],
            cancelled_buyer: seller['stats']['cancelled']['buyer'],
            cancelled_seller: seller['stats']['cancelled']['seller'],
          }
        };
        tempStats = tempStats.concat(sellerStat);
        if (index === report.length - 1) {
          const weekStats = tempStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          this.cache.setManagerWeekStats(weekStats);
        }
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchMonth(manager_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    let tempStats: Array<SellerStats> = [];
    this.orderService.fetchSellersStatistics(manager_id, min, max).then((report: any) => {
      report.forEach((seller, index) => {
        const sellerStat: SellerStats = {
          _id: seller._id,
          name: seller.name,
          stats: {
            total: seller['stats']['total'],
            fulfilled: seller['stats']['fulfilled']['total'],
            cancelled: seller['stats']['cancelled']['total'],
            cash: seller['stats']['fulfilled']['cash'],
            loyalty: seller['stats']['fulfilled']['loyalty'],
            cancelled_buyer: seller['stats']['cancelled']['buyer'],
            cancelled_seller: seller['stats']['cancelled']['seller'],
          }
        };
        tempStats = tempStats.concat(sellerStat);
        if (index === report.length - 1) {
          const monthStats = tempStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          this.cache.setManagerMonthStats(monthStats);
        }
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchYear(manager_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    let tempStats: Array<SellerStats> = [];
    this.orderService.fetchSellersStatistics(manager_id, min, max).then((report: any) => {
      report.forEach((seller, index) => {
        const sellerStat: SellerStats = {
          _id: seller._id,
          name: seller.name,
          stats: {
            total: seller['stats']['total'],
            fulfilled: seller['stats']['fulfilled']['total'],
            cancelled: seller['stats']['cancelled']['total'],
            cash: seller['stats']['fulfilled']['cash'],
            loyalty: seller['stats']['fulfilled']['loyalty'],
            cancelled_buyer: seller['stats']['cancelled']['buyer'],
            cancelled_seller: seller['stats']['cancelled']['seller'],
          }
        };
        tempStats = tempStats.concat(sellerStat);
        if (index === report.length - 1) {
          const yearStats = tempStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          this.cache.setManagerYearStats(yearStats);
        }
      });
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
          this.dayStats = this.dayStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manager_id, min, max);
        } else {
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manager_id, min, max);
        }
        break;

      case 'week':
        if (this.weekStats) {
          this.weekStats = this.weekStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          const [min, max] = [moment.utc().startOf('week').unix(), moment.utc().endOf('week').unix()];
          this.fetchWeek(this.manager_id, min, max);
        } else {
          const [min, max] = [moment.utc().startOf('week').unix(), moment.utc().endOf('week').unix()];
          this.fetchWeek(this.manager_id, min, max);
        }
        break;

      case 'month':
        if (this.monthStats) {
          this.monthStats = this.monthStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          const [min, max] = [moment.utc().startOf('month').unix(), moment.utc().endOf('month').unix()];
          this.fetchMonth(this.manager_id, min, max);
        } else {
          const [min, max] = [moment.utc().startOf('month').unix(), moment.utc().endOf('month').unix()];
          this.fetchMonth(this.manager_id, min, max);
        }
        break;

      case 'year':
        if (this.yearStats) {
          this.yearStats = this.yearStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          const [min, max] = [moment.utc().startOf('year').unix(), moment.utc().endOf('year').unix()];
          this.fetchYear(this.manager_id, min, max);
        } else {
          const [min, max] = [moment.utc().startOf('year').unix(), moment.utc().endOf('year').unix()];
          this.fetchYear(this.manager_id, min, max);
        }
        break;

      default:
        if (this.dayStats) {
          this.dayStats = this.dayStats.sort(function(a, b) {
            const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
            if (A > B) {
              return -1;
            }
            if (A < B) {
              return 1;
            }
            return 0;
          });
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manager_id, min, max);
        } else {
          const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
          this.fetchDay(this.manager_id, min, max);
        }
        break;
    }
  }

  filter(e, array: Array<SellerStats>) {
    const val = e.srcElement.value;
    this.currentCriterion = val;
    switch (val) {
      case 'fulfilled':
        array.sort(function(a, b) {
          const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        break;

      case 'cancelled':
        array.sort(function(a, b) {
          const A = a['stats']['cancelled'], B = b['stats']['cancelled'];
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        break;

      case 'cancelled_buyer':
        array.sort(function(a, b) {
          const A = a['stats']['cancelled_buyer'], B = b['stats']['cancelled_buyer'];
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        break;

      case 'cancelled_seller':
        array.sort(function(a, b) {
          const A = a['stats']['cancelled_seller'], B = b['stats']['cancelled_seller'];
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        break;

      default:
        this.currentCriterion = 'fulfilled';
        array.sort(function(a, b) {
          const A = a['stats']['fulfilled'], B = b['stats']['fulfilled'];
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        break;
    }
  }
}
