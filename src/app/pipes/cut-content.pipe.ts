import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cutContent'
})
export class CutContentPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
