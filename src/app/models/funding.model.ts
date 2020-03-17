// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { FieldOfScience, FieldOfScienceAdapter } from './field-of-science.model';
import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';

export class Funding {

    constructor(

    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class FundingAdapter implements Adapter<Funding> {
    constructor(private fs: FieldOfScienceAdapter) {}
    adapt(item: any): Funding {
        return new Funding();
    }
}
