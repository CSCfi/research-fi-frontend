import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-publications',
  templateUrl: './summary-publications.component.html',
})
export class SummaryPublicationsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypews: any;

  publicationDisplayCount = 1;

  constructor() {}

  ngOnInit(): void {
    console.log(this.data);
  }

  showAllPublications() {
    this.publicationDisplayCount = this.data.groupItems[0].items.length;
  }
}
