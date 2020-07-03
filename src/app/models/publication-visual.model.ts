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

export class PublicationVisual {

    constructor(
        public year: VisualData[],
        public fieldOfScience: VisualData[],
        public organization: VisualData[],
        public mainFieldOfScience: VisualData[],
        public publicationType: VisualData[],
        public openAccess: VisualData[],
        public country: VisualData[],
        public juFo: VisualData[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class PublicationVisualAdapter implements Adapter<PublicationVisual> {
    constructor() {}
    adapt(item: any, categoryIdx?: number): PublicationVisual {
        
        console.log(item)

        const field = publication[categoryIdx].field;

        // Init arrays
        const year: VisualData[] = [];
        const fieldsOfScience: VisualData[] = [];
        const organization: VisualData[] = [];

        const tmp: any[] = [];



        // Adapt based on current visualisation
        switch (field) {
            case 'year':
                // Push each year into the array (use fields of science array to save query time)
                item.aggregations.year.buckets.forEach(b => {
                    const v: any = {};
                    v.key = b.key;
                    v.doc_count = b.doc_count;
                    b.data = [v];
                    year.push(b);
                }); 
                break;
                
            case 'fieldOfScience':

                
                // Format data via temp array
                item.aggregations.fieldOfScience.buckets.forEach(b => tmp.push(b));
        
                tmp.forEach(b => {
                    // Add fields array to each year in the bucket
                    b.data = [];
                    b.fieldName.buckets.forEach(f => {
                        // Create data object to push into field
                        const v: any = {};
                        v.name = f.key;
                        // Get the first element
                        v.id = f.fieldId.buckets.shift().key;
                        v.doc_count = f.doc_count;
                        // Push the object into fields
                        b.data.push(v);
                    })
                    // Add the year with its data to the array
                    fieldsOfScience.push(b);
                })
                break;

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
                })
                organization.push(b);
            })


            default:
                break;
        }




        return new PublicationVisual(
            year,
            fieldsOfScience,
            organization,
            [],
            [],
            [],
            [],
            []
        );
    }
}
