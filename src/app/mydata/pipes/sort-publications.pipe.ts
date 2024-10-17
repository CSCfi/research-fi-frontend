import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sortPublications',
    standalone: true,
})
export class SortPublicationsPipe implements PipeTransform {
  transform(publications: any[]) {
    return publications.sort((a, b) => b.publicationYear - a.publicationYear);
  }
}
