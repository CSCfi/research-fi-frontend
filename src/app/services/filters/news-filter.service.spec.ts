import { TestBed } from '@angular/core/testing';

import { NewsFilterService } from './news-filter.service';

describe('NewsFilterService', () => {
  let service: NewsFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
