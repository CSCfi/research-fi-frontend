// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class PublicationVisual {

    constructor(
        public year: {key: number, doc_count: number}[],
        public fieldOfScience: any[],
        public mainFieldOfScience: any[],
        public organization: any[],
        public publicationType: any[],
        public openAccess: any[],
        public country: any[],
        public juFo: any[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class PublicationVisualAdapter implements Adapter<PublicationVisual> {
    constructor() {}
    adapt(item: any): PublicationVisual {

        const year: {key: number, doc_count: number}[] = [];
        // Push each year into the array (use fields of science array to save query time)
        item.aggregations.fieldOfScience.buckets.forEach(b => year.push(b));


        const fieldsOfScience: {key: number, doc_count: number, fields: {name: string, id: number, doc_count: number}[]}[] = [];
        const tmp: any[] = [];
        
        // Format data via temp array
        item.aggregations.fieldOfScience.buckets.forEach(b => {
            tmp.push(b)
        });

        tmp.forEach(b => {
            // Add fields array to each year in the bucket
            b.fields = [];
            b.fieldName.buckets.forEach(f => {
                // Create data object to push into field
                const v: any = {};
                v.name = f.key;
                v.id = f.fieldId.buckets[0].key;
                v.doc_count = f.doc_count;
                // Push the object into fields
                b.fields.push(v);
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
