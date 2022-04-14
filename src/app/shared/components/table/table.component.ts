import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  tableHeaders = [{ label: 'Nimi' }, { label: 'Organisaatio' }];

  @Input() columns: { label: string }[];
  @Input() rows: any[];
  @Input() icon: any;

  constructor() {}

  ngOnInit(): void {}
}
