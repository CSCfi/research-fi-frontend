// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtils } from '../utils';
import { omit } from 'lodash-es';

export class PersonAffiliations {
  constructor(public primary: any[], public organizations: any[]) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonAffiliationAdapter implements Adapter<PersonAffiliations> {
  constructor(private utils: ModelUtils) {}

  adapt(affiliations: any): PersonAffiliations {
    const mappedAffiliations = affiliations
      .filter(
        (affiliation) =>
          this.utils.checkTranslation('organizationName', affiliation).length
      )
      .map((affiliation) => {
        const getValue = (field: string) =>
          this.utils.checkTranslation(field, affiliation);

        const getYear = (dateField: string) =>
          (affiliation[dateField].year > 0 && affiliation[dateField].year) ||
          null;

        return {
          organizationName: getValue('organizationName'),
          positionName: getValue('positionName'),
          departmentName: getValue('departmentName'),
          yearStart: getYear('startDate'),
          yearEnd: getYear('endDate'),
          source: this.utils.mapSources(affiliation.dataSources),
        };
      });

    // Primary affiliations as placeholder until data for primary indentifier exists
    const primaryAffiliations = mappedAffiliations.map((affiliation) => ({
      organizationName: affiliation.organizationName,
      positionName: affiliation.positionName,
    }));

    // Unique organizations are used in rendering lists of affiliations by organizations
    const uniqueOrganizations = [
      ...new Set(
        mappedAffiliations.map((affiliation) => affiliation.organizationName)
      ),
    ];

    const affiliationsByOrganization = [];

    // Map affiliations for corresponding organization name
    uniqueOrganizations.forEach((organization: string) => {
      affiliationsByOrganization.push({
        name: organization,
        items: mappedAffiliations
          .filter(
            (affiliation) => affiliation.organizationName === organization
          )
          .map((affiliation) => omit(affiliation, 'organizationName')),
      });
    });

    return new PersonAffiliations(
      primaryAffiliations, // Placeholder data until primary indicator is present
      affiliationsByOrganization
    );
  }
}
