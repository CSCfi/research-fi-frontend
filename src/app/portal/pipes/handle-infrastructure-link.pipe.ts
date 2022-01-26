import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'handleInfrastructureLink',
})
export class HandleInfrastructureLinkPipe implements PipeTransform {
  transform(link: string): string {
    return `/results/infrastructure/${link.replace(/\//g, '%2F')}`;
  }
}
