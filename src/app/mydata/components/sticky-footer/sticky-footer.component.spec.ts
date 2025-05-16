import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyFooterComponent } from './sticky-footer.component';

describe('StickyFooterComponent', () => {
  let component: StickyFooterComponent;
  let fixture: ComponentFixture<StickyFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
