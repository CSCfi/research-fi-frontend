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
    console.log('pipe transform called', value, args);
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
    const argsArr = args
      .split(' ')
      .filter(Boolean)
      .map((item) => item.replace(/,|;/g, ''));

    // Map value keys and loop through args, replace with tags
    const match = valueArr.map((e) => {
      for (let i = 0; i < argsArr.length; i++) {
        //Neutralising the effect of accents
        const temp_e = e.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const temp_word = argsArr[i]
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (
          temp_word.length > 0 &&
          temp_e.toLowerCase().includes(temp_word.toLowerCase())
        ) {
          // 'gi' stands for case insensitive, use 'g' if needed for case sensitive
          const src = new RegExp(argsArr[i], 'gi');
          const found = e.match(src);
          const src_accent = new RegExp(temp_word, 'gi');
          const found_accent = temp_e.match(src_accent);

          if (found) {
            e = e.replace(src, '<mark>' + found[0] + '</mark>');
            if (temp_word.length == temp_e.length) {
              argsArr.splice(i, 1);
              i--;
            }
            break;
          } else if (found_accent) {
            e = temp_e.replace(
              src_accent,
              '<mark>' + found_accent[0] + '</mark>'
            );
            if (temp_word.length == temp_e.length) {
              argsArr.splice(i, 1);
              i--;
            }
            break;
          } else {
            return e;
          }
        }
      }
      return e;
    });

    const result = match.join(' ');

    // Needs to be bypassed because of dynamic value
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
