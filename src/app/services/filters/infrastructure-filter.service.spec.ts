import { TestBed } from '@angular/core/testing';

import { InfrastructureFilterService } from './infrastructure-filter.service';

describe('InfrastructureFilterService', () => {
  let service: InfrastructureFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfrastructureFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
