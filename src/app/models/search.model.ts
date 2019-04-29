// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

export class Search {
    took: number;
    publicationId: number;
    publicationName: string;

    constructor(took?: number, publicationId?: number, publicationName?: string) {
        this.took = took;
        this.publicationId = publicationId;
        this.publicationName = publicationName;
    }
}