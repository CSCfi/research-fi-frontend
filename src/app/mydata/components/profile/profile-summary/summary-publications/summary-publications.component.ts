import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-publications',
  templateUrl: './summary-publications.component.html',
})
export class SummaryPublicationsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;

  sortedItems: any[];

  publicationDisplayCount = 3;

  constructor() {}

  ngOnInit(): void {
    this.sortPublications(this.data);
  }

  sortPublications(data) {
    const groupItems = data.groupItems;

    groupItems.map(
      (groupItem) =>
        (groupItem.items = groupItem.items.map((item) => ({
          ...item,
          source: groupItem.source,
        })))
    );

    const items = [...groupItems].flatMap((groupItem) => groupItem.items);

    this.sortedItems = items.sort(
      (a, b) => b.publicationYear - a.publicationYear
    );

    console.log(this.sortedItems);
  }

  showAllPublications() {
    this.publicationDisplayCount = this.sortedItems.length;
  }
}
