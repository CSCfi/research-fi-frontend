import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'highlight'
  })
export class HighlightSearch implements PipeTransform {
    constructor( private sanitizer: DomSanitizer ) {}

    transform(value: any, args: any): any {
        // Parantheses are removed because of regexp. Asterisk doesn't work with titles containing mulptiple different integers
        args = args.replace(/[\])}[{(]/g, '').replace(/\*/g, '');

        const valueArr = value.split(' ');
        // Remove empty strings
        const argsArr = args.split(' ').filter(Boolean);

        // Return value if no input
        if (!args) {
            return value;
        }

        // Map value keys and loop through args, replace with tags
        const match = valueArr.map((e) => {
            argsArr.forEach(x => {
                if (e.toLowerCase().includes(x.toLowerCase())) {
                    // 'gi' stands for case insensitive, use 'g' if needed for case sensitive
                    const src = new RegExp(x, 'gi');
                    const found = e.match(src);
                    if (!found) {return e; }
                    e = e.replace(src, ('<mark>' + found[0] + '</mark>'));
                 }
            });
            return e;
        });

        const result = match.join(' ');

        // Needs to be bypassed because of dynamic value
        return this.sanitizer.bypassSecurityTrustHtml(result);
    }
}
