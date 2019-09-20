import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'highlight'
  })
export class HighlightSearch implements PipeTransform {
    constructor( private sanitizer: DomSanitizer ) {}

    transform(value: any, args: any): any {
    if (!args) {
        return value;
    }
    // 'gi' stands for case insensitive, use 'g' if needed for case sensitive
    const source = new RegExp(args, 'gi');
    const match = value.match(source);

    if (!match) {
        return value;
    }

    const replacedValue = value.replace(source, '<mark>' + match[0] + '</mark>');
    // Needs to be bypassed because of dynamic value
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
    }
}
