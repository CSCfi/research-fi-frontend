import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrcidAccoungLinkingService } from '@mydata/services/orcid-account-linking.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orcid-login',
  templateUrl: './orcid-login.component.html',
  styleUrls: ['./orcid-login.component.scss'],
})
export class OrcidLoginComponent implements OnInit, OnDestroy {
  profileName: string;
  userDataSub: Subscription;
  orcidLink: string;

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private orcidAccountLinkingService: OrcidAccoungLinkingService,
    @Inject(DOCUMENT) private document: any,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userDataSub = this.oidcSecurityService.userData$.subscribe((data) => {
      if (data.userData) {
        const userData = data.userData;
        this.profileName = userData?.name;

        // Redirect to profile view if ORCID is already linked
        if (userData.orcid) {
          this.router.navigate(['/mydata/profile']);
        }
      }
    });
  }

  async getOrcidLink() {
    this.orcidLink = await this.orcidAccountLinkingService.getOrcidLink();
  }

  loginOrcid() {
    this.getOrcidLink().then(() => {
      if (this.orcidLink) {
        this.document.location.href = this.orcidLink;
      } else {
        console.error('Unable to get ORCID link');
      }
    });
  }

  ngOnDestroy(): void {
    this.userDataSub?.unsubscribe();
  }
}
