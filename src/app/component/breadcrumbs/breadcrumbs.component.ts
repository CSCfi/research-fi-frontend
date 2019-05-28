import { Component, OnInit } from '@angular/core';
import { Router, RouterStateSnapshot , ActivatedRouteSnapshot, ActivatedRoute, RouterState, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  url: any;
  breadcrumbs: string[] = [];

  constructor( router: Router, private route: ActivatedRoute ) {
    this.url = this.route.url;

    const bc = this.breadcrumbs;
    router.events.subscribe((evt) => {
    if (evt instanceof NavigationEnd) {
      const url = evt.url;
      if (url === '' || url === '/') {
        bc.length = 0;
      } else {
        bc.push(evt.url.substr(1));
      }
    }
    });
  }

  ngOnInit() {
  }

}
