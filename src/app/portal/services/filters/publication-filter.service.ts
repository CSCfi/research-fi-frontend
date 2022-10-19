//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { FilterMethodService } from './filter-method.service';
import { StaticDataService } from '../static-data.service';
import { cloneDeep } from 'lodash-es';
import { FilterConfigType } from 'src/types';

@Injectable({
  providedIn: 'root',
})
export class PublicationFilterService {
  filterData: FilterConfigType[] = [
    {
      field: 'year',
      label: $localize`:@@yearOfPublication:Julkaisuvuosi`,
      hasSubFields: false,
      open: true,
      hideSearch: true,
    },
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      hasSubFields: true,
      open: false,
      relatedPublications: true,
      tooltip: $localize`:@@pOrgFTooltip:Julkaisun tekijän suomalainen organisaatio. Palvelu ei toistaiseksi sisällä tietoja julkaisujen ulkomaisista organisaatioista.`,
    },
    {
      field: 'field',
      label: $localize`:@@fieldOfScience:Tieteenala`,
      hasSubFields: true,
      open: false,
      tooltip: $localize`:@@pFOSFTooltip:Tilastokeskuksen tieteenalaluokitus. Taiteenalat OKM:n luokituksen mukaisesti. Julkaisulla voi olla 1-6 tieteen- tai taiteenalaa.`,
    },
    {
      field: 'publicationType',
      label: $localize`:@@publicationType:Julkaisutyyppi`,
      hasSubFields: true,
      open: false,
      tooltip: $localize`:@@pTypeFTooltip:OKM:n julkaisutiedonkeruun mukainen julkaisutyyppi A–G.`,
    },
    {
      field: 'publicationFormat',
      label: $localize`:@@publicationFormat:Julkaisumuoto`,
      hasSubFields: false,
      open: false,
      tooltip:
        '<p><strong>' +
        $localize`:@@article:Artikkeli` +
        ': </strong>' +
        $localize`:@@articleTooltipContent:Sisältää alkuperäis- ja katsausartikkelit, kirjan tai lehden johdannot ja esipuheet, lyhyet tutkimusselostukset, pääkirjoitukset, keskustelupuheenvuorot ja kommentit. ` +
        '</p><p><strong>' +
        $localize`:@@monograph:Erillisteos` +
        ': </strong>' +
        $localize`:@@monographTooltipContent:Sisältää monografiat/kirjat, tutkimus- ja kehitystyöhön perustuva kehittämis- tai tutkimusraportti, selvitykset, ns. white paperit sekä working papers ja discussion papers -tyyppiset julkaisut. ` +
        '</p><p><strong>' +
        $localize`:@@editorial:Toimitustyö` +
        ': </strong>' +
        $localize`:@@editorialTooltipContent:Sisältää useista eri kirjoittajien artikkeleista koostuvan tieteellisen kirjan tai lehden erikoisnumeron toimitustyöt ` +
        '</p><p><strong>' +
        $localize`:@@abstract:Abstrakti` +
        ': </strong>' +
        $localize`:@@abstractTooltipContent:Sisältää konferenssiesitelmien abstraktit sekä laajennetut abstraktit.` +
        '</p><p><strong>' +
        $localize`:@@poster:Posteri` +
        ': </strong>' +
        $localize`:@@posterTooltipContent:Sisältää konferenssiesitelmien posterit.` +
        '</p><p><strong>' +
        $localize`:@@blog:Blogikirjoitus` +
        ': </strong>' +
        $localize`:@@blogTooltipContent:Sisältää blogimuotoiset julkaisut, joiden julkaisemisesta on päättänyt riippumaton toimituskunta tai joiden julkaisualustalla on ISSN-tunnus.`,
    },
    {
      field: 'publicationAudience',
      label: $localize`:@@publicationAudience:Julkaisun yleisö`,
      hasSubFields: false,
      open: false,
      tooltip:
        '<p>' +
        $localize`:@@publicationChannelAudience:Julkaisukanavan kohdeyleisö` +
        '</p>' +
        '<p><strong>' +
        $localize`:@@scientificPublication:Tieteellinen julkaisu` +
        ': </strong>' +
        $localize`:@@scientificPublicationTooltipContent:Julkaisut, jotka on tarkoitettu edistämään tiedettä sekä tuottamaan uutta tietoa.` +
        '</p><p><strong>' +
        $localize`:@@professionalPublication:Ammatillinen julkaisu` +
        ': </strong>' +
        $localize`:@@professionalPublicationTooltipContent:Julkaisut, jotka levittävät tutkimukseen ja kehitystyöhön perustuvaa tietoa ammattiyhteisön käyttöön.` +
        '</p><p><strong>' +
        $localize`:@@popularPublication:Yleistajuinen julkaisu` +
        ': </strong>' +
        $localize`:@@popularPublicationTooltipContent:Julkaisut, jotka levittävät tutkimus- ja kehitystyöhön perustuvaa tietoa suurelle yleisölle ja joiden sisällön ymmärtäminen ei edellytä erityistä perehtyneisyyttä alaan.`,
    },
    {
      field: 'parentPublicationType',
      label: $localize`:@@parentPublicationType:Emojulkaisun tyyppi`,
      hasSubFields: false,
      open: false,
      tooltip:
        '<p><strong>' +
        $localize`:@@journal:Lehti` +
        ': </strong>' +
        $localize`:@@journalTooltipContent:sisältää tieteelliset aikakauslehdet ja ammattilehdet.` +
        '</p><p><strong>' +
        $localize`:@@researchBook:Kokoomateos` +
        ': </strong>' +
        $localize`:@@researchBookTooltipContent:Sisältää tieteelliset kokoomateokset, tieteelliset vuosikirjat ja vastaavat, ammatilliset käsi- tai opaskirjat, ammatilliset tietojärjestelmät tai kokoomateokset, oppikirja-aineistot sekä lyhyet ensyklopediatekstit. ` +
        '</p><p><strong>' +
        $localize`:@@conferencePlatform:Konferenssialusta` +
        ': </strong>' +
        $localize`:@@conferencePlatformTooltipContent:Sisältää konferenssin painetut tai julkisesti saatavilla olevat julkaisut, ns. proceedings-julkaisut.` +
        '<p><strong>' +
        $localize`:@@onlinePlatform:Verkkoalusta` +
        ': </strong>' +
        $localize`:@@onlinePlatformTooltipContent:Sisältää muilla sähköisillä alustoilla julkaistut julkaisut.`,
    },
    {
      field: 'articleType',
      label: $localize`:@@articleType:Artikkelin tyyppi`,
      hasSubFields: false,
      open: false,
      tooltip:
        '<p><strong>' +
        $localize`:@@originalArticle:Alkuperäisartikkeli` +
        ': </strong>' +
        $localize`:@@originalArticleTooltip:on pääosin aiemmin julkaisemattomasta materiaalista koostuva tieteellinen artikkeli.` +
        '</p><p><strong>' +
        $localize`:@@reviewArticle:Katsausartikkeli` +
        ': </strong>' +
        $localize`:@@reviewArticleTooltip:perustuu aikaisempiin samasta aihepiiristä tehtyihin julkaisuihin.` +
        '</p><p><strong>' +
        $localize`:@@dataArticle:Data-artikkeli` +
        ': </strong>' +
        $localize`:@@dataArticleTooltip:sisältää ns. data journals -julkaisuissa ilmestyneet, tutkimusaineistoja kuvailevat artikkelit.` +
        '<p><strong>' +
        $localize`:@@otherArticle:Muu artikkeli` +
        ': </strong>' +
        $localize`:@@otherArticleTooltip:sisältää muihin luokkiin kuulumattomat artikkelit.`,
    },
    {
      field: 'peerReviewed',
      label: $localize`:@@peerReviewedFilter:Vertaisarvioitu`,
      hasSubFields: false,
      open: false,
      tooltip: $localize`:@@peerReviewedTooltip:Tieteellisten julkaisujen vertaisarvioinnilla tarkoitetaan menettelyä, jossa tutkimustuloksia julkaiseva lehti, konferenssi tai kirjakustantaja pyytää tieteenalan asiantuntijoita suorittamaan ennakkoarvion julkaistavaksi tarjottujen käsikirjoitusten tieteellisestä julkaisukelpoisuudesta.`,
    },
    {
      field: 'countryCode',
      label: $localize`:@@publisherInternationality:Kustantajan kansainvälisyys`,
      hasSubFields: false,
      open: true,
      tooltip: $localize`:@@pCountryFTooltip:Kotimaisen julkaisun kustantaja on suomalainen tai se on ensisijaisesti julkaistu Suomessa. Kansainvälisen julkaisun kustantaja ei ole suomalainen tai se on ensisijaisesti julkaistu muualla kuin Suomessa.`,
    },
    {
      field: 'lang',
      label: $localize`:@@language:Kieli`,
      hasSubFields: false,
      open: true,
      tooltip: $localize`:@@pLangFTooltip:Kieli, jolla julkaisu on kirjoitettu.`,
    },
    {
      field: 'juFo',
      label: $localize`:@@jufoLevel:Julkaisufoorumitaso`,
      hasSubFields: false,
      open: true,
      tooltip: $localize`:@@pJufoFTooltip:Julkaisufoorumin (www.julkaisufoorumi.fi) mukainen julkaisukanavan (kirjakustantaja, konferenssi tai julkaisusarja) tasoluokitus: 1 = perustaso, 2 = johtava taso, 3 = korkein taso. Tasolla 0 ovat kanavat, jotka eivät joltain osin täytä tason 1 vaatimuksia tai ovat uusia. Julkaisufoorumitaso määräytyy julkaisun julkaisuvuoden mukaan.`,
    },
    {
      field: 'openAccess',
      label: $localize`:@@openAccess:Avoin saatavuus`,
      hasSubFields: false,
      open: true,
      tooltip:
        '<p><strong>' +
        $localize`:@@openAccessPublicationChannel:Open access -julkaisukanava` +
        ': </strong>' +
        $localize`Julkaisu on ilmestynyt julkaisukanavassa, jonka kaikki julkaisut ovat avoimesti saatavilla.` +
        '</p><p><strong>' +
        $localize`:@@selfArchived:Rinnakkaistallennettu` +
        ': </strong>' +
        $localize`Julkaisu on tallennettu organisaatio- tai tieteenalakohtaiseen julkaisuarkistoon joko välittömästi tai kustantajan määrittämän kohtuullisen embargoajan jälkeen.` +
        '</p><p><strong>' +
        $localize`:@@otherOpenAccess:Muu avoin saatavuus` +
        ': </strong>' +
        $localize`Julkaisu on avoimesti saatavilla, mutta se on ilmestynyt ns. hybridijulkaisukanavassa, jossa kaikki muut julkaisut eivät ole avoimesti saatavilla.` +
        '</p>',
    },
  ];

  singleFilterData = [
    {
      field: 'internationalCollaboration',
      label: $localize`:@@intCoPublication:Kansainvälinen yhteisjulkaisu`,
      tooltip: $localize`:@@intCoPublicationTooltip:Julkaisussa on tekijöitä myös muualta kuin suomalaisista tutkimusorganisaatioista.`,
    },
    {
      field: 'okmDataCollection',
      label: $localize`:@@okmDataCollection:Julkaisu kuuluu opetus- ja kulttuuriministeriön tiedonkeruuseen`,
      tooltip: $localize`:@@okmDataCollectionTooltip:OKM:n tiedonkeruuseen kuuluvat julkaisut ovat korkeakoulujen, tutkimuslaitosten ja yliopistosairaaloiden vuosittain opetus- ja kulttuuriministeriölle raportoimia julkaisuja, jotka täyttävät julkaisutiedonkeruun vaatimukset (www.tiedonkeruu.fi) ja jotka huomioidaan mm. korkeakoulujen rahoitusmallissa.`,
    },
  ];

  constructor(
    private filterMethodService: FilterMethodService,
    private staticDataService: StaticDataService
  ) {}

  shapeData(data, activeFilters?) {
    const source = data.aggregations;
    // Year
    source.year.buckets = this.mapYear(source.year.years.buckets);
    // Organization & sector
    source.organization = this.organization(source.organization, activeFilters);
    // Field of science
    source.field.buckets = this.minorField(
      source.field.fields.buckets.filter(
        (item) => item.filtered.filterCount.doc_count > 0
      )
    );
    // Publication Type
    source.publicationType.buckets = this.separatePublicationClass(
      source.publicationType.publicationTypes.buckets
    );
    source.publicationFormat.buckets = this.mapKey(
      source.publicationFormat.publicationFormats.buckets
    );
    source.publicationAudience.buckets = this.mapKey(
      source.publicationAudience.publicationAudiences.buckets
    );
    source.parentPublicationType.buckets = this.mapKey(
      source.parentPublicationType.parentPublicationTypes.buckets
    );
    source.articleType.buckets = this.articleType(
      source.articleType.articleTypes.buckets
    );
    source.peerReviewed.buckets = this.mapKey(
      source.peerReviewed.peerReviewedValues.buckets
    );
    // Country code
    source.countryCode.buckets = this.publicationCountry(
      source.countryCode.countryCodes.buckets
    );
    // Language code
    source.lang.buckets = this.lang(source.lang.langs.buckets);
    // Jufo code
    source.juFo.buckets = this.juFoCode(source.juFo.juFoCodes.buckets);
    // Open access
    source.openAccess.buckets = this.openAccess(
      source.selfArchived.selfArchivedCodes.buckets,
      source.oaPublisherComposite.buckets
    );
    // International collaboration
    source.internationalCollaboration.buckets = this.getSingleAmount(
      source.internationalCollaboration.internationalCollaborationCodes.buckets
    );
    // MinEdu data collection
    source.okmDataCollection.buckets = this.getOkmCollectedAmount(
      source.okmDataCollection.publicationStatusCodes.buckets
    );
    source.shaped = true;
    return source;
  }

  organization(data, activeFilters?) {
    const source = cloneDeep(data) || [];
    source.buckets = source.sectorName ? source.sectorName.buckets : [];
    source.buckets.forEach((item) => {
      item.subData = item.organization.org.buckets.filter(
        (x) => x.filtered.filterCount.doc_count > 0
      );
      item.subData.map((subItem) => {
        subItem.label = subItem.label || subItem.key;
        subItem.key = subItem.orgId.buckets[0].key;
        subItem.doc_count = subItem.filtered.filterCount.doc_count;
      });
      item.doc_count = item.subData
        .map((s) => s.doc_count)
        .reduce((a, b) => a + b, 0);
    });

    // Sort based on sector id
    source.buckets = source.buckets.sort(
      (a, b) => a.sectorId.buckets[0].key - b.sectorId.buckets[0].key
    );

    // Filter organizations when targeted search for subunits
    // ie. single-organization > navigate from sub units tab.
    // When subunit search is active, display only sector that
    // includes selected subunit.
    if (activeFilters?.target === 'subUnitID' && activeFilters?.organization) {
      const organizationParam = activeFilters.organization;
      const orgId =
        typeof organizationParam === 'string'
          ? organizationParam
          : organizationParam[0];
      const buckets = source.sectorName.buckets;
      const sector = buckets.findIndex((sector) =>
        sector.subData.find((org) => org.key === orgId)
      );

      const activeSector = source.sectorName.buckets[sector];

      activeSector.subData = activeSector.subData.filter(
        (org) => org.key === orgId
      );

      source.buckets = source.buckets.filter(
        (sector) => sector.key === activeSector.key
      );
    }

    return source;
  }

  mapYear(data) {
    const clone = cloneDeep(data);
    clone.map((item) => {
      item.key = item.key.toString();
    });
    return clone;
  }

  mapKey(data) {
    const clone = cloneDeep(data);
    clone.map((item) => {
      item.label = item.label || item.key;
      item.key =
        typeof item.id.buckets[0].key === 'number'
          ? item.id.buckets[0].key.toString()
          : item.id.buckets[0].key;
    });
    return clone;
  }

  minorField(data) {
    if (data.length) {
      // check if major aggregation is available
      const combinedMajorFields = data.length
        ? this.filterMethodService.separateMinor(data ? data : [])
        : [];

      const result = cloneDeep(this.staticDataService.majorFieldsOfScience);

      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (result[i]) {
          result[i].subData = combinedMajorFields[i];
          // Add doc counts to major fields of science
          result[i].doc_count = result[i].subData
            .map((x) => x.doc_count)
            .reduce((a, b) => a + b, 0);
        }
      }

      return [...result.filter((item) => item.subData.length > 0)];
    }
  }

  separatePublicationClass(data) {
    const source = data[0] ? data : [];
    let combined = [];
    if (source && source.length > 0) {
      source.forEach((val) => combined.push(val.key.substring(0, 1)));
      combined.filter((v, i, a) => a.indexOf(v) === i);
    }
    combined = [...new Set(combined)];
    const staticData = this.staticDataService.publicationClass;

    // Check that no unknows publication types are handled
    const classList = staticData.map((item) => item.class);

    combined = combined.filter((val) => classList.includes(val));

    // Map items for subData
    const result = combined.map(
      (x) =>
        (x = {
          key: x + ' ' + staticData.find((item) => item.class === x).label,
          doc_count: 0,
          subData: staticData
            .find((item) => item.class === x)
            .types.map(
              (type) =>
                (type = {
                  type: type.type,
                  label: type.type + ' ' + type.label,
                  key: type.type,
                  doc_count: data.find((doc) => doc.key === type.type)
                    ? data.find((doc) => doc.key === type.type).doc_count
                    : 0,
                })
            ),
        })
    );

    // Get higher level doc counts for visualisation
    result.forEach(
      (x) =>
        (x.doc_count = x.subData
          .map((a) => a.doc_count)
          .reduce((a, b) => a + b, 0))
    );

    // Filter items with doc counts
    result.map(
      (x) => (x.subData = x.subData.filter((item) => item.doc_count > 0))
    );

    return result;
  }

  publicationCountry(data) {
    let countryCodes: {
      key: number | string;
      doc_count: number;
      label?: string;
      value?: number | string;
    }[] = [...data];

    // There should only be 3 different publication country options, Finnish, Other and Unknown
    // 0 is for Finnish publications
    // 9 is for unknown data
    // Other codes are labeled as othher countires and these should be combined as single item with summed doc counts

    const otherPublications = data.filter(
      (item) => item.key > 0 && item.key < 9
    );

    if (otherPublications.length > 1) {
      countryCodes = countryCodes.filter(
        (code) => code.key === 0 || code.key === 9
      );
      countryCodes.push({
        key: 1,
        doc_count: otherPublications.reduce(
          (acc, value) => value.doc_count + acc.doc_count
        ),
      });
    }

    // Add labels for country codes
    const result = countryCodes
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map(
        (item) =>
          (item = {
            key: 'c' + item.key,
            label:
              item.key === 0
                ? $localize`:@@finland:Kotimainen`
                : item.key === 9
                ? $localize`:@@notSpecified:Ei tietoa`
                : $localize`:@@other:Kansainvälinen`,
            doc_count: item.doc_count,
            value: item.key,
          })
      );

    return result;
  }

  articleType(data) {
    const staticData = this.staticDataService.articleType;
    const result = data.map(
      (item) =>
        (item = {
          key: item.key,
          label: staticData.find((x) => item.key === x.id).label,
          doc_count: item.doc_count,
          value: item.key,
        })
    );
    return result.sort((a, b) => b.doc_count - a.doc_count);
  }

  juFoCode(data) {
    const staticData = this.staticDataService.juFoCode;
    const result = data.map(
      (item) =>
        (item = {
          // label: staticData.find(code => code.key === item.key) ? staticData.find(code => code.key === item.key).label : '',
          label: item.key === ' ' ? $localize`:@@noInfo:Ei tietoa` : item.key,
          key: item.key === ' ' ? 'noVal' : 'j' + item.key,

          doc_count: item.doc_count,
          value: item.key,
        })
    );
    return result;
  }

  lang(data) {
    if (data && data[0]?.language) {
      let result = data.map(
        (item) =>
          (item = {
            label:
              item.language.buckets[0]?.key !== 'undefined'
                ? item.language.buckets[0]?.key
                : $localize`:@@notKnown:Ei tiedossa`,
            key: item.key.toLowerCase(),
            doc_count: item.doc_count,
          })
      );
      result = result.filter((item) => item.key !== ' ');
      return result;
    }
  }

  openAccess(selfArchived, publisherComposite) {
    let openAccessCodes = [];
    const result = [];

    // Filter also based on selfArchived === 0 for non open
    publisherComposite
      .filter(
        (x) =>
          x.key.selfArchived === 0 &&
          x.key.openAccess === 0 &&
          x.key.publisherOpenAccess !== 3
      )
      .forEach((x) => {
        openAccessCodes.push({
          key: 'nonOpenAccess',
          doc_count: x.filtered.doc_count,
        });
      });

    if (publisherComposite && publisherComposite.length > 0) {
      publisherComposite.forEach((val) => {
        val.stringKey = '' + val.key.openAccess + val.key.publisherOpenAccess;

        switch (val.stringKey) {
          case '11': {
            openAccessCodes.push({
              key: 'openAccess',
              doc_count: val.filtered.doc_count,
            });
            break;
          }
          case '03':
          case '13': {
            openAccessCodes.push({
              key: 'delayedOpenAccess',
              doc_count: val.filtered.doc_count,
            });
            break;
          }
          case '12': {
            openAccessCodes.push({
              key: 'otherOpen',
              doc_count: val.filtered.doc_count,
            });
            break;
          }
          // Separate implementation above for non open, add with 0 doc count so no doubles
          case '00':
          case '01':
          case '02':
          case '09': {
            openAccessCodes.push({
              key: 'nonOpenAccess',
              doc_count: 0,
            });
            break;
          }
          default: {
            // Self archived is not unknown
            if (!val.key.selfArchived) {
              openAccessCodes.push({
                key: 'noOpenAccessData',
                doc_count: val.filtered.doc_count,
              });
            }
            break;
          }
        }
      });
    }

    if (selfArchived && selfArchived.length > 0) {
      selfArchived.forEach((val) => {
        switch (val.key) {
          case 1: {
            openAccessCodes.push({
              key: 'selfArchived',
              doc_count: val.doc_count,
            });
            break;
          }
        }
      });
    }
    // Get duplicate values and sum doc counts
    const reduce = openAccessCodes.reduce((item, val) => {
      const sum = item
        .filter((obj) => {
          return obj.key === val.key;
        })
        .pop() || { key: val.key, doc_count: 0 };

      sum.doc_count += val.doc_count;
      item.push(sum);
      return item;
    }, []);

    // Remove duplicates
    openAccessCodes = [...new Set(reduce)];
    function docCount(key) {
      return openAccessCodes.find((item) => item.key === key).doc_count;
    }
    // Push items by key
    if (openAccessCodes.some((e) => e.key === 'openAccess')) {
      result.push({
        key: 'openAccess',
        doc_count: docCount('openAccess'),
        label: $localize`:@@openAccessPublicationChannel:Open Access -julkaisukanava`,
      });
    }
    if (openAccessCodes.some((e) => e.key === 'selfArchived')) {
      result.push({
        key: 'selfArchived',
        doc_count: docCount('selfArchived'),
        label: $localize`:@@selfArchived:Rinnakkaistallennettu`,
      });
    }
    if (openAccessCodes.some((e) => e.key === 'delayedOpenAccess')) {
      result.push({
        key: 'delayedOpenAccess',
        doc_count: docCount('delayedOpenAccess'),
        label: $localize`:@@delayedOpenAccess:Viivästetty avoin saatavuus`,
      });
    }
    if (openAccessCodes.some((e) => e.key === 'otherOpen')) {
      result.push({
        key: 'otherOpen',
        doc_count: docCount('otherOpen'),
        label: $localize`:@@otherOpenAccess:Muu avoin saatavuus`,
      });
    }

    if (openAccessCodes.some((e) => e.key === 'nonOpenAccess')) {
      result.push({
        key: 'nonOpenAccess',
        doc_count: docCount('nonOpenAccess'),
        label: $localize`:@@nonOpen:Ei avoin`,
      });
    }

    if (openAccessCodes.some((e) => e.key === 'noOpenAccessData')) {
      result.push({
        key: 'noOpenAccessData',
        doc_count: docCount('noOpenAccessData'),
        label: $localize`:@@noInfo:Ei tietoa`,
      });
    }
    return result;
  }

  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter((x) => x.key === 1);
    }
  }

  getOkmCollectedAmount(data: any[]) {
    // Filter correct buckets
    const trueSelection = data.filter((x) => ['1', '2', '9'].includes(x.key));
    // Combine doc_count into single object
    const reduced = trueSelection.reduce(
      (curr, next) => {
        curr.doc_count += next.doc_count;
        return curr;
      },
      { key_as_string: 'true', doc_count: 0 }
    );
    return [reduced];
  }
}
