// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { VisualData } from './visualisations.model';
import { publication } from 'src/assets/static-data/visualisation.json';
import { StaticDataService } from '../services/static-data.service';

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
    providedIn: 'root'
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
        majorFieldOfScience: 'this.fieldObjects[f.fieldId.buckets.shift().key.toString().charAt(0)]',
    }

    private openAccessTypes = [
        {
            name: 'Open access -lehti',
            doc_count: 0
        },
        {
            name: 'Rinnakkaistallennettu',
            doc_count: 0
        },
        {
            name: 'Muu avoin saatavuus',
            doc_count: 0
        },
        {
            name: 'Ei avoin',
            doc_count: 0
        },
        {
            name: 'Ei tietoa',
            doc_count: 0
        },
    ];

    publicationTypeNames: any[];
    nameObjects: any;
    majorFieldsOfScience: any[];
    fieldObjects: any[];
    
    // Names for country data
    countryNames = ['Suomi', 'Muu'];
    
    constructor(private sds: StaticDataService) {
        // Get class descriptions from static data service, don't modify original data
        this.publicationTypeNames = JSON.parse(JSON.stringify(this.sds.publicationClass)).map(x => x.types).flat();
        // Modify name to include type
        this.publicationTypeNames.forEach(y => y.label = y.type + ', ' + y.label);
        // Convert into object with keys
        this.nameObjects = this.publicationTypeNames.reduce((a, b) => (a[b.type] = b.label, a), {});
        
        // Same for major fields of science
        this.majorFieldsOfScience = this.sds.majorFieldsOfScience;
        this.fieldObjects = this.majorFieldsOfScience.reduce((a, b) => (a[b.id] = b.key, a), {});
    }

    getLang(s: string): string {
        if (s === 'suomi' || s === 'englanti' || s === 'ruotsi') {
            return s;
        } else {
            return 'Muu';
        }
    }

    getOpenAccess(data: {key: string, doc_count: number}[]) {
        // Get a copy of the open access types. .slice() doesn't work because of object reference pointers
        const res: {name: string, doc_count: number}[] = JSON.parse(JSON.stringify(this.openAccessTypes));

        data.forEach(d => {
            const openAccessCode = Math.floor(parseInt(d.key) / 10);
            const selfArchivedCode = parseInt(d.key) % 10;

            // Flag to check if code is known
            let valid = false;
            
            // No else ifs because multiple can be true
            if (openAccessCode === 1) {
                res[0].doc_count += d.doc_count;
                valid = true;
            }
            if (selfArchivedCode === 1) {
                res[1].doc_count += d.doc_count;
                valid = true;
            }
            if (openAccessCode === 2) {
                res[3].doc_count += d.doc_count;
                valid = true;
            }
            if (openAccessCode === 0 && selfArchivedCode === 0) {
                res[3].doc_count += d.doc_count;
                valid = true;
            }
            if (!valid) {
                res[4].doc_count += d.doc_count;
            }
        })

        return res.filter(x => x.doc_count > 0);

    }

    groupNames(arr: VisualData[]): VisualData[] {
        // For each year
        arr.forEach(d => {
            // Group items with the same name under one object
            const grouped = d.data.reduce((a: {name: string, doc_count: number}[], b) => {
                // Get current name
                const name = b.name;
                // Find the object with the same name, or initialize
                const obj = a.filter(x => x.name === name).shift() || {name: name, doc_count: 0};
                // Add the current item's doc count
                obj.doc_count += b.doc_count;
                // If it's a new item, push it into a
                if (obj.doc_count === b.doc_count) a.push(obj);
                // Return array for new iteration
                return a
            }, [])
            // Assign grouped to data
            d.data = grouped;
        })
        return arr
    }


    adapt(item: any, categoryIdx?: number): PublicationVisual {
        
        console.log(item)
        
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
        
        const field = publication[categoryIdx].field;

        const tmp: any[] = [];

        // Adapt based on current visualisation
        switch (field) {

            case 'organization':
                
                item.aggregations.organization.buckets.forEach(b => tmp.push(b));
                
                tmp.forEach(b => {
                    b.data = [];
                    b.orgNested.organizationId.buckets.forEach(f => {
                        const v: any = {};
                        v.name = f.organizationName.buckets.shift().key;
                        v.id = f.key;
                        v.doc_count = f.doc_count;
                        b.data.push(v);
                    });
                    organization.push(b);
                });
                break;
                
                case 'openAccess': {
                    
                    item.aggregations.openAccess.buckets.forEach(b => tmp.push(b));

                    tmp.forEach(b => {
                        b.data = this.getOpenAccess(b.openAccess.buckets);
                        openAccess.push(b);
                    });
                    console.log(tmp);

                    break;
            }

            
            default:

                const hierarchyField = publication[categoryIdx].hierarchy[1].name;

                item.aggregations[field].buckets.forEach(b => tmp.push(b));

                tmp.forEach(b => {
                    b.data = [];
                    b[hierarchyField].buckets.forEach(f => {
                        const v: any = {};
                        v.name = eval(this.names[hierarchyField]);
                        v.doc_count = f.doc_count;
                        b.data.push(v);
                    });
                    // Push data to correct array
                    eval(`${hierarchyField}.push(b)`);
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
            openAccess,
        );
    }
}
