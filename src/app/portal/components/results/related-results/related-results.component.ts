import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-related-results',
    templateUrl: './related-results.component.html',
    styleUrls: ['./related-results.component.scss'],
    standalone: true,
    imports: [RouterLink],
})
export class RelatedResultsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
