import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'handleInfrastructureLink',
    standalone: true,
})
export class HandleInfrastructureLinkPipe implements PipeTransform {
  transform(link: string, format: string): string {
    if (format === 'longLink') {
      link = link.substring(11, link.length);
    }
    return `/results/infrastructure/${link}`;
  }
}
