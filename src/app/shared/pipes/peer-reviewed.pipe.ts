import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'peerReviewed',
  standalone: true
})

// Takes publicationTypeCode as input value
export class PeerReviewedPipe implements PipeTransform {
  transform(publicationTypeCode: any) {
    return (publicationTypeCode && (publicationTypeCode[0] === 'A' || publicationTypeCode[0] === 'C'));
  }
}
