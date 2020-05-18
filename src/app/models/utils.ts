// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';


@Injectable({
    providedIn: 'root'
})

export class LanguageCheck {
    constructor( @Inject( LOCALE_ID ) protected localeId: string) {
    }

    checkContent(contentFi, contentEn, contentSv) {
        console.log(contentEn);
        switch (contentFi.trim()) {
            case '': {
                return contentEn;
            }
        }
    }
}
