import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { TableCellComponent } from './table-cell/table-cell.component';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CutContentPipe } from '../../pipes/cut-content.pipe';

import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  const routeMock = {
    snapshot: { data: {} },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TableComponent, TableCellComponent, CutContentPipe,
    ],
    providers: [
        CutContentPipe,
        { provide: ActivatedRoute, useValue: routeMock },
    ],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;

    component.columns = [
      { key: 'firstCol', label: 'Label for first column', mobile: true },
      { key: 'secondCol', label: 'Label for second column', mobile: true },
    ];

    const mockRow = {
      firstCol: { label: 'Item value in first column' },
      secondCol: { label: 'Item value in second column' },
    };

    const rowsMock = [];

    for (let i = 0; i < 10; i++) {
      rowsMock.push(mockRow);
    }

    component.rows = rowsMock;

    fixture.detectChanges();
  });

  it('should create simple table with predefined columns and rows', () => {
    expect(component).toBeTruthy();

    const columnHeaders = fixture.debugElement.queryAll(
      By.css('.mat-header-cell')
    );

    const rows = fixture.debugElement.queryAll(By.css('.mat-row'));

    fixture.detectChanges();

    expect(columnHeaders.length).toEqual(2);
    expect(rows.length).toEqual(10);
  });
});
