import { Component, OnInit } from '@angular/core';
import { Router, RouterStateSnapshot , ActivatedRouteSnapshot, ActivatedRoute, RouterState } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  url: any;

  constructor( router: Router, private route: ActivatedRoute ) {
    this.url = this.route.url;
   }

  ngOnInit() {
  }

}
