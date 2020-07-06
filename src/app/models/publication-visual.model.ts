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
        public mainFieldOfScience: VisualData[],
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
        lang: 'f.language.buckets.shift().key',
        juFo: 'f.key',
    }

    publicationTypeNames: any[];
    nameObjects: any;
    
    // Names for country data
    countryNames = ['Suomi', 'Muu'];
    
    constructor(private sds: StaticDataService) {
        // Get class descriptions from static data service
        this.publicationTypeNames = this.sds.publicationClass.map(x => x.types).flat();
        // Modify name to include type
        this.publicationTypeNames.forEach(y => y.label = y.type + ', ' + y.label);
        // Convert into object with keys
        this.nameObjects = this.publicationTypeNames.reduce((a, b) => (a[b.type] = b.label, a), {});
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
        const mainFieldOfScience: VisualData[] = [];
        
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

                
        return new PublicationVisual(
            year,
            fieldsOfScience,
            organization,
            publicationType,
            country,
            lang,
            juFo,
            mainFieldOfScience,
            openAccess,
        );
    }
}
