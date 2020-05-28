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
    // Change locale to field name format
    const capitalizedLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    // Get the content based on the current locale
    const content = item[field + capitalizedLocale]?.toString()?.trim() || '';
    // Return content based on locale and priority
    switch (content) {
      // If field doesn't exist in its original locale
      case '': {
        switch (this.localeId) {
          case 'fi': {
            return item[field + 'En'].length > 0 ? item[field + 'En'] : item[field + 'Sv'];
          }
          case 'en': {
            return item[field + 'Fi'].length > 0 ? item[field + 'Fi'] : item[field + 'Sv'];
          }
          case 'sv': {
            return item[field + 'En'].length > 0 ? item[field + 'En'] : item[field + 'Fi'];
          }
        }
        break;
      }
      // If field exists in its original locale, take that
      default: {
        return item[field + capitalizedLocale];
      }
    }
  }

  translateRole(role, euFunding) {
    switch (this.localeId) {
      case 'fi': {
        switch (role) {
          case 'leader': {
            return euFunding ? 'Coordinator' : 'Johtaja';
          }
          case 'participant': {
            return 'Participant';
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
            return euFunding ? 'Coordinator' : 'Leader';
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
            return euFunding ? 'Coordinator' : 'Leader';
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
