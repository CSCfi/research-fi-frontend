import { TestBed } from '@angular/core/testing';

import { Publication2Service } from './publication2.service';

describe('Publication2Service', () => {
  let service: Publication2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Publication2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
