// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { VisualData } from './visualisations.model';
import { funding } from 'src/assets/static-data/visualisation.json';
import { StaticDataService } from '../../services/static-data.service';

export class FundingVisual {

    constructor(
        public year: VisualData[]
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class FundingVisualAdapter implements Adapter<FundingVisual> {
    private names = {
        year: '',
    }

    
    constructor(private sds: StaticDataService) {}

    groupNames(arr: VisualData[]): VisualData[] {
        // For each year
        arr.forEach(d => {
            // Group items with the same name under one object
            const grouped = d.data.reduce((a: {name: string, doc_count: number, parent: string}[], b) => {
                // Get current name
                const name = b.name;
                // Find the object with the same name, or initialize
                const obj = a.filter(x => x.name === name).shift() || {name: name, doc_count: 0, parent: b.parent};
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


    adapt(item: any, categoryIdx?: number): FundingVisual {
        
        console.log(item)
        
        // Init arrays
        const year: VisualData[] = [];
        
        const field = funding[categoryIdx].field;

        const tmp: any[] = [];

        // Adapt based on current visualisation
        switch (field) {

            default:

                const hierarchyField = funding[categoryIdx].hierarchy[1].name;

                item.aggregations[field].buckets.forEach(b => tmp.push(b));

                tmp.forEach(b => {
                    b.data = [];
                    b[hierarchyField].buckets.forEach(f => {
                        const v: any = {};
                        v.name = eval(this.names[hierarchyField]);
                        v.doc_count = f.doc_count;
                        v.parent = b.key;
                        b.data.push(v);
                    });
                    // Push data to correct array
                    eval(`${hierarchyField}.push(b)`);
                });


                break;
        }
                
        return new FundingVisual(
            year
        );
    }
}
