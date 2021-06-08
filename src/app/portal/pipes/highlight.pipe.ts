//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
})
export class HighlightSearch implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, args: any): any {
    // Convert value to string to highlight numbers also
    value = value ? value.toString() : value;

    if (!value || !args) {
      return value;
    }

    // Replace coded umlauts
    value = value.replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö');

    // Parantheses are removed because of regexp. Asterisk doesn't work with titles containing mulptiple different integers
    args = args.replace(/[\])}[{(]/g, '').replace(/\*/g, '');
    const valueArr = value.split(' ');
    // Remove empty strings
    const argsArr = args.split(' ').filter(Boolean);

    // Map value keys and loop through args, replace with tags
    const match = valueArr.map((e) => {
      argsArr.forEach((word) => {
        if (word.length > 0 && e.toLowerCase() == word.toLowerCase()) {
          // 'gi' stands for case insensitive, use 'g' if needed for case sensitive
          const src = new RegExp(word, 'gi');
          const found = e.match(src);
          if (!found) {
            return e;
          }
          e = e.replace(src, '<mark>' + found[0] + '</mark>');
        }
      });
      return e;
    });

    const result = match.join(' ');

    // Needs to be bypassed because of dynamic value
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
