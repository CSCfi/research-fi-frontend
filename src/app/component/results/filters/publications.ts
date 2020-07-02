//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterMethodService } from '../../../services/filter-method.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class PublicationFilters {
    filterData = [
      {field: 'year', label: $localize`:@@yearOfPublication:Julkaisuvuosi`, hasSubFields: false, open: true, hideSearch: true},
      {field: 'organization', label: $localize`:@@organization:Organisaatio`, hasSubFields: true, open: false,
      tooltip: $localize`:@@pOrgFTooltip:Julkaisun tekijän suomalainen organisaatio. Palvelu ei toistaiseksi sisällä tietoja julkaisujen ulkomaisista organisaatioista.`},
      {field: 'field', label: $localize`:@@fieldOfScience:Tieteenala`, hasSubFields: true, open: false,
      tooltip: $localize`:@@pFOSFTooltip:Tilastokeskuksen tieteenalaluokitus. Julkaisulla voi olla 1-6 tieteenalaa.`},
      {field: 'publicationType', label: $localize`:@@publicationType:Julkaisutyyppi`, hasSubFields: true, open: false,
      tooltip: $localize`:@@pTypeFTooltip:OKM:n julkaisutiedonkeruun mukainen julkaisutyyppi A–G.`},
      {field: 'countryCode', label: $localize`:@@publicationCountry:Julkaisumaa`, hasSubFields: false, open: true,
      tooltip: $localize`:@@pCountryFTooltip:Julkaisijan maa.`},
      {field: 'lang', label: $localize`:@@language:Kieli`, hasSubFields: false, open: true,
      tooltip: $localize`:@@pLangFTooltip:Kieli, jolla julkaisu on kirjoitettu.`},
      {field: 'juFo', label: $localize`:@@jufoLevel:Julkaisufoorumitaso`, hasSubFields: false, open: true,
      tooltip: $localize`:@@pJufoFTooltip:Julkaisufoorumin (www.julkaisufoorumi.fi) mukainen julkaisukanavan (kirjakustantaja, konferenssi tai julkaisusarja) tasoluokitus: 1 = perustaso, 2 = johtava taso, 3 = korkein taso. Tasolla 0 ovat kanavat, jotka eivät joltain osin täytä tason 1 vaatimuksia tai ovat uusia.`},
      {field: 'openAccess', label: $localize`:@@openAccess:Avoin saatavuus`, hasSubFields: false, open: true,
      tooltip: '<p><strong>' +  $localize`:@@openAccessJournal:Open access -lehti ` + '</strong>' + $localize`Julkaisu on ilmestynyt julkaisukanavassa, jonka kaikki julkaisut ovat avoimesti saatavilla.` + '</p><p><strong>' + $localize`:@@selfArchived:Rinnakkaistallennettu` + ': </strong>' + $localize`Julkaisu on tallennettu organisaatio- tai tieteenalakohtaiseen julkaisuarkistoon joko välittömästi tai kustantajan määrittämän kohtuullisen embargoajan jälkeen.` + '</p><p><strong>' + $localize`:@@otherOpenAccess:Muu avoin saatavuus` + ': </strong>' + $localize`Julkaisu on avoimesti saatavilla, mutta se on ilmestynyt ns. hybridijulkaisukanavassa, jossa kaikki muut julkaisut eivät ole avoimesti saatavilla.` + '</p>'}
    ];

    singleFilterData = [
      {field: 'internationalCollaboration', label: $localize`:@@intCoPublication:Kansainvälinen yhteisjulkaisu`,
      tooltip: $localize`:@@intCoPublicationTooltip:Julkaisussa on tekijöitä myös muualta kuin suomalaisista tutkimusorganisaatioista.`}
    ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data.aggregations;
    // Year
    source.year.buckets = source.year.years.buckets;
    // Organization & sector
    this.organization(source.organization);
    // Major field
    source.field.buckets = this.minorField(source.field.fields.buckets);
    // Publication Type
    source.publicationType.buckets = this.separatePublicationClass(source.publicationType.publicationTypes.buckets);
    // Country code
    source.countryCode.buckets = this.publicationCountry(source.countryCode.countryCodes.buckets);
    // Language code
    source.lang.buckets = this.lang(source.lang.langs.buckets);
    // Jufo code
    source.juFo.buckets = this.juFoCode(source.juFo.juFoCodes.buckets);
    // Open access
    source.openAccess.buckets = this.openAccess(source.openAccess.openAccessCodes.buckets, source.selfArchived.selfArchivedCodes.buckets,
                                                source.oaComposite);
    // Internationatl collaboration
    source.internationalCollaboration.buckets =
      this.getSingleAmount(source.internationalCollaboration.internationalCollaborationCodes.buckets);
    source.shaped = true;
    return source;
  }

  organization(data) {
    data.buckets = data.sectorName ? data.sectorName.buckets : [];
    data.buckets.forEach(item => {
      item.subData = item.org.org.buckets;
      item.subData.map(subItem => {
          subItem.label = subItem.key;
          subItem.key = subItem.orgId.buckets[0].key;
          subItem.doc_count = subItem.filtered.filterCount.doc_count;
      });
      item.doc_count = item.subData.map(s => s.doc_count).reduce((a, b) => a + b, 0);
    });
  }

  minorField(data) {
    // check if major aggregation is available
    const combinedMajorFields =  data ?
    (this.filterMethodService.separateMinor(data ? data : []) ) : [];

    const result = this.staticDataService.majorFieldsOfScience;
    for (let i = 0; i < combinedMajorFields.length; i++) {
    if (result[i]) {
        result[i].subData = combinedMajorFields[i];
        // Add doc counts to major fields of science
        result[i].doc_count = result[i].subData.map(x => x.doc_count).reduce((a, b) => a + b, 0);
    }
    }
    return result;
  }

  separatePublicationClass(data) {
    const source = data[0] ? data : [];
    let combined = [];
    if (source && source.length > 0) {
        source.forEach(val => combined.push(val.key.substring(0, 1)));
        combined.filter((v, i, a) => a.indexOf(v) === i);
    }
    combined = [...new Set(combined)];
    const staticData = this.staticDataService.publicationClass;

    // Map items for subData
    const result = combined.map(
      x => x = {key: x + ' ' + staticData.find(item => item.class === x).label, doc_count: 0, subData: staticData.find(item => item.class === x)
      .types.map(type => type = {
          type: type.type,
          label: type.type + ' ' + type.label,
          key: type.type,
          doc_count: data.find(doc => doc.key === type.type) ? data.find(doc => doc.key === type.type).doc_count : ''
      })}
    );
    // Get higher level doc counts for visualisation
    result.forEach(x => x.doc_count = x.subData.map(a => a.doc_count).reduce((a, b) => a + b, 0));
    return result;
  }

  publicationCountry(data) {
    const result = data.map(item =>
        item = {key: 'c' + item.key, label: item.key === 0 ?
        $localize`:@@finland:Suomi` : $localize`:@@other:Muu`, doc_count: item.doc_count, value: item.key});
    return result;
  }

  juFoCode(data) {
    const staticData = this.staticDataService.juFoCode;
    const result = data.map(item => item = {
        // label: staticData.find(code => code.key === item.key) ? staticData.find(code => code.key === item.key).label : '',
        label: item.key === ' ' ? $localize`:@@noInfo:Ei tietoa` : item.key,
        key: item.key === ' ' ? 'noVal' : 'j' + item.key,

        doc_count: item.doc_count,
        value: item.key
    });
    return result;
  }

  lang(data) {
    if (data && data[0]?.language) {
      let result = data.map(item => item = {
        label: item.language.buckets[0]?.key !== 'undefined' ? item.language.buckets[0]?.key : $localize`:@@notKnown:Ei tiedossa`,
        key: item.key.toLowerCase(),
        doc_count: item.doc_count
      });
      result = result.filter(item => item.key !== ' ');
      return result;
    }
  }

  openAccess(openAccess, selfArchived, oaComposite) {
    let openAccessCodes = [];
    const result = [];
    // Get composite aggreation result of selfArchived and openAccess 0 codes. This is used to get doc count for 'no open access' filter
    const nonOpenAccess = oaComposite.buckets.find
      (item => JSON.stringify(item.key) === JSON.stringify({selfArchived: 0, openAccess: 0}));
    const noOpenAccessData = oaComposite.buckets.find
      (item => JSON.stringify(item.key) === JSON.stringify({selfArchived: -1, openAccess: -1}));
    // Get aggregation from response
    if (openAccess && openAccess.length > 0) {
      openAccess.forEach(val => {
        switch (val.key) {
            case 1: {
            openAccessCodes.push({key: 'openAccess', doc_count: val.doc_count, label: $localize`:@@openAccessJournal:Open Access -lehti `});
            break;
            }
            case 2: {
            openAccessCodes.push({key: 'otherOpen', doc_count: val.doc_count, label: $localize`:@@otherOpenAccess:Muu avoin saatavuus: `});
            break;
            }
            case 0: {
            openAccessCodes.push({key: 'nonOpenAccess', doc_count: val.doc_count, label: $localize`:@@nonOpen:Ei avoin`});
            break;
            }
            default: {
            openAccessCodes.push({key: 'noOpenAccessData', doc_count: val.doc_count, label: $localize`:@@noInfo:Ei tietoa`});
            break;
            }
        }
      });
    }

    if (selfArchived && selfArchived.length > 0) {
      selfArchived.forEach(val => {
        switch (val.key) {
            case 1: {
            openAccessCodes.push({key: 'selfArchived', doc_count: val.doc_count, label: $localize`:@@selfArchived:Rinnakkaistallennettu`});
            break;
            }
            case 0: {
            openAccessCodes.push({key: 'selfArchivedNonOpen', doc_count: val.doc_count, label: $localize`:@@nonOpen:Ei avoin`});
            break;
            }
            default: {
            openAccessCodes.push({key: 'noOpenAccessData', doc_count: val.doc_count, label: $localize`:@@noInfo:Ei tietoa`});
            break;
            }
        }
      });
    }
    // Get duplicate values and sum doc counts
    const reduce = openAccessCodes.reduce((item, val) => {
      const sum = item.filter((obj) => {
          return obj.key === val.key;
      }).pop() || {key: val.key, doc_count: 0, label: val.label};

      sum.doc_count += val.doc_count;
      item.push(sum);
      return item;
    }, []);

    // Remove duplicates
    openAccessCodes = [...new Set(reduce)];
    function docCount(key) {return openAccessCodes.find(item => item.key === key).doc_count; }
    // Push items by key
    if (openAccessCodes.some(e => e.key === 'openAccess')) {
      result.push({key: 'openAccess', doc_count: docCount('openAccess'), label: $localize`:@@openAccessJournal:Open Access -lehti `});
    }
    if (openAccessCodes.some(e => e.key === 'selfArchived')) {
      result.push({key: 'selfArchived', doc_count: docCount('selfArchived'), label: $localize`:@@selfArchived:Rinnakkaistallennettu`});
    }
    if (openAccessCodes.some(e => e.key === 'otherOpen')) {
      result.push({key: 'otherOpen', doc_count: docCount('otherOpen'), label: $localize`:@@otherOpenAccess:Muu avoin saatavuus`});
    }

    if (openAccessCodes.some(e => e.key === 'nonOpenAccess') && openAccessCodes.some(e => e.key === 'selfArchivedNonOpen')) {
      result.push({key: 'nonOpen', doc_count: nonOpenAccess.filtered.doc_count,  label: $localize`:@@nonOpen:Ei avoin`});
    }

    if (openAccessCodes.some(e => e.key === 'noOpenAccessData')) {
      result.push({key: 'noOpenAccessData', doc_count: openAccessCodes.find
      (item => item.key === 'noOpenAccessData')?.doc_count, label: $localize`:@@noInfo:Ei tietoa`});
    }
    return result;
  }

  getSingleAmount(data) {
      if (data.length > 0) {
        return data.filter(x => x.key === 1);
      }
    }
}
