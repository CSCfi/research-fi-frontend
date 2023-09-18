import { TestBed } from '@angular/core/testing';

import { PublicationsResolver } from './publications-resolver.service';

describe('PublicationResolver', () => {
  let resolver: PublicationsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(PublicationsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
