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

    types = [
        ['A1', 'A2', 'A4', 'B1', 'B3', 'D1', 'D3', 'E1'],
        ['A3', 'B2', 'D2'],
        ['C1', 'E2', 'D4', 'D5', 'G4', 'G5'],
        ['C2', 'E3', 'D6']
    ]

    constructor() {}
    adapt(item: any): PublicationCitation {

        const formatNamesInitials = (authors: string, order = 0): string => {
            if (!authors) return '';

            let names: any = authors.split(';');
            // Names with '&'
            names = authors.split('&').concat(names);
            names = names.map(n => n.trim().split(', '));
            // Initials first 
            if (order) {
                names = names.map(n => n[1].split(' ').map(f => f[0] + '.').join(' ') + ' ' + n[0]);
            // Last name first
            } else {
                names = names.map(n => n[0] + ' ' + n[1].split(' ').map(f => f[0] + '.').join(' '));
            }
            names = names.join(', ')
            return names;
    
        }

        const createApa = (type: string): string => {
            let apa = '';

            // Lastname F. N., Othername O. N., ...
            const names = formatNamesInitials(item.authorsText);

            const year = `(${item.publicationYear}). `;
            
            const journal = `<i>${item.journalName || item.conferenceName}</i>`;

            const volume = item.volume ? (', <i>' + item.volume + '</i>') : '';

            const number = item.issueNumber ? ('(' + item.issueNumber + ')') : '';
            
            const doi = item.doi ? ('doi: ' + item.doi) : '';
            
            
            if (this.types[0].includes(type)) {
                const pages = (item.pageNumberText || item.articleNumberText) ? (', ' + (item.pageNumberText || item.articleNumberText))  : '';

                apa = names + ' ' + year + item.publicationName + '. ' + journal + volume + number + pages + '. ' + doi;
            } else if (this.types[1].includes(type)) {
                const pages = (item.pageNumberText || item.articleNumberText) ? ', (' + (item.pageNumberText || item.articleNumberText) +')' : '';
                const parentPublisherNames = formatNamesInitials(item.parentPublicationPublisher, 1);
                
                apa = names + ' ' + year + item.publicationName + '. In ' + parentPublisherNames + ' (Eds.), ' + item.parentPublicationName + pages + '. ' + item.publisherName + '. ' + doi;
            } else if (this.types[2].includes(type)) {
                apa = names + ' ' + year + item.publicationName + '. ' + item.publisherName + '. ' + doi;
            } else if (this.types[3].includes(type)) {
                const parentPublisherNames = formatNamesInitials(item.parentPublicationPublisher, 1);
                
                apa = parentPublisherNames + '(Eds.). ' + year + '<i>' + item.publicationName + '</i>' + '. ' + item.publisherName + '. ' + doi;
            }

            console.log(apa);
            return apa;
        }

        const apa = createApa(item.publicationTypeCode);

        return new PublicationCitation(
            apa,
            apa,
            apa
        );
    }
}
