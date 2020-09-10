import { TestBed } from '@angular/core/testing';

import { OrganizationFilterService } from './organization-filter.service';

describe('OrganizationFilterService', () => {
  let service: OrganizationFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
