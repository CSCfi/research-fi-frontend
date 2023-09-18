import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Publications2Component } from './publications2.component';

describe('Publications2Component', () => {
  let component: Publications2Component;
  let fixture: ComponentFixture<Publications2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Publications2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Publications2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
