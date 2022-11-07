// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ModelUtils } from '../utils';
import {
  FieldOfScience,
  FieldOfScienceAdapter,
} from '../publication/field-of-science.model';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DatasetRelations } from '@portal/constants/dataset-constants';

export interface OrganizationActor {
  name: string;
  id: string;
  parentOrgName?: string;
  actors: Actor[];
  roles: string[];
  children?: any[];
}

export interface Actor {
  name: string;
  id?: string;
  parentOrgName?: string;
  parentOrgId?: string;
  roles: string[];
  orcid?: string;
  isPerson?: boolean;
  children?: any[];
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
    public relatedDatasets: string,
    public doi: string,
    public urn: string,
    public fairdataUrl: string,
    public datasetVersions: any[],
    public datasetRelations: any[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class DatasetAdapter implements Adapter<Dataset> {
  constructor(
    private utils: ModelUtils,
    private fs: FieldOfScienceAdapter,
    private appSettingsService: AppSettingsService
  ) {}

  private organizationActors: OrganizationActor[] = [];

  adapt(item: any): Dataset {
    const locale = this.appSettingsService.currentLocale;
    const capitalizedLocale = this.appSettingsService.capitalizedLocale;

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

    const temporalCoverage =
      item.temporalCoverageStart === item.temporalCoverageEnd
        ? '' + item.temporalCoverageStart
        : item.temporalCoverageStart + ' - ' + item.temporalCoverageEnd;

    const orgs: OrganizationActor[] = [];

    item.actor?.forEach((actorRole) => {
      this.organizationActors.push(actorRole);
      const role: string = this.utils.checkTranslation(
        'actorRoleName',
        actorRole
      );
      actorRole.sector.forEach((sector) => {
        sector.organization.forEach((org) => {
          const parentOrgName = this.utils
            .checkTranslation('OrganizationName', org)
            .trim();
          // Create or find the organization object to be added and referenced later
          const orgExists = orgs.find((x) => x.name === parentOrgName);
          const orgObj: OrganizationActor = orgExists
            ? orgExists
            : {
                name: parentOrgName,
                id: org.organizationId.trim(),
                parentOrgName: item,
                actors: [],
                roles: [],
                children: [],
              };

          // Add role if org has no children (or has an unnecessary subUnit)
          const subUnitHasName = !!(
            org?.organizationUnit
              ?.slice()
              .shift()
              .organizationUnitNameEn?.trim() ||
            org?.organizationUnit
              ?.slice()
              .shift()
              .organizationUnitNameFi?.trim() ||
            org?.organizationUnit
              ?.slice()
              .shift()
              .organizationUnitNameSv?.trim()
          );
          if (
            !org?.organizationUnit?.slice().shift().person &&
            !subUnitHasName
          ) {
            orgObj.roles.push(role);
          }

          // Parse organization sub units and possible actors
          org?.organizationUnit?.forEach((orgUnit) => {
            const nameParsed: string = this.utils.checkTranslation(
              'organizationUnitName',
              orgUnit
            );
            // Check if subunit is "valid"
            if (orgUnit.OrgUnitId !== '-1' && orgUnit.OrgUnitId !== ' ') {
              // Only add role to subUnit if no person
              const roles = [];
              if (!orgUnit.person) {
                roles.push(role);
              }
              orgObj.actors.push({
                name: nameParsed,
                roles: roles,
                parentOrgName: parentOrgName,
                children: [],
              });
            }
            orgUnit?.person?.forEach((person) => {
              orgObj.actors.push({
                name: person.authorFullName,
                roles: [role],
                orcid: person?.Orcid,
                parentOrgName: nameParsed,
                children: [],
              });
            });
          });
          // Push if new org
          if (!orgExists) {
            orgs.push(orgObj);
          }
        });
      });
    });

    // Process first level child organizations
    orgs.forEach((org) => {
      org.children = org.actors.filter(
        (a) => a.parentOrgName === org.name || a.parentOrgName === ' '
      );
      let childObjects = [];
      let childrenProcessed = [];

      // Filter out real duplicates by comparing string representation
      org.children.forEach((child) => {
        if (!childObjects.includes(JSON.stringify(child))) {
          childObjects.push(JSON.stringify(child));
          childrenProcessed.push(child);
        }
      });

      // Combine first level roles
      let authors = [];
      let index = 0;
      childrenProcessed.forEach((c) => {
        if (!authors.includes(c.name)) {
          authors.push(c.name);
        } else {
          // Is duplicate, join roles
          const firstOccurenceIndex = childrenProcessed.findIndex((item) => {
            return item.name === c.name;
          });
          childrenProcessed[firstOccurenceIndex].roles.push(
            ...childrenProcessed[index].roles
          );
          childrenProcessed[index] = '';
        }
        index += 1;
      });
      // Clear array items made empty
      childrenProcessed = childrenProcessed.filter((c) => {
        return c !== '';
      });
      org.children = childrenProcessed;
    });

    // Process second level child organizations
    orgs.forEach((org) => {
      org.children.forEach((child) => {
        child.children = org.actors.filter(
          (a) => a.parentOrgName === child.name
        );
      });
    });

    // Combine author duplicates
    orgs.forEach((org) => {
      org.children.forEach((child) => {
        let authors = [];
        let index = 0;
        child.children.forEach((c) => {
          if (!authors.includes(c.name)) {
            authors.push(c.name);
          } else {
            // Is duplicate, join roles
            const firstOccurenceIndex = child.children.findIndex((item) => {
              return item.name === c.name;
            });
            child.children[firstOccurenceIndex].roles.push(
              ...child.children[index].roles
            );
            child.children[index] = '';
          }
          index += 1;
        });
        // Clear items made empty
        child.children = child.children.filter((c) => {
          return c !== '';
        });
      });
    });

    // Sort by organization name
    let orgsSorted = orgs.sort((a, b) => +(a.name > b.name) - 0.5);
    // Move empty org to the end
    if (orgsSorted.length > 0 && !orgsSorted[0]?.name.trim()) {
      orgsSorted.push(...orgsSorted.splice(0, 1));
      orgsSorted[
        orgsSorted.length - 1
      ].name = $localize`:@@missingOrg:Organisaatio puuttuu`;
    }

    let urn = '';
    let doi = '';

    item.preferredIdentifiers?.forEach((id) => {
      if (id.pidType === 'doi') {
        doi = id.pidContent.slice(4);
      } else if (id.pidType === 'urn') {
        urn = id.pidContent;
      }
    });

    /*
     * Dataset relations
     */
    const datasetRelations = item.datasetRelation?.map((relation) => {
      // Display english labels on swedish version.
      // No official swedish translations available.
      const displayLocation = locale === 'fi' ? locale : 'en';

      const matchingRelation = DatasetRelations.find(
        (item) => item.uri === relation.relationType
      );

      return {
        type: matchingRelation
          ? matchingRelation.label[displayLocation]
          : $localize`:@@notKnown:Ei tiedossa`,
        name: relation['name' + capitalizedLocale],
        id: relation.relationIdentifier,
        pid: relation.pidContent,
        canBeLinked: relation.canBeLinked === 1,
      };
    });

    // Sort relations by relations type.
    // Least relations by type first.
    const datasetRelationsByTypes = datasetRelations
      ?.reduce((acc, curr) => {
        const type = curr.type;
        const found = acc.find((i) => i.type === type);
        if (!found) {
          acc.push({
            type: curr.type,
            items: datasetRelations.filter(
              (relation) => relation.type === type
            ),
          });
        }
        return acc.sort((a, b) => a.items.length - b.items.length);
      }, [])
      .flatMap((relationType) => relationType.items);

    /*
     * Dataset versions
     */
    const datasetVersions = item.datasetVersionSet
      ?.map((version) => ({
        versionNumber: version.versionNumber,
        id: version.versionIdentifier,
      }))
      .sort((a, b) => b.versionNumber - a.versionNumber);

    return new Dataset(
      item.identifier,
      this.utils.checkTranslation('name', item),
      this.utils.checkTranslation('description', item),
      item.datasetCreated,
      item.type, // Missing
      orgsSorted,
      item.creatorsText,
      item.project, // Missing
      fieldsOfScienceString,
      item.languages
        ?.map((x) => this.utils.checkTranslation('languageName', x))
        ?.join(', '),
      this.utils.translateAccessType(item.accessType),
      this.utils.checkTranslation('licenseName', item),
      keywords.join(', '),
      temporalCoverage,
      item.dataCatalog
        ?.map((x) => this.utils.checkTranslation('name', x))
        ?.join(', '),
      item.accessType === 'open',
      item.relatedDatasets, // Missing
      doi, // Missing?
      urn,
      item.fairdataUrl,
      datasetVersions,
      datasetRelationsByTypes
    );
  }
}
