import { TestBed } from '@angular/core/testing';

import { PublicationsService } from './publications.service';

describe('PublicationsService', () => {
  let service: PublicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
