// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class PublicationCitation {

    constructor(
        public apa: string,
        public mla: string,
        public chicago: string
    ) {}
}

@Injectable({
    providedIn: 'root'
})

export class PublicationCitationAdapter implements Adapter<PublicationCitation> {
    constructor() {}
    adapt(item: any): PublicationCitation {

        const res = '';

        // Lastname F. N., Othername O. N., ...
        let names = item.authorsText.split(';');
        names = names.map(n => n.trim().split(', '));
        names = names.map(n => n[0] + ' ' + n[1].split(' ').map(f => f[0] + '.').join(' '));
        names = names.join(', ')
        console.log(names);

        let year = `(${item.publicationYear})`;
        console.log(year);

        const journal = `<i>${item.journalName || item.conferenceName}</i>`;

        const volumeNumber = `<i>${item.volume || ''}</i>` + (item.issueNumber ? `(${item.issueNumber || ''})` : '');

        console.log(volumeNumber)

        const pages = item.pageNumberText || item.articleNumberText;

        console.log(pages)

        const doi = item.doi ? ('doi: ' + item.doi) : '';

        const apa = names + ' ' + year + '. ' + item.publicationName + ', ' + journal + ', ' + volumeNumber + ', ' + pages + '. ' + doi;

        console.log(apa);

        return new PublicationCitation(
            res,
            res,
            res
        );
    }
}
