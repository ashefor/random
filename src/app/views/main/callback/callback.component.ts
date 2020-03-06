import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private ngZone: NgZone) { }

  ngOnInit() {
    setTimeout(() => {
      this.reroute();
    }, 5000);
  }

  reroute() {
    const group = this.route.snapshot.paramMap.get('group');
    switch (group) {
      case 'admin':
        this.ngZone.run(() => this.router.navigate(['admin/dashboard']));
        break;

      default:
        break;
    }
  }

}
