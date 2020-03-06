declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { DataHandlerService } from 'src/app/services/data.service';
import { Status } from 'src/app/interfaces/status';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CacheService } from 'src/app/services/cache.service';
import { Observable, of } from 'rxjs';
import { SellerArea } from 'src/app/interfaces/seller-area';
import { SellerAreaService } from 'src/app/services/seller-area.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seller-area',
  templateUrl: './seller-area.component.html',
  styleUrls: ['./seller-area.component.css']
})
export class SellerAreaComponent implements OnInit {
  title: any;
  modes: any[];
  mode: any;
  statuses: Status[];
  sellerAreas: any[];

  areas: any[];
  seller: any;

  sorted: any[];
  queryArray: any[];
  sortOption: any;
  query = '';

  public create: SellerArea;
  public edit: SellerArea;

  currentSellerArea: any;
  p = 1;

  modeWatch: Observable<number>;

  seller_id: string;

  user_group: string;

  constructor(private _title: Title, private SAService: SellerAreaService, private cache: CacheService,
    private toastr: ToastrService, route: ActivatedRoute, private DS: DataHandlerService) {
      this.seller_id = route.snapshot.paramMap.get('id');
      this.user_group = this.DS.getUserData().group;

      this.modes = ['view', 'add', 'edit'];
      this.statuses = [
        { name: 'Active', value: 'active'},
        { name: 'Inactive', value: 'inactive'},
      ];
    }

  ngOnInit() {
    this.setMode(0);

    const distributors: any[] = this.cache.distributors.value;
    if (distributors) {
      const distributor = distributors.find(_distributor => _distributor._id === this.seller_id);
      if (distributor) {
        this._title.setTitle(`Suplias - ${distributor.name} Areas`);
        this.title = `${distributor.name} Areas`;
      } else {
        this._title.setTitle('Suplias - Distributor Areas');
        this.title = 'Distributor Areas';
      }
    } else {
      this._title.setTitle('Suplias - Distributor Areas');
      this.title = 'Distributor Areas';
    }

    this.fetchSellerData();
  }

  setMode(index) {
    this.modeWatch = of(index);
    this.mode = this.modes[index];
  }

  fetchSellerData() {
    Promise.all([this.SAService.fetchAll(this.seller_id), this.SAService.fetchSeller(this.seller_id)])
    .then((values: any[]) => {
      const sellerAreas: any[] = values[0];
      const fetchSeller = values[1];
      this.seller = fetchSeller.seller;
      this.areas = fetchSeller.areas;

      sellerAreas.map((SA) => {
        SA.area = this.areas.find((area) => area._id === SA.area_id).name;
      });

      this.sellerAreas = sellerAreas.sort(function(a, b) {
        const A = a.area.toLowerCase(), B = b.area.toLowerCase();
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
      this.sorted = this.sellerAreas;

      this._title.setTitle(`Suplias - ${this.seller.name} Areas`);
      this.title = `${this.seller.name} Areas`;

      this.create = { phone: '', area_id: 'select', manufacturer_id: this.seller.manufacturer_id, seller_id: this.seller_id,
        status: 'select' };
      this.edit = { phone: '', area_id: 'select', manufacturer_id: this.seller.manufacturer_id, seller_id: this.seller_id,
      status: 'select' };

      console.log([this.seller, this.areas, this.sellerAreas]);
    })
    .catch(error => this.toastr.error(error.message));
  }

  fetchSellerAreas() {
    this.SAService.fetchAll(this.seller_id).then((sellerAreas: any[]) => {
      sellerAreas.map((SA) => {
        SA.area = this.areas.find((area) => area._id === SA.area_id).name;
      });

      this.sellerAreas = sellerAreas.sort(function(a, b) {
        const A = a.area.toLowerCase(), B = b.area.toLowerCase();
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
      this.sorted = this.sellerAreas;
    })
    .catch(error => this.toastr.error(error.message));
  }

  resetForms(index: number) {
    this.create = { phone: '', area_id: 'select', manufacturer_id: this.seller.manufacturer_id, seller_id: this.seller_id,
      status: 'select' };
    this.edit = { phone: '', area_id: 'select', manufacturer_id: this.seller.manufacturer_id, seller_id: this.seller_id,
    status: 'select' };
    this.currentSellerArea = null;
    this.setMode(index);
  }

  spawnDelete(id) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.SAService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchSellerAreas();
          this.toastr.success('Seller area deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(sellerArea) {
    this.edit.phone = sellerArea.phone;
    this.edit.status = sellerArea.status;
    this.edit.area_id = sellerArea.area_id;
    this.currentSellerArea = sellerArea;
    this.setMode(2);
  }

  checkValid(obj: SellerArea) {
    const [aID, mID, phone, sID, status] = [obj.area_id, obj.manufacturer_id, obj.phone, obj.seller_id, obj.status];
    return (aID !== 'select' && mID !== '' && phone !== '' && sID !== '' && status !== 'select');
  }

  createAction() {
    const obj = this.create;
    const [aID, mID, phone, sID, status] = [obj.area_id, obj.manufacturer_id, obj.phone, obj.seller_id, obj.status];
    this.SAService.create(phone, status, mID, sID, aID).then(() => {
      this.fetchSellerAreas();
      this.resetForms(0);
      this.toastr.success('Seller area created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentSellerArea.phone = this.edit.phone;
    this.currentSellerArea.area_id = this.edit.area_id;
    this.currentSellerArea.status = this.edit.status;

    this.SAService.edit(this.currentSellerArea).then(() => {
      this.fetchSellerAreas();
      this.resetForms(0);
      this.toastr.success('Seller area edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.sellerAreas;
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
      if (v.area && q) {
        if ( v.area.toLowerCase().indexOf(q.toLowerCase()) > -1) {
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
        this.sorted = this.sellerAreas;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.sellerAreas.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.sellerAreas.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.name.toLowerCase(), B = b.name.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.sellerAreas;
        break;
    }
  }

  validatePhone(phone) {
    if (this.phoneToString(phone).length === 11) {
      return true;
    }
    return false;
  }

  phoneToString(phone) {
    return String(phone);
  }
}
