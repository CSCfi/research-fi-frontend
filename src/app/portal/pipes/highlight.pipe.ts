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
    standalone: true,
})
export class HighlightSearchPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, keywords: any): any {
    // Convert value to string to highlight numbers also
    value = value ? value.toString() : value;

    if (!value || !keywords) {
      return value;
    }

    const LETTER_EXPRESSION = /^\p{L}$/u;
    const isLetter = (character) => {
      return character && (LETTER_EXPRESSION.test(character));
    };

    // Replace coded umlauts
    value = value.replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö');
    // Parantheses are removed because of regexp. Asterisk doesn't work with titles containing mulptiple different integers
    keywords = keywords.replace(/[\])}[{(]/g, '').replace(/\*/g, '');
    const valueArr = value.split(' ');
    // Remove empty strings
    const keywordsArr = keywords
      .split(' ')
      .filter(Boolean)
      .map((item) => item.replace(/,|;/g, ''));

    // Loop through input values and compare with keywords. Highlight keyword in <mark></mark> tags if input contains a keyword.
    const match = valueArr.map((e) => {
      for (let i = 0; i < keywordsArr.length; i+=1) {
        let aKeyword = keywordsArr[i];

        // Crop first and last special characters from the string
        isLetter(aKeyword.charAt(0)) ? null : aKeyword = aKeyword.substring(1);
        isLetter(aKeyword.charAt(aKeyword.length - 1)) ? null : aKeyword = aKeyword.slice(0, -1);

        // Normalization used to handle accented characters
        let normalizedWord = aKeyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        let normalizedInput = e.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        if (aKeyword.length > 0 && normalizedInput.includes(normalizedWord)) {
          return (HighlightWords(e, aKeyword, ''));
        }
      }
      return e;
    });

    // Recursive highlight function.
    function HighlightWords(input: string, word: string, processedHighlight: string) {
      let normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let stillToProcessInput = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const firstOccurrence = stillToProcessInput.toLowerCase().indexOf(normalizedWord.toLowerCase());

      if (firstOccurrence !== -1) {
        let sliceIndex = firstOccurrence + normalizedWord.length;
        processedHighlight += input.slice(0, firstOccurrence);
        processedHighlight += '<mark>' + input.slice(firstOccurrence, sliceIndex) + '</mark>';

        // Process input as it is, normalization used only to interpret accented characters like search does
        stillToProcessInput = input.slice(sliceIndex, input.length);
        if (stillToProcessInput.length > 0) {
          return HighlightWords(stillToProcessInput, word, processedHighlight)
        } else {
          return processedHighlight;
        }
      } else {
          return processedHighlight + stillToProcessInput;
      }
    }

    const result = match.join(' ');

    // Needs to be bypassed because of dynamic value
    return this.sanitizer.bypassSecurityTrustHtml(result);

  }
}