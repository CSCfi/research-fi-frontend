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
    private fundingFieldsAdapter: FundingFieldsAdapter
  ) {}

  adapt(item: any): Profile {
    const data = item.body.data;

    const mapModel = (adapter, data) => Object.values(adapter.adapt(data));

    let ret = new Profile([
      {
        id: GroupTypes.contact,
        label: $localize`:@@contactInfo:Yhteystiedot`,
        fields: mapModel(this.personalFieldsAdapter, data.personal),
      },
      {
        id: GroupTypes.description,
        label: $localize`:@@descriptionOfResearchActivities:Tutkimustoiminnan kuvaus`,
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
        label: $localize`:@@fundings:Hankkeet`,
        fields: mapModel(this.fundingFieldsAdapter, data.activity),
      },
      {
        id: GroupTypes.activity,
        label: $localize`:@@activitiesAndAwards:Aktiviteetit ja palkinnotHankkeet`,
        fields: [],
      },
    ]);
    return ret;
  }


  adaptNew(item: any): Profile {
    const data = item.body.data;

    const mapModel = (adapter, data) => Object.values(adapter.adapt(data));

    let ret = new Profile([
      {
        id: GroupTypes.contact,
        label: $localize`:@@contactInfo:Yhteystiedot`,
        fields: Object.values(this.personalFieldsAdapter.adaptNew(data.personal)),
      },
      {
        id: GroupTypes.description,
        label: $localize`:@@descriptionOfResearchActivities:Tutkimustoiminnan kuvaus`,
        fields: Object.values(this.descriptionFieldsAdapter.adaptNew(data.personal)),
      },
      {
        id: GroupTypes.affiliation,
        label: $localize`:@@affiliations:Affiliaatiot`,
        fields: Object.values(this.affiliationFieldsAdapter.adaptNew(data.activity)),
      },
      {
        id: GroupTypes.education,
        label: $localize`:@@education:Koulutus`,
        fields: Object.values(this.educationFieldsAdapter.adaptNew(data.activity)),
      },
      {
        id: GroupTypes.publication,
        label: $localize`:@@publications:Julkaisut`,
        fields: Object.values(this.publicationFieldsAdapter.adaptNew(data.activity)),
      },
      {
        id: GroupTypes.dataset,
        label: $localize`:@@researchData:Tutkimusaineistot`,
        fields: Object.values(this.datasetFieldsAdapter.adaptNew(data.activity)),
      },
      {
        id: GroupTypes.funding,
        label: $localize`:@@fundings:Hankkeet`,
        fields: Object.values(this.fundingFieldsAdapter.adaptNew(data.activity)),
      },
      {
        id: GroupTypes.activity,
        label: $localize`:@@activitiesAndAwards:Aktiviteetit ja palkinnot`,
        fields: [],
      },
    ]);
    return ret;
  }

  adaptMany(item: any): Profile[] {
    const entries: Profile[] = [];
    const source = item;
    source.forEach((el) => entries.push(this.adapt(el)));
    return entries;
  }
}
