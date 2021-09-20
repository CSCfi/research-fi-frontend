// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { UtilityService } from '../../shared/services/utility.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageCheck {
  constructor(@Inject(LOCALE_ID) protected localeId: string) {}

  // Point of language test is to populate data if no content available.
  testLang(field, item) {
    // tslint:disable-next-line: curly
    if (!item) return undefined;
    // Change locale to field name format
    const capitalizedLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    // Get the content based on the current locale
    const content = item[field + capitalizedLocale]?.toString()?.trim() || '';
    // Check if the original locale has valuable content
    const contentIsValid = UtilityService.stringHasContent(content);

    // Dont perform checks if content is valid
    if (contentIsValid) {
      return content;
    }
    // Return content based on locale and priority if field doesn't exist in its original locale
    let res;
    switch (this.localeId) {
      case 'fi': {
        res = UtilityService.stringHasContent(item[field + 'En'])
          ? item[field + 'En']
          : item[field + 'Sv'];
        break;
      }
      case 'en': {
        res = UtilityService.stringHasContent(item[field + 'Fi'])
          ? item[field + 'Fi']
          : item[field + 'Sv'];
        break;
      }
      case 'sv': {
        res = UtilityService.stringHasContent(item[field + 'En'])
          ? item[field + 'En']
          : item[field + 'Fi'];
        break;
      }
    }
    // If still no content and Und exists, take that
    res =
      !UtilityService.stringHasContent(res) && item[field + 'Und']
        ? item[field + 'Und']
        : res;
    return res;
  }

  translateFieldOfScience(item) {
    // Same logic as testLang but different field naming convention
    const capitalizedLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    const content = item['name' + capitalizedLocale + 'Science'] || '';
    const contentIsValid = UtilityService.stringHasContent(content);

    switch (contentIsValid) {
      // If field doesn't exist in its original locale
      case false: {
        switch (this.localeId) {
          case 'fi': {
            return UtilityService.stringHasContent(
              item['name' + 'En' + 'Science']
            )
              ? item['name' + 'En' + 'Science']
              : item['name' + 'Sv' + 'Science'];
          }
          case 'en': {
            return UtilityService.stringHasContent(
              item['name' + 'Fi' + 'Science']
            )
              ? item['name' + 'Fi' + 'Science']
              : item['name' + 'Sv' + 'Science'];
          }
          case 'sv': {
            return UtilityService.stringHasContent(
              item['name' + 'En' + 'Science']
            )
              ? item['name' + 'En' + 'Science']
              : item['name' + 'Fi' + 'Science'];
          }
        }
        break;
      }
      // If field exists in its original locale, take that
      default: {
        return item['name' + capitalizedLocale + 'Science'];
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
          case 'Organiser': {
            return 'Toteuttaja';
          }
          case 'Co-organiser': {
            return 'Osatoteuttaja';
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
          case 'Organiser': {
            return 'Organiser';
          }
          case 'Co-organiser': {
            return 'Co-organiser';
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
          case 'Organiser': {
            return 'Genomförare';
          }
          case 'Co-organiser': {
            return 'Delgenomförare';
          }
        }
      }
    }
  }

  translateKeywords(item) {
    const endings = ['', 'En', 'Sv'];
    const keywordsObj = {};

    endings.forEach((lang) => {
      const keywords = item['keywords' + lang]
        ? item['keywords' + lang].map((x) => x.keyword)
        : [];
      keywordsObj['keyword' + (lang ? lang : 'Fi')] = keywords.join(', ');
    });
    return this.testLang('keyword', keywordsObj);
  }

  translateInfraServiceType(type) {
    switch (type) {
      case 'laitteisto': {
        return $localize`:@@infraServiceTypeEquipment:Laitteisto`;
      }
      case 'aineisto': {
        return $localize`:@@infraServiceTypeMaterial:Aineisto`;
      }
      case 'palvelu': {
        return $localize`:@@infraServiceTypeService:Palvelu`;
      }
    }
    // Return finnish if not english or swedish
    return type;
  }

  translateAccessType(type) {
    switch (type) {
      case 'open': {
        return $localize`:@@datasetAccessOpen:Avoin`;
      }
      case 'permit': {
        return $localize`:@@datasetAccessPermit:Vaatii luvan hakemista Fairdata-palvelussa`;
      }
      case 'login': {
        return $localize`:@@datasetAccessLogin:Vaatii kirjautumisen Fairdata-palvelussa`;
      }
      case 'restricted': {
        return $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu`;
      }
      case 'embargo': {
        return $localize`:@@datasetAccessEmbargo:Embargo`;
      }
    }
    // Return finnish if not english or swedish
    return type;
  }
}
