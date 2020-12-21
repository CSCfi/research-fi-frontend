import { TestBed } from '@angular/core/testing';

import { UiLibraryService } from './ui-library.service';

describe('UiLibraryService', () => {
  let service: UiLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
