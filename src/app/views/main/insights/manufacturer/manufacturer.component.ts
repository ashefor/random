declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { InsightService } from 'src/app/services/insight.service';
import { ToastrService } from 'ngx-toastr';
import { Status } from 'src/app/interfaces/status';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-insight-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.css']
})
export class ManufacturerComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  level = 'manufacturer';
  parent = 'manufacturer';
  insights: Array<any>;
  frequencies: Array<{name: string, value: string}>;

  p = 1;
  p1 = 1;

  edit: { title: string, status: string } = { title: '', status: '' };
  currentInsight: any;
  instances: any[];
  instanceHead: string;
  instanceHeadID: string;
  statuses: Status[];

  modeWatch: Observable<number>;

  constructor(title: Title, private insightService: InsightService, private toastr: ToastrService) {
    this.title = 'Manufacturer Insights';
    title.setTitle('Suplias - Manufacturer Insights');
    this.modes = ['insight_list', 'edit_insight', 'instance_list'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);

    this.frequencies = [
      { name: 'Daily', value: '86400'},
      { name: 'Weekly', value: '604800'},
      { name: 'Monthly', value: '2592000'},
      { name: 'Yearly', value: '31557600'}
    ];

    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
  }

  ngOnInit() {
    this.fetchInsights();
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
    this.instances = null;
  }

  resetForms(index: number) {
    this.edit = { title: '', status: '' };
    this.mode = this.modes[index];
    this.modeWatch = of(index);
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
          this.fetchInsights();
          this.toastr.success('Insight deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(insight) {
    this.edit.title = insight.title;
    this.edit.status = insight.status;
    this.currentInsight = insight;
    this.setMode(1);
  }

  checkValid(obj: { title: string, status: string }) {
    const [title, status] = [obj.title, obj.status];

    return (title !== '' && status !== 'select');
  }

  editAction() {
    this.currentInsight.title = this.edit.title;
    this.currentInsight.status = this.edit.status;
    this.insightService.edit(this.currentInsight).then(() => {
      this.fetchInsights();
      this.closeEdit(0);
      this.toastr.success('Insight edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  closeEdit(index: number) {
    this.resetForms(index);
  }

  fetchFrequency(_value: number) {
    const value = String(_value);
    return this.frequencies.find(item => {
      return item.value === value;
    }).name;
  }

  fetchInsights() {
    this.insightService.fetchByLevel(this.level).then((insights: any[]) => {
      this.insights = insights;
    }).catch((err) => this.toastr.error(err.message));
  }

  spawnInstanceList(insight: any) {
    this.setMode(2);
    this.insightService.fetchInstances(insight._id, this.parent).then((instances: any[]) => {
      this.instanceHead = insight.title;
      this.instanceHeadID = insight._id;
      this.instances = instances;
    }).catch((err) => this.toastr.error(err.message));
  }

  toggleInstance(_id: string, status: string) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.insightService.toggleInstanceStatus(_id, status).then(() => {
          this.insightService.fetchInstances(this.instanceHeadID, this.parent).then((instances: any[]) => {
            this.instances = instances;
          }).catch((err) => this.toastr.error(err.message));
          let flag = '';
          status === 'active' ? flag = 'enabled' : flag = 'disabled';
          this.toastr.success(`Insight instance ${flag}`);
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }
}
