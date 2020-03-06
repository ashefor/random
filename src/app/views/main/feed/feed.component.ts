declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { Feed } from 'src/app/interfaces/feed';
import { Title } from '@angular/platform-browser';
import { FeedService } from 'src/app/services/feed.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { ManufacturerService } from 'src/app/services/manufacturer.service';
import { Observable, of } from 'rxjs';

const DAY = 86400, WEEK = 604800, MONTH = 2592000, YEAR = 31104000;

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  manufacturers: any[];
  manufacturerId: string;
  statuses: Array<Status>;
  feed: Array<any>;
  durationTypes: Array<any> = ['days', 'weeks', 'months', 'years'];

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  sortOption1: any;
  query = '';

  p = 1;

  create: Feed;
  edit: Feed;
  currentFeed: any;
  modeWatch: Observable<number>;

  constructor(title: Title, private feedService: FeedService, data: DataHandlerService, private cache: CacheService,
    private toastr: ToastrService, private manufacturer: ManufacturerService) {
    this.title = 'Information';
    title.setTitle('Suplias - Information');
    this.modes = ['view', 'add', 'edit'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    try {
      this.manufacturerId = JSON.parse(data.getUserData().manufacturer)._id;
    } catch (e) { }

    this.create = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
    manufacturerId: 'select' };
    this.edit = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
    manufacturerId: 'select' };

    if (this.manufacturerId) {
      this.create = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId };
      this.edit = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId };
    }
  }

  ngOnInit() {
    this.cache.feed.subscribe((value) => {
      this.sorted = value;
      this.feed = value;
    });
    this.fetchManufacturers();
    this.fetchFeed();
  }

  setMode(index: number) {
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
        this.feedService.delete(id).then(() => {
          this.resetForms(0);
          this.fetchFeed();
          this.toastr.success('Feed item deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  spawnEdit(feed) {
    this.edit.title = feed.title;
    this.edit.manufacturerId = feed.manufacturer_id;
    this.edit.status = feed.status;
    this.edit.description = feed.description;
    this.edit.durationQty = this.computeDurationProps(feed.ttl).qty;
    this.edit.durationType = this.computeDurationProps(feed.ttl).type;
    this.editSrc = feed.image;
    this.editImage = null;
    this.currentFeed = feed;
    this.setMode(2);
  }

  checkValid(obj: Feed) {
    const [desc, durationQty, durationType, manufacturerId, status, title] =
      [obj.description, obj.durationQty, obj.durationType, obj.manufacturerId, obj.status, obj.title];

    return (desc !== '' && durationType !== 'select' && durationQty !== 0 && manufacturerId !== '' &&
      status !== 'select' && title !== '');
  }

  closeCreate(index: number) {
    this.resetForms(index);
  }

  closeEdit(index: number) {
    this.resetForms(index);
  }

  removeImage(type) {
    (<HTMLInputElement>document.getElementById('files')).value = '';
    if (type === 'create') {
      this.createImage = null;
      this.createSrc = null;
    }
    if (type === 'edit') {
      this.editImage = null;
      this.editSrc = null;
    }
  }

  createAction() {
    const create = this.create;
    const [desc, manufacturerId, status, title, ttl] =
      [create.description, create.manufacturerId, create.status, create.title, this.computeTTL(create.durationType, create.durationQty)];

    this.feedService.create(title, desc, ttl, status, manufacturerId, this.createImage)
      .then(() => {
        this.fetchFeed();
        this.closeCreate(0);
        this.toastr.success('Feed item created');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  editAction() {
    this.currentFeed.title = this.edit.title;
    this.currentFeed.status = this.edit.status;
    this.currentFeed.manufacturer_id = this.edit.manufacturerId;
    this.currentFeed.description = this.edit.description;
    this.currentFeed.ttl = this.computeTTL(this.edit.durationType, this.edit.durationQty);

    this.feedService.edit(this.currentFeed, this.editImage).then(() => {
      this.fetchFeed();
      this.closeEdit(0);
      this.toastr.success('Feed item edited');
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.feed ;
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
        if ( v.title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  preview(e) {
    console.log(e);
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error('Only images are supported');
      return;
    }

    const reader = new FileReader();

    switch (this.mode) {
      case this.modes[1]:
        this.createImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.createSrc = reader.result;
            }
          };
        };
        break;

      case this.modes[2]:
        this.editImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.editSrc = reader.result;
            }
          };
        };
        break;
      default:
        break;
    }
  }

  fetchFeed() {
    this.feedService.fetchAll(this.manufacturerId).then(() => { }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  resetForms(index: number) {
    this.create = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
    manufacturerId: 'select' };
    this.createImage = null;
    this.createSrc = null;
    this.edit = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
    manufacturerId: 'select' };
    this.editImage = null;
    this.editSrc = null;
    this.currentFeed = null;
    if (this.manufacturerId) {
      this.create = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId };
      this.edit = { title: '', description: '', durationQty: 0, durationType: this.durationTypes[0], status: 'select',
      manufacturerId: this.manufacturerId };
    }
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.feed;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.feed.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
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
        this.sorted = this.feed.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
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
        this.sorted = this.feed;
        break;
    }
  }

  uploadFile() {
    const fileInput = document.getElementById('files');
    fileInput.click();
  }

  computeTTL(durationType: string, durationQty: number) {
    let ttl = 0;
    switch (durationType) {
      case 'days':
        ttl = DAY * durationQty;
        break;
      case 'weeks':
        ttl = WEEK * durationQty;
        break;
      case 'months':
        ttl = MONTH * durationQty;
        break;
      case 'years':
        ttl = YEAR * durationQty;
        break;
      default:
        break;
    }
    return ttl;
  }

  computeDurationProps(ttl: number) {
    const duration = { qty: 0, type: '' };
    if (Number.isInteger(ttl / YEAR) === true) {
      duration['qty'] = (ttl / YEAR);
      duration['type'] = 'years';
    } else if (Number.isInteger(ttl / MONTH) === true) {
      duration['qty'] = (ttl / MONTH);
      duration['type'] = 'months';
    } else if (Number.isInteger(ttl / WEEK) === true) {
      duration['qty'] = (ttl / WEEK);
      duration['type'] = 'weeks';
    } else if (Number.isInteger(ttl / DAY) === true) {
      duration['qty'] = (ttl / DAY);
      duration['type'] = 'days';
    }
    return duration;
  }

  fetchManufacturers() {
    this.manufacturer.fetchLite().then((manufacturers: any[]) => {
      this.manufacturers = manufacturers.sort(function(a, b) {
        const A = a.name.toLowerCase(), B = b.name.toLowerCase();
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

  showImage(img_id: string) {
    const image = document.getElementById(img_id);
    image.click();
  }

  sortByManufacturer(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.feed;
        this.sortOption1 = 'none';
        break;

      default:
        this.sorted = this.feed.filter((item) => {
          return item.manufacturer_id === val;
        }).sort(function(a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = val;
        break;
    }
  }
}
