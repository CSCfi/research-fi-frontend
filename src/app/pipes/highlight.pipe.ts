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
    // Parantheses are removed because of regexp. Asterisk doesn't work with titles containing mulptiple different integers
    const stripped = args.replace(/[\])}[{(]/g, '').replace(/\*/g, '');
    // 'gi' stands for case insensitive, use 'g' if needed for case sensitive
    const source = new RegExp(stripped, 'gi');
    const match = value.match(source);

    if (!match) {
        return value;
    }
    const replacedValue = value.replace(source, ('<mark>' + match[0] + '</mark>'));
    // Needs to be bypassed because of dynamic value
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
    }
}
