//  This file is part of the research.fi API service
//
//  Copyright 2022 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root',
})

/*
 * OrcidAccoungLinkingService implements functionality related to ORCID account linking in Keycloak.
 * https://wjw465150.gitbooks.io/keycloak-documentation/content/server_development/topics/identity-brokering/account-linking.html
 */
export class OrcidAccoungLinkingService {
  orcidLink: string;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    @Inject(DOCUMENT) private document: any
  ) {}

  /*
   * Get nonce, a random string.
   */
  getNonce() {
    var randomString = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 64; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return randomString;
  }

  /*
   * Conver array buffer to base64 encoding.
   */
  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /*
   * Get hash. For more explanation, see comments of function getOrcidLink()
   */
  async getHash(nonce, sessionState, clientId) {
    const input = nonce + sessionState + clientId + 'orcid';
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const sha256 = await crypto.subtle.digest('SHA-256', data);

    // Remove padding equal characters and replace characters according to base64url specifications.
    return this.arrayBufferToBase64(sha256)
      .replace(/\//g, '_')
      .replace(/=+$/, '')
      .replace(/\+/g, '-');
  }

  /*
   * Get URL
   * Construct URL in form of:
   * {auth-server-root}/auth/realms/{realm}/broker/{provider}/link?client_id={id}&redirect_uri={uri}&nonce={nonce}&hash={hash}
   */
  getUrl(keycloakUrl, clientId, redirectUrl, nonce, hash) {
    return (
      keycloakUrl +
      '/broker/orcid/link?client_id=' +
      clientId +
      '&redirect_uri=' +
      encodeURIComponent(redirectUrl) +
      '&nonce=' +
      nonce +
      '&hash=' +
      hash
    );
  }

  /*
   * Get link, which triggers ORCID account linking in Keycloak.
   * https://wjw465150.gitbooks.io/keycloak-documentation/content/server_development/topics/identity-brokering/account-linking.html
   *
   * "To initiate the login, the application must fabricate a URL and redirect the user’s browser to this URL. The URL looks like this:
   * {auth-server-root}/auth/realms/{realm}/broker/{provider}/link?client_id={id}&redirect_uri={uri}&nonce={nonce}&hash={hash}
   *   provider:
   *       This is the provider alias of the external IDP that you defined in the Identity Provider section of the admin console.
   *   client_id:
   *       This is the OIDC client id of your application.
   *   redirect_uri:
   *       This is the application callback URL you want to redirect to after the account link is established.
   *   nonce:
   *       This is a random string that your application must generate
   *   hash:
   *       This is a Base64 URL encoded hash.
   *       This hash is generated by Base64 URL encoding a SHA_256 hash of nonce + session_state (from token) + azp (from token) + provider
   *       Basically you are hashing the random nonce, the user session id, the client id, and the identity provider alias you want to access.
   */
  async getOrcidLink() {
    // Auth configuration
    const authConfig = this.oidcSecurityService.configuration as any;

    // Get ID token
    const idTokenPayload = this.oidcSecurityService.getPayloadFromIdToken();

    // Keycloak base URL
    const keycloakUrl = authConfig.authority;

    // Redirect URL
    const redirectUrl =
      this.document.location.origin + '/mydata/service-deployment?step=4';

    // Get property clientId from property 'azp' in ID token.
    // azp: Authorized party - the party to which the ID Token was issued
    const clientId = idTokenPayload.azp;

    // Get property 'session_state' from ID token.
    const sessionState = idTokenPayload.session_state;

    // Get nonce
    const nonce = this.getNonce();

    // Get hash
    const hash = await this.getHash(nonce, sessionState, clientId);

    // Return ORCID account linking URL
    return this.getUrl(keycloakUrl, clientId, redirectUrl, nonce, hash);
  }
}
