import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TertiaryButtonComponent } from './tertiary-button.component';

describe('TertiaryButtonComponent', () => {
  let component: TertiaryButtonComponent;
  let fixture: ComponentFixture<TertiaryButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TertiaryButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TertiaryButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
