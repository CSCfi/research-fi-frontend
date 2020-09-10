import { TestBed } from '@angular/core/testing';

import { PublicationFilterService } from './publication-filter.service';

describe('PublicationFilterService', () => {
  let service: PublicationFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
