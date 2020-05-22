// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';


@Injectable({
    providedIn: 'root'
})

export class LanguageCheck {
  constructor( @Inject( LOCALE_ID ) protected localeId: string) {}

  // Point of language test is to populate data if no content available.
  testLang(field, item) {
    // Slice locale from field
    const baseField = field.slice(0, -2);
    // Get content from field
    const content = item[field]?.toString()?.trim() || '';
    // Return content based on locale and priority
    switch (this.localeId) {
      case 'fi': {
        if (!item[field]) {
          return item[baseField + 'En'] || item[baseField + 'Sv'] || null;
        } else {
          switch (content) {
            case '': {
              return item[baseField + 'En'].length > 0 ? item[baseField + 'En'] : item[baseField + 'Sv'];
            }
            default: {
              return item[field];
            }
          }
        }
      }
      case 'en': {
        if (!item[field]) {
          return item[baseField + 'Fi'] || item[baseField + 'Sv'] || null;
        } else {
          switch (content) {
            case '': {
              return item[baseField + 'Fi'].length > 0 ? item[baseField + 'Fi'] : item[baseField + 'Sv'];
            }
            default: {
              return item[field];
            }
          }
        }
      }
      case 'sv': {
        if (!item[field]) {
          return item[baseField + 'Fi'];
        } else {
          switch (content) {
            case '': {
              return item[baseField + 'Fi'].length > 0 ? item[baseField + 'Fi'] : item[baseField + 'En'];
            }
            default: {
              return item[field];
            }
          }
        }
      }
    }
  }

  translateRole(role) {
    switch (this.localeId) {
      case 'fi': {
        switch (role) {
          case 'leader': {
            return 'Johtaja';
          }
          case 'participant': {
            return 'Partneri';
          }
          case 'partner': {
            return 'Partneri';
          }
        }
        break;
      }
      case 'en': {
        switch (role) {
          case 'leader': {
            return 'Leader';
          }
          case 'participant': {
            return 'Participant';
          }
          case 'partner': {
            return 'Partner';
          }
        }
        break;
      }
      case 'sv': {
        switch (role) {
          case 'leader': {
            return 'Leader';
          }
          case 'participant': {
            return 'Participant';
          }
          case 'partner': {
            return 'Partner';
          }
        }
      }
    }
  }
}
