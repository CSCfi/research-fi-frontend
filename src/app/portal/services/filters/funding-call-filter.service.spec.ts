import { TestBed } from '@angular/core/testing';

import { FundingCallFilterService } from './funding-call-filter.service';

describe('FundingCallFilterService', () => {
  let service: FundingCallFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FundingCallFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
