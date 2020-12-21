import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLibraryComponent } from './ui-library.component';

describe('UiLibraryComponent', () => {
  let component: UiLibraryComponent;
  let fixture: ComponentFixture<UiLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UiLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
