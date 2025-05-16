import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MydataSideNavigationComponent } from './mydata-side-navigation.component';

describe('MydataSideNavigationComponent', () => {
  let component: MydataSideNavigationComponent;
  let fixture: ComponentFixture<MydataSideNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MydataSideNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MydataSideNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
