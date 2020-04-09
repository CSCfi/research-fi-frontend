import { Component, OnInit } from '@angular/core';
import { faInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-service-info',
  templateUrl: './service-info.component.html',
  styleUrls: ['./service-info.component.scss']
})
export class ServiceInfoComponent implements OnInit {
  faInfo = faInfo;

  constructor() { }

  ngOnInit(): void {

  }

}
