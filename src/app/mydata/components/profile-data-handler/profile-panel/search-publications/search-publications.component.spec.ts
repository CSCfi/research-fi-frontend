import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPublicationsComponent } from './search-publications.component';

describe('SearchPublicationsComponent', () => {
  let component: SearchPublicationsComponent;
  let fixture: ComponentFixture<SearchPublicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPublicationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPublicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
