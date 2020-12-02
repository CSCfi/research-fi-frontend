// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { PublicationVisual, PublicationVisualAdapter } from './publication-visual.model';
import { FundingVisual, FundingVisualAdapter } from './funding-visual.model';
import { FundingVisualAmountAdapter } from './funding-amount-visual.model';

export interface VisualData {
    key: string;
    doc_count: number;
    data: VisualDataObject[];
}

export interface VisualDataObject {
    name: string;
    id: string;
    doc_count: number;
    parent: string;
}

export interface VisualQueryHierarchy {
    field?: string;
    name: string;
    size?: number;
    order?: number;
    filterName?: string;
    exclude?: string | string[] | number[];
    nested?: string;
    filter?: {field: string, value: any};
    sum?: string;
    script?: string;
}

export interface VisualQuery {
    field: string;
    title: string;
    amountTitle?: string;
    select: string;
    message?: string;
    filter?: string;
    hierarchy: VisualQueryHierarchy[];
    hierarchy2?: VisualQueryHierarchy[];
}


export class Visual {
    constructor(
        public publicationData: PublicationVisual,
        public fundingData: FundingVisual
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class VisualAdapter implements Adapter<Visual> {
    constructor(private publicationVisualAdapter: PublicationVisualAdapter, private fundingVisualAdapter: FundingVisualAdapter,
                private fundingAmountAdapter: FundingVisualAmountAdapter) {}
    adapt(item: any, tab?: string, categoryIdx?: number, fundingAmount?: boolean): Visual {

        let publicationData: PublicationVisual;
        let fundingData: FundingVisual;

        switch (tab) {
            case 'publications':
                publicationData = this.publicationVisualAdapter.adapt(item, categoryIdx);
                break;
            case 'fundings':
                // tslint:disable-next-line: curly
                if (!fundingAmount)
                    fundingData = this.fundingVisualAdapter.adapt(item, categoryIdx);
                // tslint:disable-next-line: curly
                else
                    fundingData = this.fundingAmountAdapter.adapt(item, categoryIdx);
                break;
        }


        return new Visual(
            publicationData,
            fundingData
        );
    }
}
