import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'handleInfrastructureLink',
    standalone: true,
})
export class HandleInfrastructureLinkPipe implements PipeTransform {
  transform(link: string): string {
    return `/results/infrastructure/${link.substring(11).replace(/\//g, '%2F')}`;
  }
}
