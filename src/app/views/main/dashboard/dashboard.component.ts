declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { BrandService } from 'src/app/services/brand.service';
import { ProductService } from 'src/app/services/product.service';
import { LocationService } from 'src/app/services/location.service';
import { StoreTypeService } from 'src/app/services/store-type.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { AreaService } from 'src/app/services/area.service';
import { LocationAreaService } from 'src/app/services/location-area.service';
import { ManagerService } from 'src/app/services/manager.service';
import { ManufacturerPartyService } from 'src/app/services/manufacturer-party.service';
import { BuyerService } from 'src/app/services/buyer.service';
import { SellerService } from 'src/app/services/seller.service';
import { SalesOfficerService } from 'src/app/services/sales-officer.service';
import { PromotionService } from 'src/app/services/promotion.service';
import { TaskService } from 'src/app/services/task.service';
import { EarningService } from 'src/app/services/earning.service';
import { CodeService } from 'src/app/services/code.service';
import { FeeService } from 'src/app/services/fee.service';
import { CacheService, LineChartData, AccountManagerLineChartData } from 'src/app/services/cache.service';
import { StatsService } from 'src/app/services/stats.service';
import { Status } from 'src/app/interfaces/status';
import { Insight } from 'src/app/interfaces/insight';
import { InsightService } from 'src/app/services/insight.service';
import { ToastrService } from 'ngx-toastr';
import { SurveyService } from 'src/app/services/survey.service';
import { FeedService } from 'src/app/services/feed.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  title: any;
  manufacturers = 0;
  brands = 0;
  storeTypes = 0;
  products = 0;
  locations = 0;
  user_group: any;
  areas = 0;
  locationAreas = 0;
  managers = 0;
  manufacturerStaff = 0;
  buyers = 0;
  sellers = 0;
  salesManagers = 0;
  salesReps = 0;
  promotions = 0;
  tasks = 0;
  earnings = 0;
  codes = 0;
  fees = 0;
  surveys = 0;
  information = 0;
  manufacturer_id: any;
  seller_id: any;
  manager_id: any;

  orderData: any;
  orderLabels: any;
  chartOptions: any = {
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: '#fff'
        },
        ticks: {
          display: true,
          // this will remove only the label
          callback: function (label) {
            if (label) {
              // const labeldate = new Date(label)
              // // return label;
              // // console.log(labeldate)
              // // console.log(labeldate.getDay())
              // if (labeldate.getDay() === 1) {
              //   console.log(labeldate.toDateString())
              //   return labeldate.toDateString()
              // }
              return label;
            }
          },
        }
      }],
      yAxes: [{
        gridLines: {
          color: '#fff',
        },
        ticks: {
          beginAtZero: true,
          callback: function (label) {
            // when the floored value is the same as the value we have a whole number
            if (Math.floor(label) === label) {
              return label;
            }

          },
        }
      }]
    }
  };
  chartType = 'line';
  chartColors: Array<any>;
  statistics: Array<LineChartData>;
  statisticsAccountManager: Array<AccountManagerLineChartData>;

  mode: any;
  modes: any;
  statuses: Array<Status>;
  insights: Array<any>;
  types: Array<any>;
  targets: Array<{ name: string, value: string }>;
  frequencies: Array<{ name: string, value: string }>;
  levels: Array<{ name: string, value: string }>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  default: any;
  create: Insight = { 'ago': 'select', 'status': 'select', 'level': 'select', 'target': 'select', 'title': '', 'type': 'select' };
  edit: Insight = { 'ago': 'select', 'status': 'select', 'level': 'select', 'target': 'select', 'title': '', 'type': 'select' };
  currentInsight: any;

  parent: string;
  parent_id: string;
  level: string;

  constructor(title: Title, private manufacturer: ManufacturerService, private brand: BrandService, private store: StoreTypeService,
    private product: ProductService, private location: LocationService, private data: DataHandlerService, private area: AreaService,
    private locationArea: LocationAreaService, private manager: ManagerService, private party: ManufacturerPartyService,
    private buyer: BuyerService, private seller: SellerService, private salesOfficer: SalesOfficerService, private feeService: FeeService,
    private promotion: PromotionService, private task: TaskService, private earning: EarningService, private codeService: CodeService,
    private cache: CacheService, private stats: StatsService, private insightService: InsightService, private toastr: ToastrService,
    private surveyService: SurveyService, private feedService: FeedService) {
    this.title = 'Welcome, ' + data.getUserData().name;

    title.setTitle('Suplias - Dashboard');
    this.user_group = data.getUserData().group;

    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.statuses = [
      { name: 'Active', value: 'active' },
      { name: 'Inactive', value: 'inactive' },
    ];

    this.frequencies = [
      { name: 'Daily', value: '86400' },
      { name: 'Weekly', value: '604800' },
      { name: 'Monthly', value: '2592000' },
      { name: 'Yearly', value: '31557600' }
    ];
    this.chartColors = [{
      backgroundColor: 'rgba(60, 83, 235, 0.2)',
      borderColor: 'rgba(60, 83, 235, 1)',
      borderWidth: 1
    }
    ];
  }

  ngOnInit() {
    this.subscribeToCache();
    this.preloadDropdowns();
    switch (this.user_group) {
      case 'admin':
        this.parent = 'administrator';
        this.parent_id = this.data.getUserData()._id;
        this.level = 'application';
        this.fetchInsights('admin');
        // this.adminStats();
        break;
      case 'manufacturer_staff':
        this.parent = 'manufacturer';
        this.parent_id = JSON.parse(this.data.getUserData().manufacturer)._id;
        this.manufacturer_id = JSON.parse(this.data.getUserData().manufacturer)._id;
        this.level = 'manufacturer';
        this.manufacturerStaffStats();
        this.fetchInsights();
        break;
      case 'sales':
        this.parent = 'seller';
        this.parent_id = this.data.getUserData().seller_id;
        this.seller_id = this.data.getUserData().seller_id;
        this.level = 'seller';
        this.salesStats();
        this.fetchInsights();
        break;
      case 'manager':
        this.parent = 'seller';
        this.parent_id = this.data.getUserData()._id;
        this.manager_id = this.data.getUserData()._id;
        this.level = 'seller';
        this.managerStats();
        this.fetchInsights('manager');
        break;
      default:
        break;
    }
  }

  toggleDelta(e: any, _id: string) {
    console.log(e.srcElement.value);
    this.stats.switchDelta(_id, e.srcElement.value, this.statistics, this.data.decryptAlt(localStorage.getItem('d3f4')),
      this.data.decryptAlt(localStorage.getItem('d3l4')));
  }

  toggleDeltaAccountManager(e: any, _id: string) {
    console.log(e.srcElement.value);
    this.stats.switchDeltaAccountManager(_id, e.srcElement.value, this.statisticsAccountManager,
      this.data.decryptAlt(localStorage.getItem('d3f4')), this.data.decryptAlt(localStorage.getItem('d3l4')));
  }

  subscribeToCache() {
    this.cache.areas.subscribe((value) => {
      if (value !== null) {
        this.areas = value.length;
      } else {
        this.areas = 0;
      }
    });
    this.cache.stats.subscribe((value) => {
      this.statistics = value;
    });
    this.cache.accountManagerStats.subscribe((value) => {
      this.statisticsAccountManager = value;
    });
    this.cache.dash_brands.subscribe((value) => {
      this.brands = value;
    });
    this.cache.dash_buyers.subscribe((value) => {
      this.buyers = value;
    });
    this.cache.dash_codes.subscribe((value) => {
      this.codes = value;
    });
    this.cache.dash_earnings.subscribe((value) => {
      this.earnings = value;
    });
    this.cache.dash_fees.subscribe((value) => {
      this.fees = value;
    });
    this.cache.dash_locationAreas.subscribe((value) => {
      this.locationAreas = value;
    });
    this.cache.dash_locations.subscribe((value) => {
      this.locations = value;
    });
    this.cache.dash_managers.subscribe((value) => {
      this.managers = value;
    });
    this.cache.dash_manufacturerStaff.subscribe((value) => {
      this.manufacturerStaff = value;
    });
    this.cache.dash_manufacturers.subscribe((value) => {
      this.manufacturers = value;
    });
    this.cache.dash_products.subscribe((value) => {
      this.products = value;
    });
    this.cache.dash_promotions.subscribe((value) => {
      this.promotions = value;
    });
    this.cache.dash_salesManagers.subscribe((value) => {
      this.salesManagers = value;
    });
    this.cache.dash_salesReps.subscribe((value) => {
      this.salesReps = value;
    });
    this.cache.dash_sellers.subscribe((value) => {
      this.sellers = value;
    });
    this.cache.dash_storeTypes.subscribe((value) => {
      this.storeTypes = value;
    });
    this.cache.dash_tasks.subscribe((value) => {
      this.tasks = value;
    });
    this.cache.dash_surveys.subscribe((value) => {
      this.surveys = value;
    });
    this.cache.dash_information.subscribe((value) => {
      this.information = value;
    });
  }

  adminStats() {
    this.manufacturer.fetchLite().then((manufacturer: any) => {
      this.cache.dash_manufacturers.next(manufacturer.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.brand.fetchLite().then((brand: any) => {
      this.cache.dash_brands.next(brand.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.store.fetch().then((categories: any) => {
      this.cache.dash_storeTypes.next(categories.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.product.fetchLite().then((products: any) => {
      this.cache.dash_products.next(products.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.location.fetchAll().then((locations: any) => {
      this.cache.dash_locations.next(locations.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.manager.fetch().then((managers: any) => {
      this.cache.dash_managers.next(managers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.buyer.fetchBuyers().then((buyers: any) => {
      this.cache.dash_buyers.next(buyers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.party.fetch().then((parties: any) => {
      this.cache.dash_manufacturerStaff.next(parties.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.seller.fetch().then((sellers: Array<any>) => {
      this.cache.dash_sellers.next(sellers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.salesOfficer.fetch('manager').then((salesManagers: any) => {
      this.cache.dash_salesManagers.next(salesManagers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.salesOfficer.fetch('rep').then((salesReps: any) => {
      this.cache.dash_salesReps.next(salesReps.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.brand.fetchLite().then((brands: any) => {
      this.cache.dash_brands.next(brands.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.earning.fetchAll().then((earnings: any) => {
      this.cache.dash_earnings.next(earnings.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });

    this.feeService.fetchLite().then((fees: any) => {
      this.cache.dash_fees.next(fees.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  manufacturerStaffStats() {
    this.area.fetchAll(this.manufacturer_id);
    this.locationArea.fetchByManufacturer(this.manufacturer_id).then((lAreas: Array<any>) => {
      this.cache.dash_locationAreas.next(lAreas.length);
    });
    this.brand.fetchLiteByManufacturer(this.manufacturer_id).then((brands: Array<any>) => {
      console.log(brands);
      this.cache.dash_brands.next(brands.length);
    });
    this.product.fetchByManufacturerLite(this.manufacturer_id).then((products: Array<any>) => {
      this.cache.dash_products.next(products.length);
    });
    this.seller.fetchByManufacturer(this.manufacturer_id).then((sellers: Array<any>) => {
      this.cache.dash_sellers.next(sellers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
    this.promotion.fetchByManufacturerLite(this.manufacturer_id).then((promotions: any) => {
      this.cache.dash_promotions.next(promotions.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
    this.task.fetchByManufacturerLite(this.manufacturer_id).then((tasks: any) => {
      this.cache.dash_tasks.next(tasks.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
    this.surveyService.fetchLite(this.manufacturer_id).then((surveys: any) => {
      this.cache.dash_surveys.next(surveys.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
    this.feedService.fetchLite(this.manufacturer_id).then((feed: any) => {
      this.cache.dash_information.next(feed.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  salesStats() {
    const seller_area_id = this.data.getUserData().seller_area_id;
    this.codeService.fetchAll(this.seller_id).then((codes: Array<any>) => {
      this.cache.dash_codes.next(codes.length);
    });
    this.salesOfficer.fetchBySeller(this.seller_id, seller_area_id, 'rep').then((salesReps: any) => {
      this.cache.dash_salesReps.next(salesReps.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  managerStats() {
    this.seller.fetchByManagerLite(this.manager_id).then((sellers: any) => {
      this.cache.dash_sellers.next(sellers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
    this.salesOfficer.fetchByManager(this.manager_id, 'manager').then((managers: any) => {
      this.cache.dash_salesManagers.next(managers.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
    this.salesOfficer.fetchByManager(this.manager_id, 'rep').then((reps: any) => {
      this.cache.dash_salesReps.next(reps.length);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  setMode(index: number) {
    this.mode = this.modes[index];
  }

  resetForms(index: number) {
    this.create = { 'ago': 'select', 'status': 'select', 'level': 'select', 'target': 'select', 'title': '', 'type': 'select' };
    this.edit = { 'ago': 'select', 'status': 'select', 'level': 'select', 'target': 'select', 'title': '', 'type': 'select' };
    this.currentInsight = this.default;
    this.mode = this.modes[index];
  }

  spawnDelete(id) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.insightService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchInsights('admin');
          this.toastr.success('Insight deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(insight) {
    this.edit.title = insight.title;
    this.edit.ago = String(insight.ago);
    this.edit.status = insight.status;
    this.edit.level = insight.level;
    this.edit.target = insight.target;
    this.edit.type = insight.type;
    this.edit.title = insight.title;
    this.currentInsight = insight;
    this.fetchTags({ srcElement: { value: insight.target } }, insight.level);
    this.setMode(2);
  }

  checkValid(obj: Insight) {
    const [ago, status, level, target, title, type] = [obj.ago, obj.status, obj.level, obj.target, obj.title, obj.type];

    if (ago !== 'select' && status !== 'select' && level !== '' && target !== 'select' && title !== ''
      && type !== 'select') {
      return true;
    }
    return false;
  }

  closeCreate(index: number) {
    this.resetForms(index);
  }

  closeEdit(index: number) {
    this.resetForms(index);
  }

  createAction() {
    const create = this.create;
    const [ago, status, level, target, title, type] =
      [create.ago, create.status, create.level, create.target, create.title, create.type];
    this.insightService.create(title, type, level, target, Number(ago), status).then(() => {
      this.fetchInsights('admin');
      this.closeCreate(0);
      this.toastr.success('Insight created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentInsight.title = this.edit.title;
    this.currentInsight.ago = Number(this.edit.ago);
    this.currentInsight.status = this.edit.status;
    this.currentInsight.level = this.edit.level;
    this.currentInsight.target = this.edit.target;
    this.currentInsight.type = this.edit.type;
    this.currentInsight.title = this.edit.title;
    this.insightService.edit(this.currentInsight).then(() => {
      this.fetchInsights('admin');
      this.closeEdit(0);
      this.toastr.success('Insight edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  preloadDropdowns() {
    this.targets = [];
    this.levels = [];
    this.insightService.fetchTags('*', '*').then((data: any) => {
      data.target.map((s) => {
        const _name = s.split('');
        _name[0] = _name[0].toUpperCase();
        const name = _name.join('');
        this.targets.push({ name, value: s });
      });
      this.targets.sort(function (a, b) {
        const A = a.name, B = b.name;
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });

      data.level.map((s) => {
        const _name = s.split('');
        _name[0] = _name[0].toUpperCase();
        const name = _name.join('');
        this.levels.push({ name, value: s });
      });
      this.levels.sort(function (a, b) {
        const A = a.name, B = b.name;
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.insights;
    if (this.sortOption !== 'none') {
      searchPool = this.sorted;
    }

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.title && q) {
        if (v.title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.insights;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.insights.filter((item) => {
          return item.status === 'active';
        }).sort(function (a, b) {
          const A = a.title, B = b.title;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.insights.filter((item) => {
          return item.status === 'inactive';
        }).sort(function (a, b) {
          const A = a.title, B = b.title;
          if (A > B) {
            return -1;
          }
          if (A < B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.insights;
        break;
    }
  }

  fetchInsights(flag?: string) {
    if (flag) {
      if (flag === 'admin') {
        this.stats.getInsightsAdmin(this.parent, this.level, this.parent_id).then(() => { }).catch((error) => {
          this.toastr.error(error.message);
        });
      }

      if (flag === 'manager') {
        this.stats.getInsightsAccountManager(this.parent, this.level, this.manager_id).then(() => { }).catch((error) => {
          this.toastr.error(error.message);
        });
      }
    } else {
      this.stats.getInsights(this.parent, this.level, this.parent_id).then(() => { }).catch((error) => {
        this.toastr.error(error.message);
      });
    }
  }

  fetchFrequency(_value: number) {
    const value = String(_value);
    return this.frequencies.find(item => {
      return item.value === value;
    }).name;
  }

  fetchTarget(value: string) {
    return this.targets.find(item => {
      return item.value === value;
    }).name;
  }

  fetchType(value: string) {
    return this.types.find(item => {
      return item.value === value;
    }).name;
  }

  fetchTags(e: any, level: string) {
    if (e.srcElement.value && e.srcElement.value !== 'select' && level !== 'select') {
      this.insightService.fetchTags(e.srcElement.value, level).then((data: any) => {
        this.types = data.type;
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  fetchTags1(e: any, target: string) {
    if (e.srcElement.value && e.srcElement.value !== 'select' && target !== 'select') {
      this.insightService.fetchTags(target, e.srcElement.value).then((data: any) => {
        this.types = data.type;
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  sentenceCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  checkNumber(num: number) {
    return num !== NaN;
  }
}
