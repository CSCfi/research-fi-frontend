// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { VisualData } from './visualisations.model';

export class PublicationVisual {

    constructor(
        public year: VisualData[],
        public fieldOfScience: VisualData[],
        public mainFieldOfScience: VisualData[],
        public organization: VisualData[],
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
    adapt(item: any): PublicationVisual {

        const year: VisualData[] = [];
        // Push each year into the array (use fields of science array to save query time)
        item.aggregations.year.buckets.forEach(b => {
            const v: any = {};
            v.key = b.key;
            v.doc_count = b.doc_count;
            b.data = [v];
            year.push(b);
        });


        const fieldsOfScience: VisualData[] = [];
        const tmp: any[] = [];
        
        // Format data via temp array
        item.aggregations.fieldOfScience.buckets.forEach(b => {
            tmp.push(b)
        });

        tmp.forEach(b => {
            // Add fields array to each year in the bucket
            b.data = [];
            b.fieldName.buckets.forEach(f => {
                // Create data object to push into field
                const v: any = {};
                v.name = f.key;
                v.id = f.fieldId.buckets[0].key;
                v.doc_count = f.doc_count;
                // Push the object into fields
                b.data.push(v);
            })
            // Add the year with its data to the array
            fieldsOfScience.push(b);
        })

        return new PublicationVisual(
            year,
            fieldsOfScience,
            [],
            [],
            [],
            [],
            [],
            []
        );
    }
}
