// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import {
  Publication,
  PublicationAdapter,
} from './publication/publication.model';
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { PersonAdapter, Person } from './person/person.model';
import { FundingAdapter, Funding } from './funding/funding.model';
import { DatasetAdapter, Dataset } from './dataset/dataset.model';
import { OrganizationAdapter, Organization } from './organization.model';
import {
  InfrastructureAdapter,
  Infrastructure,
} from './infrastructure/infrastructure.model';
import { FundingCall, FundingCallAdapter } from './funding-call.model';

export class Search {
  constructor(
    public total: number,
    public publications: Publication[],
    public persons: Person[],
    public fundings: Funding[],
    public datasets: Dataset[],
    public infrastructures: Infrastructure[],
    public organizations: Organization[],
    public fundingCalls: FundingCall[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class SearchAdapter implements Adapter<Search> {
  constructor(
    private publicationAdapter: PublicationAdapter,
    private personAdapter: PersonAdapter,
    private fundingAdapter: FundingAdapter,
    private datasetAdapter: DatasetAdapter,
    private organizationAdapter: OrganizationAdapter,
    private infrastructureAdapter: InfrastructureAdapter,
    private fundingCallAdapter: FundingCallAdapter
  ) {}
  adapt(item: any, tab?: string): Search {
    const publications: Publication[] = [];
    const persons: Person[] = [];
    const fundings: Funding[] = [];
    const datasets: Dataset[] = [];
    const infrastructures: Infrastructure[] = [];
    const organizations: Organization[] = [];
    const fundingCalls: FundingCall[] = [];

    // Enables error handling when mapping data
    const adaptResults = (tab, adapter) => {
      item.hits.hits.forEach((e) => {
        try {
          tab.push(adapter.adapt(e._source));
        } catch (error) {
          console.error(error, e);
        }
      });
    };

    switch (tab) {
      case 'publications':
        adaptResults(publications, this.publicationAdapter);
        break;
      case 'persons':
        adaptResults(persons, this.personAdapter);
        break;
      case 'fundings':
        adaptResults(fundings, this.fundingAdapter);
        break;
      case 'datasets':
        adaptResults(datasets, this.datasetAdapter);
        break;
      case 'infrastructures':
        adaptResults(infrastructures, this.infrastructureAdapter);
        break;
      case 'organizations':
        adaptResults(organizations, this.organizationAdapter);
        break;
      case 'funding-calls':
        adaptResults(fundingCalls, this.fundingCallAdapter);
        break;
    }

    return new Search(
      item.hits.total.value,
      publications,
      persons,
      fundings,
      datasets,
      infrastructures,
      organizations,
      fundingCalls
    );
  }
}
