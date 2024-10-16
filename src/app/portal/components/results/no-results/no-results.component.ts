import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-no-results',
    templateUrl: './no-results.component.html',
    standalone: true,
    imports: [RouterLink],
})
export class NoResultsComponent implements OnInit {
  @Input() heading: string;

  constructor() {}

  ngOnInit(): void {}
}
