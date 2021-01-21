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
import { MaterialAdapter, Material } from './material/material.model';
import { OrganizationAdapter, Organization } from './organization.model';
import {
  InfrastructureAdapter,
  Infrastructure,
} from './infrastructure/infrastructure.model';

export class Search {
  constructor(
    public total: number,
    public publications: Publication[],
    public fundings: Funding[],
    public materials: Material[],
    public infrastructures: Infrastructure[],
    public organizations: Organization[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class SearchAdapter implements Adapter<Search> {
  constructor(
    private publicationAdapter: PublicationAdapter,
    private fundingAdapter: FundingAdapter,
    private materialAdapter: MaterialAdapter,
    private organizationAdapter: OrganizationAdapter,
    private infrastructureAdapter: InfrastructureAdapter
  ) {}
  adapt(item: any, tab?: string): Search {
    const publications: Publication[] = [];
    const fundings: Funding[] = [];
    const materials: Material[] = [];
    const infrastructures: Infrastructure[] = [];
    const organizations: Organization[] = [];

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
      case 'materials':
        item.hits.hits.forEach((e) =>
          materials.push(this.materialAdapter.adapt(e._source))
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
    }

    return new Search(
      item.hits.total.value,
      publications,
      fundings,
      materials,
      infrastructures,
      organizations
    );
  }
}
