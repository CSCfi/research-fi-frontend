//  This file is part of the research.fi API service
//
//  Copyright 2022 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { OrcidAccoungLinkingService } from './orcid-account-linking.service';

// Mock OidcSecurityService
export class OidcSecurityServiceMock {
}

describe('OrcidAccoungLinkingService', () => {
  let service: OrcidAccoungLinkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: OidcSecurityService, useClass: OidcSecurityServiceMock },
        OrcidAccoungLinkingService
      ]
    });
    service = TestBed.inject(OrcidAccoungLinkingService);
  });

  it('should be created', () => {
    expect(OrcidAccoungLinkingService).toBeTruthy();
  });

  it('getNonce() should return different random string every time', () => {
    const randomString1 = service.getNonce();
    const randomString2 = service.getNonce();
    const randomString3 = service.getNonce();
    expect(randomString1).not.toEqual(randomString2);
    expect(randomString1).not.toEqual(randomString3);
    expect(randomString2).not.toEqual(randomString3);
  });

  it('getUrl() should return correct URL', () => {
    const keycloakUrl = 'https://mykeycloak.com';
    const clientId = 'myclientid';
    const redirectUrl = 'https://myRedirectUrl';
    const nonce = 'myNonce';
    const hash = 'myHash';

    const actualUrl = service.getUrl(keycloakUrl, clientId, redirectUrl, nonce, hash);
    const expectedUrl = 'https://mykeycloak.com/broker/orcid/link?client_id=myclientid&redirect_uri=https%3A%2F%2FmyRedirectUrl&nonce=myNonce&hash=myHash';

    expect(actualUrl).toEqual(expectedUrl);
  });
});