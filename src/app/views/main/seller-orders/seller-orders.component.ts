import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataHandlerService } from 'src/app/services/data.service';
import { OrderService } from 'src/app/services/order.service';
import * as moment from 'moment';
import { CacheService } from 'src/app/services/cache.service';
import { LedgerService } from 'src/app/services/ledger.service';
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

export interface Stats {
  orderStats: OrderStats;
  orders: any[];
  salesReps: any[];
}

@Component({
  selector: 'app-seller-orders',
  templateUrl: './seller-orders.component.html',
  styleUrls: ['./seller-orders.component.css']
})

export class SellerOrdersComponent implements OnInit {
  seller_id: string;
  seller: string;
  sellerIdFromLS: string;
  title: string;
  ranges: Array<{name: string, value: string}>;
  criteria: Array<{name: string, value: string}>;

  dayStats: Stats;
  weekStats: Stats;
  monthStats: Stats;
  yearStats: Stats;
  customRangeStats: Stats;

  currentRange = 'today';
  currentCriterion = 'fulfilled';

  filteredDayOrders: any[] = [];
  filteredWeekOrders: any[] = [];
  filteredMonthOrders: any[] = [];
  filteredYearOrders: any[] = [];
  filteredCustomRangeOrders: any[] = [];

  group: any;
  modes: string[];
  mode: any;
  details: any;

  p = 1;
  p1 = 1;
  p2 = 1;
  p3 = 1;
  p4 = 1;
  p5 = 1;


  dateRange = { startDate: null, endDate: null };
  bsConfig = { dateInputFormat: 'DD-MM-YYYY', containerClass: 'theme-dark-blue' };
  maxDate: Date;

  constructor(title: Title, private route: ActivatedRoute, data: DataHandlerService, private orderService: OrderService,
    private cache: CacheService, private ledger: LedgerService, private toastr: ToastrService) {
    this.seller_id = this.route.snapshot.paramMap.get('seller_id');
    this.seller = this.route.snapshot.paramMap.get('seller_name');
    this.sellerIdFromLS = data.getUserData().seller_id;
    this.ranges = [
      { name: 'This week', value: 'week'},
      { name: 'This month', value: 'month'},
      { name: 'This year', value: 'year'},
    ];
    this.criteria = [
      { name: 'Cancelled', value: 'cancelled'},
      { name: 'Rating', value: 'rating'},
    ];
    this.group = data.getUserData().group;
    if (!this.sellerIdFromLS) {
      this.title = `Order Stats (${this.seller})`;
      title.setTitle(`Suplias - Order Stats (${this.seller})`);
    } else {
      this.title = `Order Stats`;
      title.setTitle(`Suplias - Order Stats`);
    }
    this.modes = ['list', 'detail'];
  }

  ngOnInit() {
    this.mode = this.modes[0];
    if (this.group === 'manager') {
      this.cache.setSellerDayStats(null);
      this.cache.setSellerMonthStats(null);
      this.cache.setSellerWeekStats(null);
      this.cache.setSellerYearStats(null);
    }
    this.cache.sellerOrderDay.subscribe((value) => {
      this.dayStats = value;
    });
    this.cache.sellerOrderMonth.subscribe((value) => {
      this.monthStats = value;
    });
    this.cache.sellerOrderWeek.subscribe((value) => {
      this.weekStats = value;
    });
    this.cache.sellerOrderYear.subscribe((value) => {
      this.yearStats = value;
    });
    this.cache.sellerCustomRange.subscribe((value) => {
      this.customRangeStats = value;
    });
    const [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
    this.fetchDay(this.seller_id, min, max);

    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
  }

  refresh(flag: string) {
    let min, max;
    switch (flag) {
      case 'today':
        [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
        this.fetchDay(this.seller_id, min, max);
        break;

      case 'week':
        [min, max] = [moment.utc().startOf('week').unix(), moment.utc().endOf('week').unix()];
        this.fetchWeek(this.seller_id, min, max);
        break;

      case 'month':
        [min, max] = [moment.utc().startOf('month').unix(), moment.utc().endOf('month').unix()];
        this.fetchMonth(this.seller_id, min, max);
        break;

      case 'year':
        [min, max] = [moment.utc().startOf('year').unix(), moment.utc().endOf('year').unix()];
        this.fetchYear(this.seller_id, min, max);
        break;

      case 'custom':
        [min, max] = [this.dateRange.startDate, this.dateRange.endDate];
        this.fetchCustomRange(this.seller_id, min, max);
        break;

      default:
        [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
        this.fetchDay(this.seller_id, min, max);
        break;
    }
  }

  fetchDay(seller_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    this.orderService.fetchAllOrders(seller_id, min, max).then((orders: any) => {
      this.orderService.fetchOrderStatistics(seller_id, min, max).then((result: any) => {
        this.orderService.fetchSalesRepsStatistics(seller_id, min, max).then((report: any) => {
          const dayStats: Stats = {
            orderStats: {
              total: result['total'],
              fulfilled: result['fulfilled']['total'],
              cancelled: result['cancelled']['total'],
              cash: result['fulfilled']['cash'],
              loyalty: result['fulfilled']['loyalty'],
              cancelled_buyer: result['cancelled']['buyer'],
              cancelled_seller: result['cancelled']['seller'],
            },
            salesReps: report.sort(function(a, b) {
              const A = a.completed, B = b.completed;
              if (A > B) {
                return -1;
              }
              if (A < B) {
                return 1;
              }
              return 0;
            }),
            orders
          };
          this.filterOrders({srcElement: { value: 'completed'}}, orders, 'today');
          this.cache.setSellerDayStats(dayStats);
        }).catch((error) => {
          this.toastr.error(error.message);
        });
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchWeek(seller_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    this.orderService.fetchAllOrders(seller_id, min, max).then((orders: any) => {
      this.orderService.fetchOrderStatistics(seller_id, min, max).then((result: any) => {
        this.orderService.fetchSalesRepsStatistics(seller_id, min, max).then((report: any) => {
          const weekStats = {
            orderStats: {
              total: result['total'],
              fulfilled: result['fulfilled']['total'],
              cancelled: result['cancelled']['total'],
              cash: result['fulfilled']['cash'],
              loyalty: result['fulfilled']['loyalty'],
              cancelled_buyer: result['cancelled']['buyer'],
              cancelled_seller: result['cancelled']['seller'],
            },
            salesReps: report.sort(function(a, b) {
              const A = a.completed, B = b.completed;
              if (A > B) {
                return -1;
              }
              if (A < B) {
                return 1;
              }
              return 0;
            }),
            orders
          };
          this.filterOrders({srcElement: { value: 'completed'}}, orders, 'week');
          this.cache.setSellerWeekStats(weekStats);
        }).catch((error) => {
          this.toastr.error(error.message);
        });
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchMonth(seller_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    this.orderService.fetchAllOrders(seller_id, min, max).then((orders: any) => {
      this.orderService.fetchOrderStatistics(seller_id, min, max).then((result: any) => {
        this.orderService.fetchSalesRepsStatistics(seller_id, min, max).then((report: any) => {
          const monthStats = {
            orderStats: {
              total: result['total'],
              fulfilled: result['fulfilled']['total'],
              cancelled: result['cancelled']['total'],
              cash: result['fulfilled']['cash'],
              loyalty: result['fulfilled']['loyalty'],
              cancelled_buyer: result['cancelled']['buyer'],
              cancelled_seller: result['cancelled']['seller'],
            },
            salesReps: report.sort(function(a, b) {
              const A = a.completed, B = b.completed;
              if (A > B) {
                return -1;
              }
              if (A < B) {
                return 1;
              }
              return 0;
            }),
            orders
          };
          this.filterOrders({srcElement: { value: 'completed'}}, orders, 'month');
          this.cache.setSellerMonthStats(monthStats);
        }).catch((error) => {
          this.toastr.error(error.message);
        });
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchYear(seller_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    this.orderService.fetchAllOrders(seller_id, min, max).then((orders: any) => {
      this.orderService.fetchOrderStatistics(seller_id, min, max).then((result: any) => {
        this.orderService.fetchSalesRepsStatistics(seller_id, min, max).then((report: any) => {
          const yearStats = {
            orderStats: {
              total: result['total'],
              fulfilled: result['fulfilled']['total'],
              cancelled: result['cancelled']['total'],
              cash: result['fulfilled']['cash'],
              loyalty: result['fulfilled']['loyalty'],
              cancelled_buyer: result['cancelled']['buyer'],
              cancelled_seller: result['cancelled']['seller'],
            },
            salesReps: report.sort(function(a, b) {
              const A = a.completed, B = b.completed;
              if (A > B) {
                return -1;
              }
              if (A < B) {
                return 1;
              }
              return 0;
            }),
            orders
          };
          this.filterOrders({srcElement: { value: 'completed'}}, orders, 'year');
          this.cache.setSellerYearStats(yearStats);
        }).catch((error) => {
          this.toastr.error(error.message);
        });
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  fetchCustomRange(seller_id: string, min: number, max: number) {
    this.currentCriterion = 'fulfilled';
    this.orderService.fetchAllOrders(seller_id, min, max).then((orders: any) => {
      this.orderService.fetchOrderStatistics(seller_id, min, max).then((result: any) => {
        this.orderService.fetchSalesRepsStatistics(seller_id, min, max).then((report: any) => {
          const customRangeStats = {
            orderStats: {
              total: result['total'],
              fulfilled: result['fulfilled']['total'],
              cancelled: result['cancelled']['total'],
              cash: result['fulfilled']['cash'],
              loyalty: result['fulfilled']['loyalty'],
              cancelled_buyer: result['cancelled']['buyer'],
              cancelled_seller: result['cancelled']['seller'],
            },
            salesReps: report.sort(function(a, b) {
              const A = a.completed, B = b.completed;
              if (A > B) {
                return -1;
              }
              if (A < B) {
                return 1;
              }
              return 0;
            }),
            orders
          };
          this.filterOrders({srcElement: { value: 'completed'}}, orders, 'custom');
          this.cache.setSellerCustomRangeStats(customRangeStats);
        }).catch((error) => {
          this.toastr.error(error.message);
        });
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  sort(e) {
    const val = e.srcElement.value;

    if (val === '_custom') {
      if (this.customRangeStats) {
        this.currentRange = 'custom';
        this.customRangeStats = this.customRangeStats;
        this.customRangeStats.salesReps = this.customRangeStats.salesReps.sort(function(a, b) {
          const A = a.completed, B = b.completed;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.filterOrders({srcElement: { value: 'completed'}}, this.customRangeStats.orders, 'custom');
      }

      if (this.dateRange.startDate != null && this.dateRange.startDate != null) {
        if (this.currentRange !== 'custom') {
          this.currentRange = 'custom';
        }
        const { startDate, endDate } = this.dateRange;
        this.fetchCustomRange(this.seller_id, startDate, endDate);
      }
      return;
    }

    let min, max;

    switch (val) {
      case 'today':
        this.currentRange = 'today';
        if (this.dayStats) {
          this.dayStats = this.dayStats;
          this.dayStats.salesReps = this.dayStats.salesReps.sort(function(a, b) {
            const A = a.completed, B = b.completed;
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.filterOrders({srcElement: { value: 'completed'}}, this.dayStats.orders, 'today');
        }

        [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
        this.fetchDay(this.seller_id, min, max);
        break;

      case 'week':
        this.currentRange = 'week';
        if (this.weekStats) {
          this.weekStats = this.weekStats;
          this.weekStats.salesReps = this.weekStats.salesReps.sort(function(a, b) {
            const A = a.completed, B = b.completed;
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.filterOrders({srcElement: { value: 'completed'}}, this.weekStats.orders, 'week');
        }

        [min, max] = [moment.utc().startOf('week').unix(), moment.utc().endOf('week').unix()];
        this.fetchWeek(this.seller_id, min, max);
        break;

      case 'month':
        this.currentRange = 'month';
        if (this.monthStats) {
          this.monthStats = this.monthStats;
          this.monthStats.salesReps = this.monthStats.salesReps.sort(function(a, b) {
            const A = a.completed, B = b.completed;
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.filterOrders({srcElement: { value: 'completed'}}, this.monthStats.orders, 'month');
        }

        [min, max] = [moment.utc().startOf('month').unix(), moment.utc().endOf('month').unix()];
        this.fetchMonth(this.seller_id, min, max);
        break;

      case 'year':
        this.currentRange = 'year';
        if (this.yearStats) {
          this.yearStats = this.yearStats;
          this.yearStats.salesReps = this.yearStats.salesReps.sort(function(a, b) {
            const A = a.completed, B = b.completed;
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.filterOrders({srcElement: { value: 'completed'}}, this.yearStats.orders, 'year');
        }

        [min, max] = [moment.utc().startOf('year').unix(), moment.utc().endOf('year').unix()];
        this.fetchYear(this.seller_id, min, max);
        break;

      case 'custom':
        this.currentRange = 'custom';
        if (this.customRangeStats) {
          this.customRangeStats = this.customRangeStats;
          this.customRangeStats.salesReps = this.customRangeStats.salesReps.sort(function(a, b) {
            const A = a.completed, B = b.completed;
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.filterOrders({srcElement: { value: 'completed'}}, this.customRangeStats.orders, 'custom');
        }

        [min, max] = [this.dateRange.startDate, this.dateRange.endDate];
        this.fetchCustomRange(this.seller_id, min, max);
        break;

      default:
        this.currentRange = 'today';
        if (this.dayStats) {
          this.dayStats = this.dayStats;
          this.dayStats.salesReps = this.dayStats.salesReps.sort(function(a, b) {
            const A = a.completed, B = b.completed;
            if (A < B) {
              return -1;
            }
            if (A > B) {
              return 1;
            }
            return 0;
          });
          this.filterOrders({srcElement: { value: 'completed'}}, this.dayStats.orders, 'day');
        }

        [min, max] = [moment.utc().startOf('day').unix(), moment.utc().endOf('day').unix()];
        this.fetchDay(this.seller_id, min, max);
        break;
    }
  }

  filterOrders(e, source: any[], type: string) {
    const val = e.srcElement.value;

    const receiver = source.filter((s) => s.tag === val).sort(function(a, b) {
      const A = a.modified, B = b.modified;
      if (A > B) {
        return 1;
      }
      if (A < B) {
        return -1;
      }
      return 0;
    });

    switch (type) {
      case 'today':
        this.filteredDayOrders = receiver;
        break;

      case 'week':
        this.filteredWeekOrders = receiver;
        break;

      case 'month':
        this.filteredMonthOrders = receiver;
        break;

      case 'year':
        this.filteredYearOrders = receiver;
        break;

      case 'custom':
        this.filteredCustomRangeOrders = receiver;
        break;

      default:
        this.filteredDayOrders = receiver;
        break;
    }
  }

  filter(e, array) {
    const val = e.srcElement.value;
    this.currentCriterion = val;
    switch (val) {
      case 'fulfilled':
        array.sort(function(a, b) {
          const A = a.completed, B = b.completed;
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
          const A = a.cancelled, B = b.cancelled;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        break;

      case 'rating':
        array.sort(function(a, b) {
          const A = a.rating, B = b.rating;
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
          const A = a.completed, B = b.completed;
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

  sentenceCase(str: string) {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  viewDetail(tag: string) {
    this.mode = this.modes[1];
    this.ledger.fetchDetails(tag).then((items: any) => {
      this.details = items;
    }).catch((error) => this.toastr.error(error.message));
  }

  toList() {
    this.details = null;
    this.mode = this.modes[0];
  }

  setStartDate(date: Date) {
    if (!date) {
      this.dateRange.startDate = null;
      return;
    }
    if (this.dateRange.endDate && (date.getTime() / 1000 > this.dateRange.endDate)) {
      this.toastr.error('Start date cannot be later than end date');
      this.dateRange.startDate = null;
      return;
    }
    this.dateRange.startDate = date.getTime() / 1000;
    if (this.dateRange.endDate && (date.getTime() / 1000 <= this.dateRange.endDate)) {
      const select = document.getElementById('rangeSelect') as HTMLSelectElement;
      select.value = '_custom';
      this.currentRange = 'custom';
      this.sort({ srcElement: { value: 'custom' }});
    }
  }

  setEndDateAndFetchStats(date: Date) {
    if (!date) {
      this.dateRange.endDate = null;
      return;
    }
    if (this.dateRange.startDate && (date.getTime() / 1000 < this.dateRange.startDate)) {
      this.toastr.error('End date cannot be earlier than start date');
      this.dateRange.endDate = null;
      return;
    }
    this.dateRange.endDate = date.getTime() / 1000;
    this.currentRange = 'custom';
    const select = document.getElementById('rangeSelect') as HTMLSelectElement;
    select.value = '_custom';
    this.sort({ srcElement: { value: 'custom' }});
  }
}
