import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfraTreeComponent } from './infra-tree.component';

describe('InfraTreeComponent', () => {
  let component: InfraTreeComponent;
  let fixture: ComponentFixture<InfraTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfraTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfraTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
