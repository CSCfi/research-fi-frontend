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
    private fundingAdapter: FundingAdapter,
    private datasetAdapter: DatasetAdapter,
    private organizationAdapter: OrganizationAdapter,
    private infrastructureAdapter: InfrastructureAdapter,
    private fundingCallAdapter: FundingCallAdapter,
  ) {}
  adapt(item: any, tab?: string): Search {
    const publications: Publication[] = [];
    const fundings: Funding[] = [];
    const datasets: Dataset[] = [];
    const infrastructures: Infrastructure[] = [];
    const organizations: Organization[] = [];
    const fundingCalls: FundingCall[] = [];

    switch (tab) {
      case 'publications':
        item.hits.hits.forEach((e) =>
          publications.push(this.publicationAdapter.adapt(e._source))
        );
        break;
      case 'fundings':
        item.hits.hits.forEach((e) =>
          fundings.push(this.fundingAdapter.adapt(e._source))
        );
        break;
      case 'datasets':
        item.hits.hits.forEach((e) =>
          datasets.push(this.datasetAdapter.adapt(e._source))
        );
        break;
      case 'infrastructures':
        item.hits.hits.forEach((e) =>
          infrastructures.push(this.infrastructureAdapter.adapt(e._source))
        );
        break;
      case 'organizations':
        item.hits.hits.forEach((e) =>
          organizations.push(this.organizationAdapter.adapt(e._source))
        );
        break;
      case 'funding-calls':
        item.hits.hits.forEach((e) =>
          fundingCalls.push(this.fundingCallAdapter.adapt(e._source))
        );
        break;
    }

    return new Search(
      item.hits.total.value,
      publications,
      fundings,
      datasets,
      infrastructures,
      organizations,
      fundingCalls
    );
  }
}
