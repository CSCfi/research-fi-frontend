//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SingleItemService } from './single-item.service';
import { SettingsService } from './settings.service';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { MatDialogModule } from '@angular/material/dialog';

import ResponseJsonPublications from 'src/testdata/searchresponse-publications.json';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const mockApiUrl = 'test.api.fi/';

export class AppConfigServiceMock {
  get apiUrl() {
    return mockApiUrl;
  }
}

describe('SingleItemService', () => {
  let service: SingleItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, MatDialogModule],
    providers: [
        SingleItemService,
        SettingsService,
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(SingleItemService);
  });

  it('should be created', () => {
    expect(SingleItemService).toBeTruthy();
  });

  it('should send API request and should get matching publication by id', () => {
    const searchResponseMock = ResponseJsonPublications;
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SettingsService);
    let response;

    service.getSinglePublication('0367228520').subscribe((r) => {
      response = r;
    });

    http
      .expectOne({
        url: mockApiUrl + 'publication/_search',
        method: 'POST',
      })
      .flush(searchResponseMock);

    expect(response.publications.length).toBe(1);
  });

  it('should return match_phrase query with provided id', () => {
    const field = 'field';
    const res = service.constructPayload(field, 'id');
    expect(res.query['match_phrase'][field]).toBe('id');
  });

  it('should return id as observable', () => {
    let testId: string;

    service.currentId.subscribe((id) => {
      testId = id;
    });

    service.updateId('id');

    expect(testId).toBe('id');
  });
});
