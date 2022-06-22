import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-results',
  templateUrl: './no-results.component.html',
})
export class NoResultsComponent implements OnInit {
  @Input() heading: string;

  constructor() {}

  ngOnInit(): void {}
}
