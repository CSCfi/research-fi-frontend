import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '@mydata/services/profile.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit {
  profileData: any;
  testData: any;
  orcid: string;

  collaborationOptions = [
    { label: 'Olen kiinnostunut tiedotusvälineiden yhteydenotoista', id: 0 },
    {
      label:
        'Olen kiinnostunut yhteistyöstä muiden tutkijoiden ja tutkimusryhmien kanssa',
      id: 1,
    },
    { label: 'Olen kiinnostunut yhteistyöstä yritysten kanssa', id: 2 },
    {
      label:
        'Olen kiinnostunut toimimaan tieteellisten julkaisujen vertaisarvioiana',
      id: 3,
    },
  ];

  constructor(
    private profileService: ProfileService,
    public oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(take(1)).subscribe((data) => {
      this.orcid = data.orcid;
    });

    this.profileService
      .getProfileData()
      .pipe(take(1))
      .subscribe((data) => {
        this.profileData = data;
        console.log(data);
      });
  }

  deleteProfile() {
    this.profileService
      .deleteProfile()
      .pipe(take(1))
      .subscribe((data) => {
        console.log(data);
        this.router.navigate(['/mydata']);
      });
  }
}
