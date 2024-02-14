import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fixExternalUrl',
  standalone: true
})
export class FixExternalUrlPipe implements PipeTransform {
  transform(url: string): string {
    // Fix url address to be handled as external link if prefix missing
    return url.startsWith('http')
      ? url
      : url.startsWith('www')
        ? 'https://' + url
        : '//' + url;
  }
}
