import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralBadgeComponent } from './general-badge.component';

describe('GeneralBadgeComponent', () => {
  let component: GeneralBadgeComponent;
  let fixture: ComponentFixture<GeneralBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
