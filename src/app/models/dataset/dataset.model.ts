// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { LanguageCheck } from '../utils';
import { FieldOfScience, FieldOfScienceAdapter } from '../publication/field-of-science.model';

export interface OrganizationActor {
  name: string;
  id: string;
  actors: Actor[];
  roles: string[];
}

export interface Actor {
  name: string;
  roles: string[];
}


export class Dataset {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public year: string,
    public type: string,
    public authors: OrganizationActor[],
    public creators: string,
    public project: string,
    public fieldsOfScience: string,
    public lang: string,
    public availability: string,
    public license: string,
    public keywords: string,
    public coverage: string,
    public dataCatalog: string,
    public openAccess: boolean,
    public doi: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class DatasetAdapter implements Adapter<Dataset> {
  constructor(private lang: LanguageCheck, private fs: FieldOfScienceAdapter) {}
  adapt(item: any): Dataset {
    const keywords = item.keywords ? item.keywords.map((x) => x.keyword) : [];

    let fieldsOfScience: FieldOfScience[] = [];
    // All items don't have field_of_science field
    item.fieldsOfScience
      ? item.fieldsOfScience.forEach((field) =>
          fieldsOfScience.push(this.fs.adapt(field))
        )
      : (fieldsOfScience = []);

    // Only include fields with id
    fieldsOfScience = fieldsOfScience.filter((x) => x.id);
    // Create string from array
    const fieldsOfScienceString = fieldsOfScience.map((x) => x.name).join('; ');

    const temporalCoverage = item.temporalCoverageStart === item.temporalCoverageEnd ? '' + item.temporalCoverageStart : item.temporalCoverageStart + ' - ' + item.temporalCoverageEnd;

    const orgs: OrganizationActor[] = [];

    item.actor?.forEach(actorRole => {
      const role: string = this.lang.testLang('actorRoleName', actorRole);
      actorRole.sector.forEach(sector => {
        sector.organization.forEach(org => {
          const orgName = this.lang.testLang('OrganizationName', org).trim();
          // Create or find the organization object to be added and referenced later
          const orgExists = orgs.find(x => x.name === orgName)
          const orgObj: OrganizationActor = orgExists ? orgExists : {name: orgName, id: org.organizationId, actors: [], roles: []};
          // Push if new org
          if (!orgExists) {
            orgs.push(orgObj);
          }
          // Add role if org has no children
          if(!org.organizationUnit) {
            orgObj.roles.push(role);
          }
          org?.organizationUnit?.forEach(orgUnit => {
            // Check if subunit is "valid"
            if (orgUnit.OrgUnitId !== '-1' && orgUnit.OrgUnitId !== ' ') {
              orgObj.actors.push({name: this.lang.testLang('organizationUnitName', orgUnit), roles: [role]});
            }
            orgUnit?.person?.forEach(person => {
              orgObj.actors.push({name: person.authorFullName, roles: [role]});
            })
          })
        })
      })
    });

    // Combine actors with multiple roles
    orgs.forEach(org => {
      const unique = [];
      org.actors.forEach(actor => {
        if (!unique.includes(actor.name)) {
          unique.push(actor.name);
        } else {
          const actorObj = org.actors.find(a => a.name === actor.name);
          actorObj.roles.push(...actor.roles);
        }
      });
      org.actors = org.actors.slice(0, unique.length);
    })

    // Sort by organization name
    let orgsSorted = orgs.sort((a, b) => (+(a.name > b.name) - 0.5));
    // Move empty org to the end
    if (!orgsSorted[0]?.name.trim()) {
      orgsSorted.push(...orgsSorted.splice(0, 1));
    }

    return new Dataset(
      item.identifier,
      this.lang.testLang('name', item),
      this.lang.testLang('description', item),
      item.datasetCreated,
      'tyyppi - test',
      orgsSorted,
      item.creatorsText,
      'projekti - test',
      fieldsOfScienceString,
      'kieli - test',
      this.lang.translateAccessType(item.accessType),
      this.lang.testLang('licenseName', item),
      keywords.join(', '),
      temporalCoverage,
      this.lang.testLang('name', item?.dataCatalog[0]),
      item.accessType === 'open',
      Math.random() > 0.5 ? 'test' : undefined // DOI test
    );
  }
}
