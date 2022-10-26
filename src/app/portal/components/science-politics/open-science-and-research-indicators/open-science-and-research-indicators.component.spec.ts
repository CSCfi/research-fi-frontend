import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenScienceAndResearchIndicatorsComponent } from './open-science-and-research-indicators.component';

describe('OpenScienceAndResearchIndicatorsComponent', () => {
  let component: OpenScienceAndResearchIndicatorsComponent;
  let fixture: ComponentFixture<OpenScienceAndResearchIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenScienceAndResearchIndicatorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenScienceAndResearchIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
