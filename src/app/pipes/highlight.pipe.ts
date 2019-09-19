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
    const re = new RegExp(args, 'gi');
    const match = value.match(re);

    if (!match) {
        return value;
    }

    const replacedValue = value.replace(re, '<mark>' + match[0] + '</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
    }
}
