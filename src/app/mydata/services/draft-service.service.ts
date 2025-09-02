import { Injectable } from '@angular/core';
import { PublicationsService } from '@mydata/services/publications.service';

@Injectable({
  providedIn: 'root'
})
export class DraftServiceService {

  orcidData: any;
  profileData: any;
  orcid: string;

  constructor(
    private publicationsService: PublicationsService,
  ) { }

  setOrcidProfile(orcidProfile){
    this.orcidData = orcidProfile;
    this.orcid = orcidProfile.orcid;
  }
}
