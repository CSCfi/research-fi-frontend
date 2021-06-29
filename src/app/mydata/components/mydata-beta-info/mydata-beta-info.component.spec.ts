import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MydataBetaInfoComponent } from './mydata-beta-info.component';

describe('MydataBetaInfoComponent', () => {
  let component: MydataBetaInfoComponent;
  let fixture: ComponentFixture<MydataBetaInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MydataBetaInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MydataBetaInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
