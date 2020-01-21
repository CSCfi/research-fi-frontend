import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'links'
})
export class LinksPipe implements PipeTransform {
  constructor( private sanitizer: DomSanitizer ) {}

  // This pipe is intended to use with publications only
  transform(publication: any): any {
    const fields = ['doi', 'doiHandle'];
    const linkArr = [];
    let link = '';

    // Push links to array, self archived is priority
    if (publication.selfArchivedData) {
      for (const selfArchived of publication.selfArchivedData) {
        if (selfArchived.selfArchived && selfArchived.selfArchived[0].selfArchivedAddress.length > 0) {
          linkArr.push(selfArchived.selfArchived[0].selfArchivedAddress);
        }
      }
    }
    // Doi link is secondary
    for (const field of fields) {
      const test = publication[field];
      if (test && test.trim() !== '') {
        link = (field === 'doi' ? 'https://doi.org/' : '') + test;
        linkArr.push(link);
        break;
      }
    }

    publication.link = linkArr.length > 0 ? linkArr[0] : 'javascript:void(0);';

    return linkArr.length > 0 ? linkArr[0] : '';
  }

}
