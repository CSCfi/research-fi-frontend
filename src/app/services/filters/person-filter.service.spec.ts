import { TestBed } from '@angular/core/testing';

import { PersonFilterService } from './person-filter.service';

describe('PersonFilterService', () => {
  let service: PersonFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
