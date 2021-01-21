import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['../shared.scss'],
})
export class LogoComponent implements OnInit {
  @Input() appSlogan = '';
  constructor() {}

  ngOnInit(): void {}
}
