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