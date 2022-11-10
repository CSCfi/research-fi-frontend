// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ModelUtils } from '../utils';
import {
  PersonAffiliations,
  PersonAffiliationAdapter,
} from './person-affiliation.model';
import { PersonContact, PersonContactAdapter } from './person-contact.model';
import { PersonDataset, PersonDatasetAdapter } from './person-dataset.model';
import {
  PersonPublication,
  PersonPublicationAdapter,
} from './person-publication.model';

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
    public description: string,
    public fieldsOfScience: string,
    public keywords: string,
    public uniqueDataSources: any
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonAdapter implements Adapter<Person> {
  constructor(
    private utils: ModelUtils,
    private affiliationAdapter: PersonAffiliationAdapter,
    private contactAdapter: PersonContactAdapter,
    private publicationAdapter: PersonPublicationAdapter,
    private datasetAdapter: PersonDatasetAdapter,
    @Inject(LOCALE_ID) protected localeId: string
  ) {}
  adapt(data: any): Person {
    const capitalizeFirstLetter = (str: string) =>
      str[0].toUpperCase() + str.slice(1);

    const names = data.personal.names[0];

    // Capitalize first letter of each name
    const fullName = `${capitalizeFirstLetter(
      names.lastName
    )}, ${names.firstNames
      .split(' ')
      .map((name) => capitalizeFirstLetter(name))}`;

    const contact = this.contactAdapter.adapt(data.personal);

    const affiliations = this.affiliationAdapter.adapt(
      data.activity.affiliations
    );

    const educations = data.activity.educations.map((item) => ({
      organization: item.degreeGrantingInstitutionName,
      degree: this.utils.checkTranslation('name', item),
      sources: this.utils.mapSources(item.dataSources),
    }));

    const publications = data.activity.publications.map((publication) =>
      this.publicationAdapter.adapt(publication)
    );

    const datasets = data.activity.researchDatasets.map((dataset) =>
      this.datasetAdapter.adapt(dataset)
    );

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
      description,
      fieldsOfScience,
      keywords,
      uniqueDataSources
    );
  }
}
