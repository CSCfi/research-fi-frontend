// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ModelUtilsService } from '@shared/services/model-util.service';
import {
  PersonActivitiesAndRewards,
  PersonActivitiesAndRewardsAdapter,
} from './person-activities-awards.model';
import {
  PersonAffiliations,
  PersonAffiliationAdapter,
} from './person-affiliation.model';
import { PersonContact, PersonContactAdapter } from './person-contact.model';
import { PersonDataset, PersonDatasetAdapter } from './person-dataset.model';
import { PersonFunding, PersonFundingAdapter } from './person-funding.model';
import {
  PersonPublication,
  PersonPublicationAdapter,
} from './person-publication.model';
import sanitizeHtml from 'sanitize-html';

type Education = { degree: string; organization: string };

export class Person {
  constructor(
    public id: string,
    public orcid: string,
    public name: string,
    public contact: PersonContact,
    public affiliations: PersonAffiliations,
    public educations: Education[],
    public publications: PersonPublication[],
    public datasets: PersonDataset[],
    public fundings: PersonFunding[],
    public activityAndAwards: PersonActivitiesAndRewards[],
    public description: string,
    public fieldsOfScience: string,
    public keywords: string,
    public collaboration: string[],
    public uniqueDataSources: any,
    public orcidLink?: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonAdapter implements Adapter<Person> {
  constructor(
    private utils: ModelUtilsService,
    private affiliationAdapter: PersonAffiliationAdapter,
    private contactAdapter: PersonContactAdapter,
    private publicationAdapter: PersonPublicationAdapter,
    private datasetAdapter: PersonDatasetAdapter,
    private fundingAdapter: PersonFundingAdapter,
    private activitiesAndRewardsAdapter: PersonActivitiesAndRewardsAdapter,
    @Inject(LOCALE_ID) protected localeId: string
  ) {}
  adapt(data: any): Person {
    const capitalizeFirstLetter = (str: string) => {
      // Check if the string is null, undefined, or empty
      if (!str || str.length === 0) {
        return '';
      }

      return str[0].toUpperCase() + str.slice(1);
    };

    const names = data.personal.names[0];

    // Capitalize first letter of each name
    const fullName = `${capitalizeFirstLetter(
      names.lastName
    )}, ${names.firstNames
      .split(' ')
      .map((name) => capitalizeFirstLetter(name)).join(' ')}`;

    const contact = this.contactAdapter.adapt(data.personal);

    const affiliations = this.affiliationAdapter.adapt(
      data.activity.affiliations
    );

    let collaboration: string[] = [];

    if (data?.cooperation) {
      data.cooperation.forEach(item => {
        collaboration.push(this.utils.checkTranslation(
          'name',
          item
        ));
      })
    }

    const educations = data.activity.educations.map((item) => ({
      organization: item.degreeGrantingInstitutionName,
      degree: this.utils.checkTranslation('name', item),
      sources: this.utils.mapSources(item.dataSources),
      dateRange: this.utils.getDateRange(item.startDate, item.endDate),
    }));

    const publications = data.activity.publications.map((publication) =>
      this.publicationAdapter.adapt(publication)
    );

    // Sort datasets by year
    let datasetsSorted = data.activity.researchDatasets.sort((a, b) => {
      return b.datasetCreated - a.datasetCreated;
    });
    const datasets = datasetsSorted.map((dataset) =>
      this.datasetAdapter.adapt(dataset)
    );

    // Sort funding decisions by year
    let fundingsSorted = data.activity.fundingDecisions.sort((a, b) => {
      const endYearDiff = b.fundingEndYear - a.fundingEndYear;
      const startYearDiff = b.fundingStartYear - a.fundingStartYear;
      if (endYearDiff !== 0) {
        return endYearDiff;
      } else
        return startYearDiff;
    });

    let fundings = fundingsSorted.map((funding) => {
        return this.fundingAdapter.adapt(funding);
      }
    );

    const activityAndAwards = data.activity.activitiesAndRewards.map(
      (activity) => this.activitiesAndRewardsAdapter.adapt(activity)
    );

    // Some descriptions might hold HTML tags. These should be stripped
    const description = this.utils.checkTranslation(
      'researchDescription',
      data.personal.researcherDescriptions[0]
    );

    const fieldsOfScience = 'Placeholder';

    const keywords = data.personal.keywords
      .map((keyword) => keyword.value)
      .join(', ');

    const uniqueDataSources = data.uniqueDataSources
      ?.map((item) => this.utils.checkTranslation('name', item.organization))
      .join(', ');

    return new Person(
      data.id,
      data.id, // ORCID indicator for dev puposes
      fullName,
      contact,
      affiliations,
      educations,
      publications,
      datasets,
      fundings,
      activityAndAwards,
      sanitizeHtml(description, {
        allowedTags: [],
        allowedAttributes: {},
      }),
      fieldsOfScience,
      keywords,
      collaboration,
      uniqueDataSources
    );
  }
}
