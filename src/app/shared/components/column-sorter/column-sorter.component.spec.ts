import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSorterComponent } from './column-sorter.component';

describe('ColumnSorterComponent', () => {
  let component: ColumnSorterComponent;
  let fixture: ComponentFixture<ColumnSorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnSorterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnSorterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
