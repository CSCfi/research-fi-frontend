// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { VisualData } from './visualisations.model';
import { StaticDataService } from '../../services/static-data.service';
import { FilterService } from '../../services/filters/filter.service';

export class PublicationVisual {
  constructor(
    public year: VisualData[],
    public fieldOfScience: VisualData[],
    public organization: VisualData[],
    public publicationType: VisualData[],
    public country: VisualData[],
    public lang: VisualData[],
    public juFo: VisualData[],
    public majorFieldOfScience: VisualData[],
    public openAccess: VisualData[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationVisualAdapter implements Adapter<PublicationVisual> {
  private names = {
    year: '',
    fieldsOfScience: 'f.key',
    organization: 'f.organizationName.buckets.shift().key',
    publicationType: 'this.nameObjects[f.key]',
    country: 'this.countryNames[f.key]',
    lang: 'this.getLang(f.language.buckets.shift().key)',
    juFo: 'f.key',
    majorFieldOfScience:
      'this.fieldObjects[f.fieldId.buckets.shift().key.toString().charAt(0)]',
  };
  private ids = {
    year: '',
    fieldsOfScience: 'f.key',
    organization: 'f.key',
    publicationType: 'f.key',
    country: 'this.countryFilterIds[f.key]',
    lang: 'this.getLangId(f.key)',
    juFo: 'f.key',
    majorFieldOfScience: 'f.key',
  };

  private openAccessTypes = [
    {
      name: $localize`:@@openAccessJournal:Open Access -lehti`,
      doc_count: 0,
      id: 'openAccess',
    },
    {
      name: $localize`:@@selfArchived:Rinnakkaistallennettu`,
      doc_count: 0,
      id: 'selfArchived',
    },
    {
      name: $localize`:@@delayedOpenAccess:Viivästetty avoin saatavuus`,
      doc_count: 0,
      id: 'delayedOpenAccess',
    },
    {
      name: $localize`:@@otherOpenAccess:Muu avoin saatavuus`,
      doc_count: 0,
      id: 'otherOpen',
    },
    {
      name: $localize`:@@nonOpen:Ei avoin`,
      doc_count: 0,
      id: 'nonOpen',
    },
    {
      name: $localize`:@@noInfo:Ei tietoa`,
      doc_count: 0,
    },
  ];

  publicationTypeNames: any[];
  nameObjects: any;
  majorFieldsOfScience: any[];
  fieldObjects: any[];
  filters: any;
  openAccessFilters: any[];

  // Names for country data
  countryNames = [$localize`:@@finland:Suomi`, $localize`:@@other:Muut`];
  countryFilterIds = ['c0', 'c1'];

  publication = this.sds.visualisationData.publication;

  constructor(
    private sds: StaticDataService,
    private fs: FilterService
  ) {
    // Get class descriptions from static data service, don't modify original data
    this.publicationTypeNames = JSON.parse(
      JSON.stringify(this.sds.publicationClass)
    )
      .map((x) => x.types)
      .flat();
    // Modify name to include type
    this.publicationTypeNames.forEach(
      (y) => (y.label = y.type + ', ' + y.label)
    );
    // Convert into object with keys
    this.nameObjects = this.publicationTypeNames.reduce(
      (a, b) => ((a[b.type] = b.label), a),
      {}
    );

    // Same for major fields of science
    this.majorFieldsOfScience = this.sds.majorFieldsOfScience;
    this.fieldObjects = this.majorFieldsOfScience.reduce(
      (a, b) => ((a[b.id] = b.key), a),
      {}
    );

    // Get filters
    this.filters = this.fs.filters
  }


  getLang(s: string): string {
    if (
      s === 'suomi' ||
      s === 'englanti' ||
      s === 'ruotsi' ||
      s === 'Finnish' ||
      s === 'English' ||
      s === 'Swedish' ||
      s === 'finska' ||
      s === 'engelska' ||
      s === 'svenska'
    ) {
      return s;
    } else {
      return $localize`:@@other:Muut`;
    }
  }

  getLangId(s: string): string {
    if (s === 'FI' || s === 'EN' || s === 'SV') {
      return s.toLowerCase();
    } else {
      return undefined;
    }
  }

  getOpenAccess(
    data: { key: string; doc_count: number; parent: string }[],
    parent: string,
  ) {
    // Get a copy of the open access types. .slice() doesn't work because of object reference pointers
    const res: {
      name: string;
      doc_count: number;
      parent: string;
    }[] = JSON.parse(JSON.stringify(this.openAccessTypes));

    // Add parent year
    res.forEach((d) => (d.parent = parent));
    data.forEach((d) => {
      const selfArchivedCode = Math.floor(parseInt(d.key) / 100);
      const openAccess = Math.floor(parseInt(d.key) / 10);
      const publisherOpenAccess = parseInt(d.key) % 10;

      const stringKey = '' + openAccess + publisherOpenAccess;

    // Filter also based on selfArchived === 0 for non open

    // Classify publications as selfArchieved if they are self archieved but not open publications
    // Show self archieved open publications as selfArchieved if open access type is not selected in opean access filter

    if (selfArchivedCode === 0 && 
       openAccess === 0 && 
       publisherOpenAccess !== 3) {
        res[4].doc_count += d.doc_count;
    };

    if (((selfArchivedCode === 1 && 
        openAccess === 10 &&
        publisherOpenAccess !== 3) ||
        stringKey === '199') && (
          this.filters.source._value.openAccess.length === 0 ||
          this.filters.source._value.openAccess.includes('selfArchived')
        )) {
        res[1].doc_count += d.doc_count;
    }

    if( 
        !this.filters.source._value.openAccess.includes('openAccess') &&
        this.filters.source._value.openAccess.includes('selfArchived')) {
        switch (stringKey) {
          case '111': {
            res[1].doc_count += d.doc_count; 
            break;
          }
        } 
    } else if(
        this.filters.source._value.openAccess.includes('openAccess')) {
        switch (stringKey) {
          case '11': {
            res[0].doc_count += d.doc_count;
            break;
          }
          case '111': {
            res[0].doc_count += d.doc_count; 
            break;
          }
        } 
    }

    if( 
      !this.filters.source._value.openAccess.includes('otherOpen') &&
      this.filters.source._value.openAccess.includes('selfArchived')) {
      switch (stringKey) {
        case '112': {
          res[1].doc_count += d.doc_count; 
          break;
        }
      } 
    } else if(
      this.filters.source._value.openAccess.includes('otherOpen')) {
      switch (stringKey) {
        case '12': {
          res[3].doc_count += d.doc_count;
          break;
        }
        case '112': {
          res[3].doc_count += d.doc_count;
          break;
        }
      } 
    }

    if( 
      !this.filters.source._value.openAccess.includes('delayedOpenAccess') &&
      this.filters.source._value.openAccess.includes('selfArchived')) {
      switch (stringKey) {
        case '103': {
          res[1].doc_count += d.doc_count; 
          break;
        }
        case '113': {
          res[1].doc_count += d.doc_count; 
          break;
        }
      } 
    } else if(
      this.filters.source._value.openAccess.includes('delayedOpenAccess')) {
      switch (stringKey) {
        case '03': {
          res[2].doc_count += d.doc_count;
          break;
        }
        case '13': {
          res[2].doc_count += d.doc_count;
          break;
        }
        case '103': {
          res[2].doc_count += d.doc_count; 
          break;
        }
        case '113': {
          res[2].doc_count += d.doc_count;
          break;
        }
      } 
    }
    
    if(this.filters.source._value.openAccess.length === 0){
      switch (stringKey) {
        case '11': {
          res[0].doc_count += d.doc_count;
          break;
        }
        case '111': {
          res[0].doc_count += d.doc_count; 
          break;
        }
        case '12': {
          res[3].doc_count += d.doc_count;
          break;
        }
        case '112': {
          res[3].doc_count += d.doc_count;
          break;
        }
        case '03': {
          res[2].doc_count += d.doc_count;
          break;
        }
        case '13': {
          res[2].doc_count += d.doc_count;
          break;
        }
        case '103': {
          res[2].doc_count += d.doc_count; 
          break;
        }
        case '113': {
          res[2].doc_count += d.doc_count;
          break;
        }
        case '199':{
          res[1].doc_count += 0;
          break;
        }
      } 
    }


    switch (stringKey) {
      // Separate implementation above for non open, add with 0 doc count so no doubles
      case '00':
      case '01':
      case '02':
      case '03':
      case '100':
      case '11':
      case '111':
      case '12':
      case '112':
      case '103':
      case '13':
      case '113':
      default: {
        // Self archived is not unknown
        if ((!selfArchivedCode && stringKey === '99') || stringKey === '10') {
          res[5].doc_count += d.doc_count;
        }
        break;
      }
    }
    });
    return res.filter((x) => x.doc_count > 0);
  }

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
    arr.forEach((d) => d.data.sort((a, b) => +(a.name < b.name) - 0.5));
  }

  adapt(item: any, categoryIdx?: number): PublicationVisual {
    // Init arrays
    const year: VisualData[] = [];
    const fieldsOfScience: VisualData[] = [];
    const organization: VisualData[] = [];
    const publicationType: VisualData[] = [];
    const openAccess: VisualData[] = [];
    const country: VisualData[] = [];
    const lang: VisualData[] = [];
    const juFo: VisualData[] = [];
    const majorFieldOfScience: VisualData[] = [];

    const field = this.publication[categoryIdx].field;

    const tmp: any[] = [];

    // Adapt based on current visualisation
    switch (field) {
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
          fieldsOfScience.push(b);
        });
        this.sortByName(fieldsOfScience);
        break;

      case 'majorFieldOfScience':
        item.aggregations.majorFieldOfScience.buckets.forEach((b) =>
          tmp.push(b)
        );

        tmp.forEach((b) => {
          b.data = [];
          b.fieldNested.fieldId.buckets.forEach((f) => {
            const v: any = {};
            v.name = this.fieldObjects[f.key.toString().charAt(0)];
            v.id = f.key;
            v.doc_count = f.doc_count;
            v.parent = b.key;
            b.data.push(v);
          });
          majorFieldOfScience.push(b);
        });
        this.sortByName(majorFieldOfScience);
        break;

      case 'organization':
        item.aggregations.organization.buckets.forEach((b) => tmp.push(b));

        tmp.forEach((b) => {
          b.data = [];
          b.orgNested.organizationId.buckets.forEach((f) => {
            const v: any = {};
            v.name = f.organizationName.buckets.shift().key;
            v.id = f.key;
            v.doc_count = f.doc_count;
            v.parent = b.key;
            b.data.push(v);
          });
          organization.push(b);
        });
        this.sortByName(organization);
        break;

      case 'openAccess': {
        item.aggregations.openAccess.buckets.forEach((b) => tmp.push(b));

        tmp.forEach((b) => {
          b.data = this.getOpenAccess(b.openAccess.buckets, b.key);
          openAccess.push(b);
        });
        this.sortByName(openAccess);
        break;
      }

      default:
        const hierarchyField = this.publication[categoryIdx].hierarchy[1].name;

        item.aggregations[field].buckets.forEach((b) => tmp.push(b));

        tmp.forEach((b) => {
          b.data = [];
          b[hierarchyField].buckets.forEach((f) => {
            const v: any = {};
            v.name = eval(this.names[hierarchyField]);
            v.id = eval(this.ids[hierarchyField]);
            v.doc_count = f.doc_count;
            v.parent = b.key;
            b.data.push(v);
          });
          // Push data to correct array
          eval(`${hierarchyField}.push(b)`);
          eval(`this.sortByName(${hierarchyField})`);
        });

        break;
    }

    // Group languages, possibly multiple with same name
    this.groupNames(lang);
    // Same for major fields
    this.groupNames(majorFieldOfScience);

    return new PublicationVisual(
      year,
      fieldsOfScience,
      organization,
      publicationType,
      country,
      lang,
      juFo,
      majorFieldOfScience,
      openAccess
    );
  }
}