// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { LanguageCheck } from './utils';

export class FieldOfScience {

    constructor(
        public id: number,
        public nameFi: string,
        public nameSv: string,
        public nameEn: string,
        public mainFieldNameFi: string,
        public mainFieldNameSv: string,
        public mainFieldNameEn: string,
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class FieldOfScienceAdapter implements Adapter<FieldOfScience> {
    constructor(private lang: LanguageCheck) {}
    adapt(item: any): FieldOfScience {
        return new FieldOfScience(
            item.fieldIdScience,
            item.nameFiScience,
            item.nameSvScience,
            item.nameEnScience,
            this.lang.testLang('mainFieldOfScienceName', item),
            this.lang.testLang('mainFieldOfScienceName', item),
            this.lang.testLang('mainFieldOfScienceName', item),
        );
    }
}
