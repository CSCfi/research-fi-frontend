import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcidDataHandlerComponent } from './orcid-data-handler.component';

describe('OrcidDataHandlerComponent', () => {
  let component: OrcidDataHandlerComponent;
  let fixture: ComponentFixture<OrcidDataHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrcidDataHandlerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcidDataHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
