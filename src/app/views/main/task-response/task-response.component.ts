declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { TaskService } from 'src/app/services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import printJS from 'node_modules/print-js/src/index.js';
import { ToastrService } from 'ngx-toastr';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { StoreTypeService } from 'src/app/services/store-type.service';
import { LocationService } from 'src/app/services/location.service';
import { BuyerService } from 'src/app/services/buyer.service';
import { ExportXLSX } from 'src/app/utils/export-xlsx';
import { BillingService } from 'src/app/services/billing.service';
import { Observable, of } from 'rxjs';

interface IChannelSummary {
  store: string;
  responses: number;
  meta: any[];
}

interface IChart {
  chartData: any[];
  chartLabels: any[];
  chartColors: any[];
  chartOptions: any;
}

const WEEK_INTERVAL = 604800, TASK_CODE = 'TASK_REWARD';

@Component({
  selector: 'app-task-response',
  templateUrl: './task-response.component.html',
  styleUrls: ['./task-response.component.css']
})
export class TaskResponseComponent implements OnInit {
  taskId: string;
  task: any;

  title: any;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  temp: any;
  responses: Array<any>;
  baseResponses: Array<any>;
  storeTypes: Array<any>;
  locations: Array<any>;
  receivedLog: Array<any>;
  buyers: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  focusedEntry: any;

  metaData: any[] = [];

  modeWatch: Observable<number>;

  p = 1;
  p1 = 1;
  p2 = 1;
  manufacturer_id: any;

  dateRange = { startDate: null, endDate: null };
  bsConfig = { dateInputFormat: 'DD-MM-YYYY', containerClass: 'theme-dark-blue' };
  maxDate: Date;

  state: string;

  billing: any;

  //#region Charts & Graphs
    channelSummary: IChannelSummary[];
    responseSummary: IChart;
    complianceSummary: IChart;
    locationSummary: IChart;
    channelResponseSummary: IChart;
    keyAttributeTrends: IChart;
    responseTrends: IChart;
    channelAcceptance: IChart;
    locationAcceptance: IChart;
    chartOptions = {
      responsive: true,
      scales : {
        xAxes: [{
          gridLines: {
            color: '#fff'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function(value) { if (value % 1 === 0) {return value; } }
          },
          gridLines: {
            color: '#fff'
          }
        }]
      }
    };
  //#endregion

  constructor(private _title: Title, route: ActivatedRoute, private taskService: TaskService, private toastr: ToastrService,
    data: DataHandlerService, cache: CacheService, private storeService: StoreTypeService,
    private locationService: LocationService, private buyerService: BuyerService, private exportXLSX: ExportXLSX,
    router: Router, private billingService: BillingService) {
    this.taskId = route.snapshot.paramMap.get('id');
    this.modes = ['list', 'view'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Pending', value: 'pending'},
      { name: 'Approved', value: 'approved'},
      { name: 'Rejected', value: 'rejected'},
    ];
    this.manufacturer_id = JSON.parse(data.getUserData().manufacturer)._id;
    this.state = router.url.split('/')[3];
    cache.tasks.subscribe((value) => {
      if (value) {
        const task = value.find((_task) => _task._id === this.taskId);
        if (task) {
          this.title = `${task.title} ${this.state}`;
          this._title.setTitle(`Suplias - ${this.title}`);
        } else {
          this.title = `Task ${this.state}`;
          this._title.setTitle(`Suplias - ${this.title}`);
        }
      } else {
        this.title = `Task ${this.state}`;
        this._title.setTitle(`Suplias - ${this.title}`);
      }
    });
  }

  ngOnInit() {
    this.fetchTaskData();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
  }

  fetchTaskData() {
    if (this.state === 'report') {
      Promise.all([this.taskService.fetchSingleTask(this.taskId), this.taskService.fetchResponses(this.taskId, this.manufacturer_id),
        this.storeService.fetch(), this.locationService.fetchAll(), this.taskService.fetchReceivedLogs(this.taskId),
        this.buyerService.fetchBuyers()])
        .then((values: any[]) => {
        this.task = values[0][0];
        this.title = `${this.task.title} ${this.state}`;
        this._title.setTitle(`Suplias - ${this.title}`);
        values[0][0].metaData.map((meta) => {
          const _meta = {
            _id: meta._id, value: meta.value, task_id: meta.task_id, tag: meta.tag, status: meta.status, answer: null
          };
          this.metaData.push(_meta);
        });

        this.baseResponses = values[1].sort((a, b) => {
          const A = a.buyer['name'].toLowerCase(), B = b.buyer['name'].toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        console.log(values[2]);
        this.responses = this.baseResponses;
        this.sorted = this.baseResponses;
        this.sortOption = 'all';

        this.storeTypes = values[2];
        this.locations = values[3];
        this.receivedLog = values[4];
        this.buyers = values[5];
        this.getSummaries();
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
    if (this.state === 'responses') {
      Promise.all([this.taskService.fetchSingleTask(this.taskId), this.taskService.fetchResponses(this.taskId, this.manufacturer_id),
        this.billingService.fetchBillingByCode(TASK_CODE)])
        .then((values: any[]) => {
        this.task = values[0][0];
        this.title = `${this.task.title} ${this.state}`;
        this._title.setTitle(`Suplias - ${this.title}`);
        values[0][0].metaData.map((meta) => {
          const _meta = {
            _id: meta._id, value: meta.value, task_id: meta.task_id, tag: meta.tag, status: meta.status, answer: null
          };
          this.metaData.push(_meta);
        });

        this.baseResponses = values[1].sort((a, b) => {
          const A = a.buyer['name'].toLowerCase(), B = b.buyer['name'].toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.responses = this.baseResponses;
        this.sorted = this.baseResponses;
        this.sortOption = 'all';
        this.billing = values[2];
        console.log(this.billing);
      }).catch((error: any) => {
        this.toastr.error(error.message);
      });
    }
  }

  fetchResponses() {
    this.taskService.fetchResponses(this.taskId, this.manufacturer_id).then((responses: Array<any>) => {
      this.baseResponses = responses.sort((a, b) => {
        const A = a.buyer['name'].toLowerCase(), B = b.buyer['name'].toLowerCase();
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
      this.responses = this.baseResponses;
      this.sorted = this.baseResponses;
      this.sortOption = 'all';
      if (this.state === 'report') {
        this.getSummaries();
      }
    }).catch(() => {});
  }

  passVerdict(response: any, verdict: string, action: string, buyer_id: string) {
    swal(`${action} entry?`, {
      icon: 'warning',
      buttons: [true, true],
    }).then((judgement) => {
      if (judgement) {
        this.taskService.judgeResponses(response, verdict, buyer_id, this.task, this.billing).then(() => {
          this.taskService.submitResponseMetaData(this.metaData, buyer_id, this.taskId, response._id).then(() => {
            this.closeView();
            this.fetchResponses();
            this.toastr.success(`Entry ${verdict}`);
          }).catch((error: any) => {
            this.toastr.error(error.message);
          });
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  disableApprove() {
    return this.metaData.filter((meta) => (meta.answer === null || meta.answer === '') ||
      (meta.answer === false || meta.answer === 'true')).length > 0;
  }

  disableReject() {
    return this.metaData.filter((meta) => meta.answer === null || meta.answer === '').length > 0 ||
      this.metaData.filter((meta) => (meta.answer === true || meta.answer === 'true')).length === this.metaData.length;
  }

  setMode(index: number): void {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  search() {
    let searchPool = this.responses;
    if (this.sortOption !== 'all') {
      searchPool = this.sorted;
    }

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.buyer['name'] && q) {
        if ( v.buyer['name'].toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  sentenceCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.responses;
        this.sortOption = 'all';
        break;
      case 'pending':
        this.sorted = this.responses.filter((item) => {
          return item.status === 'pending';
        }).sort(function(a, b) {
          const A = b.created, B = a.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'pending';
        break;
      case 'approved':
        this.sorted = this.responses.filter((item) => {
          return item.status === 'approved';
        }).sort(function(a, b) {
          const A = b.created, B = a.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'approved';
        break;
      case 'rejected':
        this.sorted = this.responses.filter((item) => {
          return item.status === 'rejected';
        }).sort(function(a, b) {
          const A = b.created, B = a.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'rejected';
        break;

      default:
        this.sorted = this.responses;
        break;
    }
  }

  async viewEntry(response: any) {
    this.focusedEntry = response;
    this.setMode(1);
  }

  closeView() {
    this.focusedEntry = null;
    this.setMode(0);
    this.metaData.map((meta) => {
      meta.answer = '';
    });
  }

  print() {
    document.getElementById('printable').hidden = false;
    printJS({printable: 'printable', type: 'html'});
    document.getElementById('printable').hidden = true;
  }

  validate() {
    if (this.metaData.length === 0) {
      return true;
    } else {
      const incomplete = this.metaData.filter((meta) =>  meta.answer === '');
      if (incomplete.length > 0) {
        return false;
      } else {
        return true;
      }
    }
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
      this.filterResponses(this.dateRange.startDate, this.dateRange.endDate);
    }
  }

  setEndDateAndFilterResponse(date: Date) {
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
    this.filterResponses(this.dateRange.startDate, this.dateRange.endDate);
  }

  filterResponses(min: number, max: number) {
    this.responses = this.baseResponses.filter((response) => response.created >= min && response.created <= max);
    this.sort({srcElement: { value: this.sortOption }});

    if (this.state === 'report') {
      this.getSummaries();
    }
  }

  getSummaries() {
    this.getChannelSummary();
    this.getResponseSummary();
    this.getComplianceSummary();
    this.getLocationSummary();
    this.getChannelResponseSummary();
    this.getKeyAttributeTrends();
    this.getResponseTrends();
    this.getChannelAcceptance();
    this.getLocationAcceptance();
  }

  //#region Meta flags & counts
    getSummaryMetaResponseCount(summary: any, meta: any) {
      return summary.meta.find((m) => m._id === meta._id).count;
    }

    getResponseMetaFlag(mode: number, responseMetadata: any, meta: any) {
      let flag;
      if (mode === 0) {
        const metaData = responseMetadata.find((m) => m.task_metadata_id === meta._id);
        if (metaData) {
          metaData.value === 'true' ? flag = 'Y' : ( metaData.value === 'false' ? flag = 'N' : flag = '-');
        } else {
          flag = '-';
        }
        return flag;
      }

      if (mode === 1) {
        const metaData = responseMetadata.find((m) => m.task_metadata_id === meta._id);
        if (metaData) {
          metaData.value === 'true' ? flag = 'Yes' : ( metaData.value === 'false' ? flag = 'No' : flag = '-');
        } else {
          flag = '-';
        }
        return flag;
      }
    }
  //#endregion

  //#region charts
    getChannelSummary() {
      const channelSummary: Array<{ store: string, responses: number, meta: any[] }> = [];
      this.storeTypes.map((storeType) => {
        const channelResponses = this.responses.filter((response) => response.buyer.store_type_id === storeType._id);
        const metaApproved = [];
        this.task.metaData.map((meta) => {
          const metaApproval = channelResponses.filter((response) =>
            response.metaData.filter((metaData) => metaData.task_metadata_id === meta._id && metaData.value === 'true').length > 0);
          metaApproved.push({_id: meta._id, count: metaApproval.length});
        });
        channelSummary.push({ store: storeType.name, responses: channelResponses.length, meta: metaApproved });
      });
      this.channelSummary = channelSummary;
    }

    getResponseSummary() {
      const responses = [];
      this.responses.map((response) => {
        const existing = responses.find((res) => res.buyer._id === response.buyer._id);
        if (!existing) {
          responses.push(response);
        }
      });

      const received = ((this.receivedLog.length - responses.length) / this.receivedLog.length) * 100,
        responded = (responses.length / this.receivedLog.length) * 100,
        chartData = [ { data: [received.toFixed(0), responded.toFixed(0)], label: 'Response Summary'} ],
        chartLabels = ['Received', 'Responded'],
        chartColors = [
          {
            backgroundColor: ['#E74197', '#3B54EC'],
            hoverBackgroundColor: ['rgba(231, 65, 151, 0.7)', 'rgba(59, 84, 236, 0.7)'],
            borderWidth: 0,
          }
        ],
        chartOptions = { responsive: true };
      this.responseSummary = { chartData, chartLabels, chartColors, chartOptions };
    }

    getComplianceSummary() {
      const pending = this.responses.filter((response) => response.status === 'pending').length,
        rejected = this.responses.filter((response) => response.status === 'rejected').length,
        approved = this.responses.filter((response) => response.status === 'approved').length,
        pendingPercent = (pending / this.responses.length) * 100, rejectedPercent = (rejected / this.responses.length) * 100,
        approvedPercent = (approved / this.responses.length) * 100,
        chartData = [ { data: [pendingPercent.toFixed(0), rejectedPercent.toFixed(0), approvedPercent.toFixed(0)],
        label: 'Compliance Summary'} ],
        chartLabels = ['Pending', 'Rejected', 'Approved'],
        chartColors = [
        {
          backgroundColor: ['#595991', '#E74197', '#3B54EC'],
          hoverBackgroundColor: ['rgba(89, 89, 145, 0.7)', 'rgba(231, 65, 151, 0.7)', 'rgba(59, 84, 236, 0.7)'],
          borderWidth: 0,
        }
      ],
        chartOptions = { responsive: true };
      this.complianceSummary = { chartData, chartLabels, chartColors, chartOptions };
    }

    getLocationSummary() {
      const locationObjArray = [], chartLabels = [], rejectedData = [], approvedData = [], pendingData = [];

      this.locations.map((location) => {
        const locationResponses = this.responses.filter((response) => response.buyer.location_id === location._id);
        if (locationResponses.length > 0) {
          const pending = locationResponses.filter((response) => response.status === 'pending');
          const rejected = locationResponses.filter((response) => response.status === 'rejected');
          const approved = locationResponses.filter((response) => response.status === 'approved');
          const locationObj = { name: location.name, pending, rejected, approved };
          locationObjArray.push(locationObj);
        }
      });

      locationObjArray.map((obj) => {
        chartLabels.push(obj.name);
        rejectedData.push(obj.rejected.length);
        approvedData.push(obj.approved.length);
        pendingData.push(obj.pending.length);
      });

      const chartData = [
        {
          label: 'Pending',
          data: pendingData
        },
        {
          label: 'Rejected',
          data: rejectedData
        },
        {
          label: 'Approved',
          data: approvedData
        }
      ], chartColors = [
        { backgroundColor: '#595991', hoverBackgroundColor: 'rgba(89, 89, 145, 0.7)', borderWidth: 0 },
        { backgroundColor: '#E74197', hoverBackgroundColor: 'rgba(231, 65, 151, 0.7)', borderWidth: 0 },
        { backgroundColor: '#3B54EC', hoverBackgroundColor: 'rgba(59, 84, 236, 0.7)', borderWidth: 0 },
      ], chartOptions = {
        responsive: true,
        scales : {
          xAxes: [{
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'Locations'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function(value) { if (value % 1 === 0) {return value; } }
            },
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'No of responses'
            }
          }]
        }
      };

      this.locationSummary = { chartData, chartLabels, chartColors, chartOptions };
    }

    getChannelResponseSummary() {
      const storeObjArray = [], chartLabels = [], rejectedData = [], approvedData = [], pendingData = [];

      this.storeTypes.map((storeType) => {
        const storeResponses = this.responses.filter((response) => response.buyer.store_type_id === storeType._id);
        if (storeResponses.length > 0) {
          const pending = storeResponses.filter((response) => response.status === 'pending');
          const rejected = storeResponses.filter((response) => response.status === 'rejected');
          const approved = storeResponses.filter((response) => response.status === 'approved');
          const locationObj = { name: storeType.name, pending, rejected, approved };
          storeObjArray.push(locationObj);
        }
      });

      storeObjArray.map((obj) => {
        chartLabels.push(obj.name);
        rejectedData.push(obj.rejected.length);
        approvedData.push(obj.approved.length);
        pendingData.push(obj.pending.length);
      });

      const chartData = [
        {
          label: 'Pending',
          data: pendingData
        },
        {
          label: 'Rejected',
          data: rejectedData
        },
        {
          label: 'Approved',
          data: approvedData
        }
      ], chartColors = [
        { backgroundColor: '#595991', hoverBackgroundColor: 'rgba(89, 89, 145, 0.7)', borderWidth: 0 },
        { backgroundColor: '#E74197', hoverBackgroundColor: 'rgba(231, 65, 151, 0.7)', borderWidth: 0 },
        { backgroundColor: '#3B54EC', hoverBackgroundColor: 'rgba(59, 84, 236, 0.7)', borderWidth: 0 },
      ], chartOptions = {
        responsive: true,
        scales : {
          xAxes: [{
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'Channels'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function(value) { if (value % 1 === 0) {return value; } }
            },
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'No of responses'
            }
          }]
        }
      };
      this.channelResponseSummary = { chartData, chartLabels, chartColors, chartOptions };
    }

    getKeyAttributeTrends() {
      let week1, week2, week3, week4;
      const [week1Meta, week2Meta, week3Meta, week4Meta] = [[], [], [], []];
      const chartData = [];
      const chartColors = [];

      if (this.dateRange.startDate) {
        week1 = this.responses.filter((response) => response.created >= this.dateRange.startDate &&
          response.created <= (this.dateRange.startDate + WEEK_INTERVAL) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created > (this.dateRange.startDate + WEEK_INTERVAL) &&
          response.created <= (this.dateRange.startDate + (2 * WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (2 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week4 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (3 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      } else {
        const earliestResponse = this.responses.sort((a, b) => {
          const A = a.created, B = b.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        })[this.responses.length - 1];
        week4 = this.responses.filter((response) => (response.created <= earliestResponse.created &&
          response.created >= (earliestResponse.created - WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => (response.created < (earliestResponse.created - WEEK_INTERVAL) &&
          response.created >= (earliestResponse.created - (2 * WEEK_INTERVAL))) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created < (earliestResponse.created - (2 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week1 = this.responses.filter((response) => response.created < (earliestResponse.created - (3 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      }

      week1.map((week) => {
        week1Meta.push(...week.metaData.filter((meta) => meta.value.toUpperCase() === 'TRUE'));
      });
      week2.map((week) => {
        week2Meta.push(...week.metaData.filter((meta) => meta.value.toUpperCase() === 'TRUE'));
      });
      week3.map((week) => {
        week3Meta.push(...week.metaData.filter((meta) => meta.value.toUpperCase() === 'TRUE'));
      });
      week4.map((week) => {
        week4Meta.push(...week.metaData.filter((meta) => meta.value.toUpperCase() === 'TRUE'));
      });

      this.task.metaData.map((meta, i) => {
        const week1Approved = ((week1Meta.filter((meta_) => meta_.task_metadata_id === meta._id).length) / week1Meta.length) * 100 || 0;
        const week2Approved = ((week2Meta.filter((meta_) => meta_.task_metadata_id === meta._id).length) / week2Meta.length) * 100 || 0;
        const week3Approved = ((week3Meta.filter((meta_) => meta_.task_metadata_id === meta._id).length) / week3Meta.length) * 100 || 0;
        const week4Approved = ((week4Meta.filter((meta_) => meta_.task_metadata_id === meta._id).length) / week4Meta.length) * 100 || 0;

        chartData.push({ data: [Number(week1Approved.toFixed(0)), Number(week2Approved.toFixed(0)), Number(week3Approved.toFixed(0)),
          Number(week4Approved.toFixed(0))], label: `Key Attribute ${i + 1}` });
        const colors = this.getRandomBG;
        const chartColor = { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 0 };
        chartColors.push(chartColor);
      });

      const chartOptions = {
        responsive: true,
        scales : {
          xAxes: [{
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks'
            }
          }],
          yAxes: [{
            ticks: {
              callback: function(value) { if (value % 1 === 0) {return `${value}%`; } }
            },
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'No of approved responses'
            }
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function(tooltipItem, data) {
                const allData = data.datasets[tooltipItem.datasetIndex].data;
                const tooltipLabel = data.labels[tooltipItem.index];
                const tooltipData = allData[tooltipItem.index];
                return `${tooltipLabel}: ${tooltipData}%`;
              }
            }
          }
        }
      };

      const chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      this.keyAttributeTrends = { chartData, chartLabels, chartColors, chartOptions };
    }

    getResponseTrends() {
      let week1, week2, week3, week4;
      const chartData = [], chartColors = [];

      if (this.dateRange.startDate) {
        week1 = this.responses.filter((response) => response.created >= this.dateRange.startDate &&
          response.created <= (this.dateRange.startDate + WEEK_INTERVAL) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created > (this.dateRange.startDate + WEEK_INTERVAL) &&
          response.created <= (this.dateRange.startDate + (2 * WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (2 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week4 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (3 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      } else {
        const earliestResponse = this.responses.sort((a, b) => {
          const A = a.created, B = b.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        })[this.responses.length - 1];
        week4 = this.responses.filter((response) => (response.created <= earliestResponse.created &&
          response.created >= (earliestResponse.created - WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => (response.created < (earliestResponse.created - WEEK_INTERVAL) &&
          response.created >= (earliestResponse.created - (2 * WEEK_INTERVAL))) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created < (earliestResponse.created - (2 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week1 = this.responses.filter((response) => response.created < (earliestResponse.created - (3 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      }

      const w1Approved = Number(((week1.filter((w1) => w1.status === 'approved').length / week1.length) * 100).toFixed(0)) || 0,
        w2Approved = Number(((week2.filter((w2) => w2.status === 'approved').length / week2.length) * 100).toFixed(0))  || 0,
        w3Approved = Number(((week3.filter((w3) => w3.status === 'approved').length / week3.length) * 100).toFixed(0))  || 0,
        w4Approved = Number(((week4.filter((w4) => w4.status === 'approved').length / week4.length) * 100).toFixed(0))  || 0,
        w1Responded = Number(((week1.length / this.receivedLog.length) * 100).toFixed(0))  || 0,
        w2Responded = Number(((week2.length / this.receivedLog.length) * 100).toFixed(0))  || 0,
        w3Responded = Number(((week3.length / this.receivedLog.length) * 100).toFixed(0))  || 0,
        w4Responded = Number(((week4.length / this.receivedLog.length) * 100).toFixed(0))  || 0,
        received = Number(((this.receivedLog.length / this.buyers.length) * 100).toFixed(0))  || 0;

      chartData.push({ data: [ received, received, received, received ], label: 'Received' });
      let colors = this.getRandomBG, chartColor = { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 0 };
      chartColors.push(chartColor);

      chartData.push({ data: [ w1Responded, w2Responded, w3Responded, w4Responded ], label: 'Responded' });
      colors = this.getRandomBG;
      chartColor = { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 0 };
      chartColors.push(chartColor);

      chartData.push({ data: [ w1Approved, w2Approved, w3Approved, w4Approved ], label: 'Accepted' });
      colors = this.getRandomBG;
      chartColor = { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 0 };
      chartColors.push(chartColor);


      const chartOptions = {
        responsive: true,
        scales : {
          xAxes: [{
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks'
            }
          }],
          yAxes: [{
            ticks: {
              callback: function(value) { if (value % 1 === 0) {return `${value}%`; } }
            },
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'No of responses'
            }
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function(tooltipItem, data) {
                const allData = data.datasets[tooltipItem.datasetIndex].data;
                const tooltipLabel = data.labels[tooltipItem.index];
                const tooltipData = allData[tooltipItem.index];
                return `${tooltipLabel}: ${tooltipData}%`;
              }
            }
          }
        }
      };

      const chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      this.responseTrends = { chartData, chartLabels, chartColors, chartOptions };
    }

    getChannelAcceptance() {
      let week1, week2, week3, week4;
      const chartData = [], chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'], chartColors = [];

      if (this.dateRange.startDate) {
        week1 = this.responses.filter((response) => response.created >= this.dateRange.startDate &&
          response.created <= (this.dateRange.startDate + WEEK_INTERVAL) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created > (this.dateRange.startDate + WEEK_INTERVAL) &&
          response.created <= (this.dateRange.startDate + (2 * WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (2 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week4 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (3 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      } else {
        const earliestResponse = this.responses.sort((a, b) => {
          const A = a.created, B = b.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        })[this.responses.length - 1];
        week4 = this.responses.filter((response) => (response.created <= earliestResponse.created &&
          response.created >= (earliestResponse.created - WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => (response.created < (earliestResponse.created - WEEK_INTERVAL) &&
          response.created >= (earliestResponse.created - (2 * WEEK_INTERVAL))) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created < (earliestResponse.created - (2 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week1 = this.responses.filter((response) => response.created < (earliestResponse.created - (3 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      }

      this.storeTypes.map((type) => {
        const week1Res = week1.filter((wk1) => wk1.buyer.store_type_id === type._id),
          week2Res = week2.filter((wk2) => wk2.buyer.store_type_id === type._id),
          week3Res = week3.filter((wk3) => wk3.buyer.store_type_id === type._id),
          week4Res = week4.filter((wk4) => wk4.buyer.store_type_id === type._id);

        if (!(week1Res.length === 0 && week2Res.length === 0 && week3Res.length === 0 && week4Res.length === 0)) {
          console.log([week1Res, week2Res, week3Res, week4Res]);
          const week1Approved = ((week1Res.filter((wk1) => wk1.status === 'approved').length) / week1Res.length) * 100 || 0;
          const week2Approved = ((week2Res.filter((wk2) => wk2.status === 'approved').length) / week2Res.length) * 100 || 0;
          const week3Approved = ((week3Res.filter((wk3) => wk3.status === 'approved').length) / week3Res.length) * 100 || 0;
          const week4Approved = ((week4Res.filter((wk4) => wk4.status === 'approved').length) / week4Res.length) * 100 || 0;

          chartData.push({ data: [Number(week1Approved.toFixed(0)), Number(week2Approved.toFixed(0)), Number(week3Approved.toFixed(0)),
            Number(week4Approved.toFixed(0))], label: type.name });
          const colors = this.getRandomBG;
          const chartColor = { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 0 };
          chartColors.push(chartColor);
        }
      });

      const chartOptions = {
        responsive: true,
        scales : {
          xAxes: [{
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks'
            }
          }],
          yAxes: [{
            ticks: {
              callback: function(value) { if (value % 1 === 0) {return `${value}%`; } }
            },
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'No of approved responses'
            }
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function(tooltipItem, data) {
                const allData = data.datasets[tooltipItem.datasetIndex].data;
                const tooltipLabel = data.labels[tooltipItem.index];
                const tooltipData = allData[tooltipItem.index];
                return `${tooltipLabel}: ${tooltipData}%`;
              }
            }
          }
        }
      };

      this.channelAcceptance = { chartData, chartLabels, chartColors, chartOptions };
    }

    getLocationAcceptance() {
      let week1, week2, week3, week4;
      const chartData = [], chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'], chartColors = [];

      if (this.dateRange.startDate) {
        week1 = this.responses.filter((response) => response.created >= this.dateRange.startDate &&
          response.created <= (this.dateRange.startDate + WEEK_INTERVAL) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created > (this.dateRange.startDate + WEEK_INTERVAL) &&
          response.created <= (this.dateRange.startDate + (2 * WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (2 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week4 = this.responses.filter((response) => response.created > (this.dateRange.startDate + (3 * WEEK_INTERVAL)) &&
          response.created <= (this.dateRange.startDate + (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      } else {
        const earliestResponse = this.responses.sort((a, b) => {
          const A = a.created, B = b.created;
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        })[this.responses.length - 1];
        week4 = this.responses.filter((response) => (response.created <= earliestResponse.created &&
          response.created >= (earliestResponse.created - WEEK_INTERVAL)) && response.status !== 'pending');

        week3 = this.responses.filter((response) => (response.created < (earliestResponse.created - WEEK_INTERVAL) &&
          response.created >= (earliestResponse.created - (2 * WEEK_INTERVAL))) && response.status !== 'pending');

        week2 = this.responses.filter((response) => response.created < (earliestResponse.created - (2 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (3 * WEEK_INTERVAL)) && response.status !== 'pending');

        week1 = this.responses.filter((response) => response.created < (earliestResponse.created - (3 * WEEK_INTERVAL)) &&
          response.created >= (earliestResponse.created - (4 * WEEK_INTERVAL)) && response.status !== 'pending');
      }

      this.locations.map((type) => {
        const week1Res = week1.filter((wk1) => wk1.buyer.location_id === type._id),
          week2Res = week2.filter((wk2) => wk2.buyer.location_id === type._id),
          week3Res = week3.filter((wk3) => wk3.buyer.location_id === type._id),
          week4Res = week4.filter((wk4) => wk4.buyer.location_id === type._id);

        if (!(week1Res.length === 0 && week2Res.length === 0 && week3Res.length === 0 && week4Res.length === 0)) {
          console.log([week1Res, week2Res, week3Res, week4Res]);
          const week1Approved = ((week1Res.filter((wk1) => wk1.status === 'approved').length) / week1Res.length) * 100 || 0;
          const week2Approved = ((week2Res.filter((wk2) => wk2.status === 'approved').length) / week2Res.length) * 100 || 0;
          const week3Approved = ((week3Res.filter((wk3) => wk3.status === 'approved').length) / week3Res.length) * 100 || 0;
          const week4Approved = ((week4Res.filter((wk4) => wk4.status === 'approved').length) / week4Res.length) * 100 || 0;

          chartData.push({ data: [Number(week1Approved.toFixed(0)), Number(week2Approved.toFixed(0)), Number(week3Approved.toFixed(0)),
            Number(week4Approved.toFixed(0))], label: type.name });
          const colors = this.getRandomBG;
          const chartColor = { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 0 };
          chartColors.push(chartColor);
        }
      });

      const chartOptions = {
        responsive: true,
        scales : {
          xAxes: [{
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks'
            }
          }],
          yAxes: [{
            ticks: {
              callback: function(value) { if (value % 1 === 0) {return `${value}%`; } }
            },
            gridLines: {
              color: '#fff'
            },
            scaleLabel: {
              display: true,
              labelString: 'No of approved responses'
            }
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function(tooltipItem, data) {
                const allData = data.datasets[tooltipItem.datasetIndex].data;
                const tooltipLabel = data.labels[tooltipItem.index];
                const tooltipData = allData[tooltipItem.index];
                return `${tooltipLabel}: ${tooltipData}%`;
              }
            }
          }
        }
      };

      this.locationAcceptance = { chartData, chartLabels, chartColors, chartOptions };
    }
  //#endregion

  //#region Util methods
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

    get getRandomBG() {
      const [int1, int2, int3] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
      return {
        bg: `rgba(${int1}, ${int2}, ${int3}, .2)`,
        border: `rgba(${int1}, ${int2}, ${int3}, .7)`
      };
    }

    exportToXLSX(title: string, table: string) {
      const html = document.getElementById(table);
      this.exportXLSX.exportAsXLSX(html, `${this._title.getTitle()} - ${title}`);
    }
  //#endregion
}
