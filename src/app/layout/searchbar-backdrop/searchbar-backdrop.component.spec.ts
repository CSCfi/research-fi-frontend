import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchbarBackdropComponent } from './searchbar-backdrop.component';

describe('SearchbarBackdropComponent', () => {
  let component: SearchbarBackdropComponent;
  let fixture: ComponentFixture<SearchbarBackdropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchbarBackdropComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchbarBackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
