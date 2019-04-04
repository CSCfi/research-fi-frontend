import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  status = false;
  value = '';
  onEnter(value: string) { this.value = value; }

  constructor() {
  }

  ngOnInit() {

  }

  increaseEvent() {
    this.status = !this.status;
  }
}
