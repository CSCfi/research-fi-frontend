// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { VisualData } from './visualisations.model';
import { StaticDataService } from '@portal.services/static-data.service';

export class FundingVisual {
  constructor(
    public year: VisualData[],
    public amount: VisualData[],
    public funder: VisualData[],
    public organization: VisualData[],
    public typeOfFunding: VisualData[],
    public fieldOfScience: VisualData[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingVisualAdapter implements Adapter<FundingVisual> {
  private names = {
    year: '',
    funder: 'f.funder.buckets.shift().key',
    organization: '',
    // Locale, english, finnish, key
    typeOfFunding:
      'f.typeName.buckets[0].key.split("|")[0].trim() || f.typeName.buckets[0].key.split("|")[1].trim() || f.typeName.buckets[0].key.split("|")[2].trim() || f.key',
    fieldOfScience: 'f.key',
  };

  private ids = {
    year: '',
    funder: 'f.key',
    organization: 'f.key',
    // Locale, english, finnish, key
    typeOfFunding: 'f.key',
    fieldOfScience: 'f.key',
  };

  funding = this.sds.visualisationData.funding;

  constructor(private sds: StaticDataService) {}

  groupNames(arr: VisualData[]): VisualData[] {
    // For each year
    arr.forEach((d) => {
      // Group items with the same name under one object
      const grouped = d.data.reduce(
        (
          a: { name: string; doc_count: number; parent: string; id: string }[],
          b
        ) => {
          // Get current name
          const name = b.name;
          // Find the object with the same name, or initialize
          const obj = a.filter((x) => x.name === name).shift() || {
            name: name,
            doc_count: 0,
            parent: b.parent,
            id: b.id,
          };
          // Add the current item's doc count
          obj.doc_count += b.doc_count;
          // If it's a new item, push it into a
          if (obj.doc_count === b.doc_count) a.push(obj);
          // Return array for new iteration
          return a;
        },
        []
      );
      // Assign grouped to data
      d.data = grouped;
    });
    return arr;
  }

  sortByName(arr: VisualData[]) {
    arr.forEach((o) => o.data.sort((a, b) => +(b.name > a.name) - 0.5));
  }

  adapt(item: any, categoryIdx?: number): FundingVisual {
    // Init arrays
    const year: VisualData[] = [];
    const amount: VisualData[] = [];
    const funder: VisualData[] = [];
    const organization: VisualData[] = [];
    const typeOfFunding: VisualData[] = [];
    const fieldOfScience: VisualData[] = [];

    const field = this.funding[categoryIdx].field;

    const tmp: any[] = [];

    // Adapt based on current visualisation
    switch (field) {
      case 'amount':
        item.aggregations.amount.buckets.forEach((b) => {
          b.data = [];
          const v: any = {};
          v.doc_count = b.amount.buckets.reduce(
            (a, b) => a + b.key * b.doc_count,
            0
          );
          v.name = undefined;
          v.parent = b.key;
          b.data.push(v);
          amount.push(b);
        });
        this.sortByName(amount);
        break;

      case 'organization':
        const combined = [];

        // Combine the two aggregations
        // fundingGroupPerson
        item.aggregations.organization.buckets.forEach((b) => {
          b.orgs = [];

          b.orgNested.fundedPerson.sectorName.buckets.forEach((s) => {
            b.orgs.push(...s.organizationId.buckets);
          });
          combined.push({ key: b.key, orgs: b.orgs });
        });

        // organizationConsortium
        item.aggregations.organization2.buckets.forEach((b) => {
          const target = combined.find((x) => x.key === b.key);
          b.orgNested.finnishOrganization.sectorName.buckets.forEach((s) => {
            target.orgs.push(...s.organizationId.buckets);
          });
        });

        combined.forEach((b) => {
          b.data = [];
          b.orgs.forEach((f) => {
            const v: any = {};
            v.name = f.organizationName.buckets.shift().key.toString();
            v.doc_count = f.doc_count;
            v.id = f.key;
            v.parent = b.key;
            b.data.push(v);
          });
          organization.push(b);
        });

        break;

      case 'fieldOfScience':
        item.aggregations.fieldOfScience.buckets.forEach((b) => tmp.push(b));

        tmp.forEach((b) => {
          b.data = [];
          b.fieldNested.fieldId.buckets.forEach((f) => {
            const v: any = {};
            v.name = f.fieldsOfScience.buckets.shift().key;
            v.id = f.key;
            v.doc_count = f.doc_count;
            v.parent = b.key;
            b.data.push(v);
          });
          fieldOfScience.push(b);
        });
        this.sortByName(fieldOfScience);
        break;

      default:
        const hierarchyField = this.funding[categoryIdx].hierarchy[1].name;

        item.aggregations[field].buckets.forEach((b) => tmp.push(b));

        tmp.forEach((b) => {
          b.data = [];
          b[hierarchyField].buckets.forEach((f) => {
            const v: any = {};
            v.name = eval(this.names[field]);
            v.id = eval(this.ids[field]);
            v.doc_count = f.doc_count;
            v.parent = b.key;
            b.data.push(v);
          });
          // Push data to correct array
          eval(`${field}.push(b)`);
          eval(`this.sortByName(${field})`);
        });
        break;
    }

    // Group duplicate names from the two aggregations
    this.groupNames(organization);
    // Sort the mixed arrays alphabetically
    this.sortByName(organization);
    this.sortByName(typeOfFunding);

    return new FundingVisual(
      year,
      amount,
      funder,
      organization,
      typeOfFunding,
      fieldOfScience
    );
  }
}
