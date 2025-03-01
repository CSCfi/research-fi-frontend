// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { PersonalFieldsAdapter } from './personal.model';
import { DescriptionFieldsAdapter } from './description.model';
import { AffiliationFieldsAdapter } from './affiliation.model';
import { EducationFieldsAdapter } from './education.model';
import { PublicationFieldsAdapter } from './publication.model';
import { DatasetFieldsAdapter } from './dataset.model';
import { FundingFieldsAdapter } from './funding.model';
import { ActivitiesAndRewardsAdapter } from './activities-rewards.model';
import { GroupTypes } from '@mydata/constants/groupTypes';

export class Profile {
  constructor(public profileData: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class ProfileAdapter implements Adapter<Profile> {
  constructor(
    private personalFieldsAdapter: PersonalFieldsAdapter,
    private descriptionFieldsAdapter: DescriptionFieldsAdapter,
    private affiliationFieldsAdapter: AffiliationFieldsAdapter,
    private educationFieldsAdapter: EducationFieldsAdapter,
    private publicationFieldsAdapter: PublicationFieldsAdapter,
    private datasetFieldsAdapter: DatasetFieldsAdapter,
    private fundingFieldsAdapter: FundingFieldsAdapter,
    private activitiesAndRewardsAdapter: ActivitiesAndRewardsAdapter
  ) {}

  adapt(item: any): Profile {
    const data = item.data;

    const mapModel = (adapter, data) => Object.values(adapter.adapt(data));

    return new Profile([
      {
        id: GroupTypes.contact,
        label: $localize`:@@contactInfo:Yhteystiedot`,
        fields: mapModel(this.personalFieldsAdapter, data.personal),
      },
      {
        id: GroupTypes.description,
        label: $localize`:@@descriptionOfResearch:Tutkimustoiminnan kuvaus`,
        fields: mapModel(this.descriptionFieldsAdapter, data.personal),
      },
      {
        id: GroupTypes.affiliation,
        label: $localize`:@@affiliations:Affiliaatiot`,
        fields: mapModel(this.affiliationFieldsAdapter, data.activity),
      },
      {
        id: GroupTypes.education,
        label: $localize`:@@education:Koulutus`,
        fields: mapModel(this.educationFieldsAdapter, data.activity),
      },
      {
        id: GroupTypes.publication,
        label: $localize`:@@publications:Julkaisut`,
        fields: mapModel(this.publicationFieldsAdapter, data.activity),
      },
      {
        id: GroupTypes.dataset,
        label: $localize`:@@researchData:Tutkimusaineistot`,
        fields: mapModel(this.datasetFieldsAdapter, data.activity),
      },
      {
        id: GroupTypes.funding,
        label: $localize`:@@fundings:Myönnetty rahoitus`,
        fields: mapModel(this.fundingFieldsAdapter, data.activity),
      },
      {
        id: GroupTypes.activitiesAndRewards,
        label: $localize`:@@activitiesAndAwards:Aktiviteetit ja palkinnot`,
        fields: mapModel(this.activitiesAndRewardsAdapter, data.activity),
      },
    ]);
  }

  adaptMany(item: any): Profile[] {
    const entries: Profile[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
