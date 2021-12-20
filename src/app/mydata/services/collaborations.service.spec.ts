import { TestBed } from '@angular/core/testing';

import { CollaborationsService } from './collaborations.service';

describe('CollaborationsService', () => {
  let service: CollaborationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollaborationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
