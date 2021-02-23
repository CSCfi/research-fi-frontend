//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { VisualQuery } from '../models/visualisation/visualisations.model';
import * as d3 from 'd3';

interface Target {
  value: string;
  viewValueFi: string;
  viewValueEn: string;
  viewValueSv: string;
}

@Injectable({
  providedIn: 'root',
})
export class StaticDataService {
  // Filters, Fields of study
  majorFieldsOfScience = [
    {
      id: 1,
      key: $localize`:@@naturalSciences:Luonnontieteet`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
    {
      id: 2,
      key: $localize`:@@engineeringTecnology:Tekniikka`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
    {
      id: 3,
      key: $localize`:@@medicalHealthSciences:Lääke- ja terveystieteet`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
    {
      id: 4,
      key: $localize`:@@agriculturalSciences:Maatalous- ja metsätieteet`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
    {
      id: 5,
      key: $localize`:@@socialSciences:Yhteiskuntatieteet`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
    {
      id: 6,
      key: $localize`:@@humanities:Humanistiset tieteet`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
    {
      id: 9,
      key: $localize`:@@otherSciences:Muut tieteet`,
      checked: false,
      subData: [],
      doc_count: 0,
    },
  ];

  // Filters, Publication class
  publicationClass = [
    {
      id: 1,
      class: 'A',
      label: $localize`Vertaisarvioidut tieteelliset artikkelit`,
      types: [
        {
          type: 'A1',
          label: $localize`Alkuperäisartikkeli tieteellisessä aikakauslehdessä`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'A2',
          label: $localize`Katsausartikkeli tieteellisessä aikakauslehdessä`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'A3',
          label: $localize`Kirjan tai muun kokoomateoksen osa`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'A4',
          label: $localize`Artikkeli konferenssijulkaisussa`,
          key: '',
          doc_count: 0,
        },
      ],
      checked: false,
    },
    {
      id: 2,
      class: 'B',
      label: $localize`Vertaisarvioimattomat tieteelliset kirjoitukset`,
      types: [
        {
          type: 'B1',
          label: $localize`Kirjoitus tieteellisessä aikakauslehdessä`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'B2',
          label: $localize`Kirjan tai muun kokoomateoksen osa`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'B3',
          label: $localize`Vertaisarvioimaton artikkeli konferenssijulkaisussa`,
          key: '',
          doc_count: 0,
        },
      ],
      checked: false,
    },
    {
      id: 3,
      class: 'C',
      label: $localize`Tieteelliset kirjat (monografiat)`,
      types: [
        {
          type: 'C1',
          label: $localize`Kustannettu tieteellinen erillisteos`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'C2',
          label: $localize`Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero`,
          key: '',
          doc_count: 0,
        },
      ],
      checked: false,
    },
    {
      id: 4,
      class: 'D',
      label: $localize`Ammattiyhteisölle suunnatut julkaisut`,
      types: [
        {
          type: 'D1',
          label: $localize`Artikkeli ammattilehdessä`,
          key: '',
          doc_count: 0,
        },
        // tslint:disable-next-line: max-line-length
        {
          type: 'D2',
          label: $localize`Artikkeli ammatillisessa käsi- tai opaskirjassa, ammatillisessa tietojärjestelmässä tai oppikirja-aineisto`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'D3',
          label: $localize`Artikkeli ammatillisessa konferenssijulkaisussa`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'D4',
          label: $localize`Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'D5',
          label: $localize`Oppikirja, ammatillinen käsi- tai opaskirja taikka sanakirja`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'D6',
          label: $localize`Toimitettu ammatillinen teos`,
          key: '',
          doc_count: 0,
        },
      ],
      checked: false,
    },
    {
      id: 5,
      class: 'E',
      label: $localize`Suurelle yleisölle suunnatut julkaisut`,
      types: [
        {
          type: 'E1',
          label: $localize`Yleistajuinen artikkeli, sanomalehtiartikkeli`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'E2',
          label: $localize`Yleistajuinen monografia`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'E3',
          label: $localize`Toimitettu yleistajuinen teos`,
          key: '',
          doc_count: 0,
        },
      ],
      checked: false,
    },
    {
      id: 6,
      class: 'F',
      label: $localize`Julkinen taiteellinen ja taideteollinen toiminta`,
      types: [
        {
          type: 'F1',
          label: $localize`Erillisjulkaisu`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'F2',
          label: $localize`Julkinen taiteellinen teoksen osatoteutus`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'F3',
          label: $localize`Ei-taiteellisen julkaisun taiteellinen osa`,
          key: '',
          doc_count: 0,
        },
      ],
      checked: false,
    },
    {
      id: 7,
      class: 'G',
      label: $localize`Opinnäytteet`,
      types: [
        {
          type: 'G1',
          label: $localize`:@@gBachelor:Ammattikorkeakoulututkinnon opinnäytetyö, kandidaatintyö`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'G2',
          label: $localize`:@@gMaster:Pro gradu, diplomityö, ylempi amk-opinnäytetyö`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'G3',
          label: $localize`:@@gLicenciate:Lisensiaatintyö`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'G4',
          label: $localize`:@@gMonograph:Monografiaväitöskirja`,
          key: '',
          doc_count: 0,
        },
        {
          type: 'G5',
          label: $localize`:@@gArticle:Artikkeliväitöskirja`,
          key: '',
          doc_count: 0,
        },
      ],
    },
  ];

  targets: Target[] = [
    {
      value: 'all',
      viewValueFi: 'Koko sisältö',
      viewValueEn: 'All content',
      viewValueSv: 'Alla innehåll',
    },
    {
      value: 'name',
      viewValueFi: 'Henkilön nimi',
      viewValueEn: 'Person name',
      viewValueSv: 'Person namn',
    },
    {
      value: 'title',
      viewValueFi: 'Otsikko',
      viewValueEn: 'Title',
      viewValueSv: 'Titel',
    },
    {
      value: 'keywords',
      viewValueFi: 'Avainsanat',
      viewValueEn: 'Keywords',
      viewValueSv: 'Nyckelord',
    },
    {
      value: 'organization',
      viewValueFi: 'Organisaatio',
      viewValueEn: 'Organization',
      viewValueSv: 'Organisation',
    },
    {
      value: 'funder',
      viewValueFi: 'Rahoittaja',
      viewValueEn: 'Funder',
      viewValueSv: 'Finansiären',
    },
  ];

  juFoCode = [
    { key: '3', label: $localize`Korkein taso` },
    { key: '2', label: $localize`Johtava taso` },
    { key: '1', label: $localize`Perustaso` },
    { key: '0', label: $localize`:@@other:Muut` },
    { key: ' ', label: $localize`:@@noRating:Ei arviota` },
  ];

  // Query parameters
  minScore = 10;

  httpErrors = {
    400: $localize`HTTP pyyntöä ei voitu käsitellä`,
    401: $localize`Pyyntö vaatii sen käsittelyyn oikeutetut tunnukset`,
    403: $localize`Ei oikeutta käsitellä pyyntöä`,
    404: $localize`Haluttua tietoa ei ole olemassa`,
    405: $localize`:@@forbiddenRequest:Pyyntömetodi ei ole sallittu`,
    500: $localize`Palvelinvirhe. Palvelimella tapahtui virhe pyyntöä käsitellessä`,
  };

  constructor() {}

  // Query fields where exact match isn't needed
  queryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = [
          'publicationName^2',
          'publicationYear',
          'authorsText',
          'journalName',
          'conferenceName',
          'parentPublicationName',
          'parentPublicationPublisher',
          'publisherName',
          'publisherLocation',
          'doi',
          'doiHandle',
          'greenOpenAccessAddress',
          'fields_of_education',
          'issn',
          'issn2',
          'isbn',
          'isbn2',
          'keywords.keyword',
          'jufoCode',
          'jufoClassCode',
          'fields_of_science.nameFiScience',
          'fields_of_science.nameEnScience',
          'fields_of_science.nameSvScience',
        ];
        break;
      }
      case 'person': {
        res = ['firstName', 'lastName'];
        break;
      }
      case 'funding': {
        res = [
          'projectNameFi^2',
          'projectNameEn^2',
          'projectNameSv^2',
          'projectAcronym',
          'projectDescriptionFi',
          'projectDescriptionEn',
          'projectDescriptionSv',
          'fundingStartYear',
          'fundingContactPersonLastName',
          'fundingContactPersonFirstNames',
          'funderNameFi',
          'funderNameEn',
          'funderNameSv',
          'funderNameUnd',
          '',
          'typeOfFundingId',
          'typeOfFundingNameFi',
          'typeOfFundingNameEn',
          'typeOfFundingNameSv',
          'callProgrammeNameFi',
          'callProgrammeNameEn',
          'callProgrammeNameSv',
          'callProgrammeHomepage',
          'callProgrammeUnd',
          'funderProjectNumber',
          'keywords.keyword',
          'keyword.scheme',
          'fundedNameFi',
          'funderNameFi',
        ];
        break;
      }
      case 'dataset': {
        res = [
          'nameFi^2',
          'nameEn^2',
          'nameSv^2',
          'descriptionFi',
          'descriptionEn',
          'descriptionSv',
          'datasetCreated',
          'actor.sector.organizationNameFi',
          'actor.sector.organizationNameEn',
          'actor.sector.organizationNameSv',
          'actor.sector.organization.organizationUnitNameFi',
          'actor.sector.organization.organizationUnitNameEn',
          'actor.sector.organization.organizationUnitNameSv',
          'actor.sector.organization.organizationUnit.person.authorFullName',
          'fieldsOfScience.nameFiScience',
          'fieldsOfScience.nameEnScience',
          'fieldsOfScience.nameSvScience',
          'identifier',
          'accessType',
          'keywords.keyword',
          'dataCatalog.identifier',
          'dataCatalog.nameFi',
          'dataCatalog.nameEn',
          'dataCatalog.nameSv',
          'fairdataUrl',
        ];
        break;
      }
      case 'infrastructure': {
        res = [
          'nameFi^2',
          'nameEn^2',
          'nameSv^2',
          'descriptionFi',
          'descriptionEn',
          'descriptionSv',
          'scientificDescription',
          'startYear',
          'acronym',
          'responsibleOrganizationNameFi',
          'responsibleOrganizationNameEn',
          'responsibleOrganizationNameSv',
          'keywords.keyword',
          'services.serviceName',
          'services.serviceDescription',
          'services.serviceType',
          'services.servicePointName',
          'services.serviceAcronym',
          'services.servicePointEmailAddress',
          'services.servicePointInfoUrl',
          'services.servicePointPhoneNumber',
          'services.servicePointVisitingAddress',
        ];
        break;
      }
      case 'organization': {
        res = [
          'nameFi^2',
          'nameEn^2',
          'nameSv^2',
          'variantNames',
          'organizationBackground',
          'predecessors.nameFi',
          'related',
          'homepage',
          'visitingAddress',
          'businessId',
          'subUnits',
        ];
        break;
      }
      case 'news': {
        res = ['newsHeadline', 'newsContent', 'organizationNameFi'];
        break;
      }
    }
    return res;
  }

  nestedQueryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = [
          'author.nameFiSector',
          'author.organization.OrganizationNameFi',
          'author.organization.OrganizationNameEn',
          'author.organization.OrganizationNameSv',
          'author.organization.organizationUnit.organizationUnitNameFi',
          'author.organization.organizationUnit.organizationUnitNameEn',
          'author.organization.organizationUnit.organizationUnitNameSv',
          'author.organization.organizationUnit.person.authorFirstNames',
          'author.organization.organizationUnit.person.authorLastName',
          'author.organization.organizationUnit.person.Orcid',
        ];
        break;
      }
      case 'funding': {
        res = [
          'organizationConsortium.consortiumOrganizationNameFi',
          'organizationConsortium.consortiumOrganizationNameEn',
          'organizationConsortium.consortiumOrganizationNameSv',
          'organizationConsortium.roleInConsortium',
          'fundingGroupPerson.fundingGroupPersonFirstNames',
          'fundingGroupPerson.fundingGroupPersonLastName',
          'fundingGroupPerson.consortiumOrganizationBusinessId',
          'fundingGroupPerson.consortiumOrganizationNameFi',
          'fundingGroupPerson.consortiumOrganizationNameEn',
          'fundingGroupPerson.consortiumOrganizationNameSv',
          'fundingGroupPerson.roleInFundingGroup',
          'fundingGroupPerson.consortiumProject',
        ];
      }
    }
    return res;
  }

  relatedFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = [''];
        break;
      }
      case 'person': {
        res = ['firstName', 'lastName'];
        break;
      }
      case 'funding': {
        res = ['funderBusinessId.pid_content'];
        break;
      }
      case 'dataset': {
        res = [''];
        break;
      }
      case 'infrastructure': {
        res = ['responsibleOrganization.TKOppilaitosTunnus'];
        break;
      }
      case 'organization': {
        res = [''];
        break;
      }
      case 'news': {
        res = [''];
        break;
      }
    }
    return res;
  }

  nestedRelatedFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = ['author.organization.organizationId'];
        break;
      }
      case 'funding': {
        res = [
          'organizationConsortium.consortiumOrganizationId',
          'fundingGroupPerson.consortiumOrganizationId',
        ];
      }
    }
    return res;
  }

  targetFields(target, index) {
    let res = [];
    switch (target) {
      case 'name': {
        switch (index) {
          case 'publication': {
            res = ['authorsText'];
            break;
          }
          case 'funding': {
            res = [
              'fundingContactPersonLastName',
              'fundingContactPersonFirstNames',
            ];
            break;
          }
          case 'dataset': {
            res = ['creatorsText'];
            break;
          }
          case 'infrastructure': {
            res = [''];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      case 'title': {
        switch (index) {
          case 'publication': {
            res = ['publicationName'];
            break;
          }
          case 'funding': {
            res = [
              'projectNameFi',
              'projectNameSv',
              'projectNameEn',
              'projectAcronym',
            ];
            break;
          }
          case 'dataset': {
            res = [
              'nameFi',
              'nameSv',
              'nameEn',
            ];
            break;
          }
          case 'infrastructure': {
            res = [
              'nameFi',
              'nameSv',
              'nameEn',
              'acronym',
              'services.serviceName',
              'services.serviceAcronym',
            ];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      case 'keywords': {
        switch (index) {
          case 'publication': {
            res = ['keywords.keyword'];
            break;
          }
          case 'funding': {
            res = ['keywords.keyword'];
            break;
          }
          case 'dataset': {
            res = ['keywords.keyword'];
            break;
          }
          case 'infrastructure': {
            res = ['keywords.keyword'];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      case 'organization': {
        switch (index) {
          case 'publication': {
            res = [''];
            break;
          }
          case 'funding': {
            res = [''];
            break;
          }
          case 'dataset': {
            res = [
              'actors.sector.organizationNameFi',
              'actors.sector.organizationNameEn',
              'actors.sector.organizationNameSv',
            ];
            break;
          }
          case 'infrastructure': {
            res = [
              'responsibleOrganizationNameFi',
              'responsibleOrganizationNameEn',
              'responsibleOrganizationNameSv',
            ];
            break;
          }
          case 'organization': {
            res = ['nameFi', 'nameEn', 'nameSv', 'variantNames'];
            break;
          }
        }
        break;
      }
      case 'funder': {
        switch (index) {
          case 'publication': {
            res = [''];
            break;
          }
          case 'funding': {
            res = [
              'funderNameFi',
              'funderNameEn',
              'funderNameSv',
              'funderNameUnd',
            ];
            break;
          }
          case 'dataset': {
            res = [''];
            break;
          }
          case 'infrastructure': {
            res = [''];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
        break;
      }
      default: {
        switch (index) {
          case 'publication': {
            res = [target];
            break;
          }
          case 'funding': {
            res = [''];
            break;
          }
          case 'dataset': {
            res = [''];
            break;
          }
          case 'infrastructure': {
            res = [''];
            break;
          }
          case 'organization': {
            res = [''];
            break;
          }
        }
      }
    }

    return res;
  }

  targetNestedQueryFields(target, index) {
    let res = [];
    switch (target) {
      case 'name': {
        switch (index) {
          case 'publication': {
            res = [
              'author.organization.organizationUnit.person.authorFirstNames',
              'author.organization.organizationUnit.person.authorLastName',
              'author.organization.organizationUnit.person.Orcid',
            ];
            break;
          }
          case 'funding': {
            res = [
              'fundingGroupPerson.fundingGroupPersonFirstNames',
              'fundingGroupPerson.fundingGroupPersonLastName',
            ];
            break;
          }
        }
        break;
      }
      case 'organization': {
        switch (index) {
          case 'publication': {
            res = [
              'author.organization.OrganizationNameFi',
              'author.organization.OrganizationNameEn',
              'author.organization.OrganizationNameSv',
            ];
            break;
          }
          case 'funding': {
            res = [
              'organizationConsortium.consortiumOrganizationNameFi',
              'organizationConsortium.consortiumOrganizationNameEn',
              'organizationConsortium.consortiumOrganizationNameSv',
              'fundingGroupPerson.consortiumOrganizationNameFi',
              'fundingGroupPerson.consortiumOrganizationNameEn',
              'fundingGroupPerson.consortiumOrganizationNameSv',
            ];
            break;
          }
        }
        break;
      }
    }
    return res;
  }

  // tslint:disable-next-line: member-ordering
  visualisationData: {
    locale: d3.FormatLocaleDefinition;
    publicationTooltipFi: string;
    publicationTooltipSv: string;
    publicationTooltipEn: string;
    fundingTooltipFi: string;
    fundingTooltipSv: string;
    fundingTooltipEn: string;
    publication: VisualQuery[];
    funding: VisualQuery[];
  } = {
    locale: {
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: ['', '€'],
    },
    // tslint:disable-next-line: max-line-length
    publicationTooltipFi:
      '<ul><li>Voit valita julkaisumäärien tarkasteluun teeman, jolloin näet julkaisujen jakautumisen vuosittain joko päätieteenalan, tieteenalan, organisaation, julkaisutyypin, avoimen saatavuuden, julkaisumaan tai julkaisufoorumitason mukaan.</li><li> Alla olevista valikoista voit rajata julkaisumääriin sisällytettäväksi haluamasi julkaisuvuodet, organisaatiot, tieteenalat jne. </li><li>Huom. Yksittäiseen julkaisuun voi liittyä useita tieteenaloja ja organisaatioita. Julkaisu näkyy kaikissa siihen liittyvissä tieteenaloissa ja organisaatioissa, kun hakua rajataan tieteenalan tai organisaation mukaan.</li><li>Lukumäärät sisältävät Tiedejatutkimus.fi-palvelun sisältämät julkaisut. Tiedot päivittyvät päivittäin. Varsinaisia vuositilastoja tieteestä ja tutkimuksesta löydät <a href="/science-innovation-policy/science-research-figures">Lukuja tieteestä ja tutkimuksesta -osiosta</a> sekä opetushallinnon tilastopalvelu <a href="https://vipunen.fi/fi-fi/korkeakoulutuksen-yhteiset-ja-tk-toiminta">Vipusesta <i class="fas fa-external-link-alt"></i></a>.</li></ul>',
    // tslint:disable-next-line: max-line-length
    publicationTooltipSv:
      '<ul><li>Efter du har valt ett tema för att visa antalet publikationer, kan du undersöka den årliga distributionen av publikationer enligt huvudvetenskapsområde, vetenskapsområde, organisation, publikationstyp, öppen tillgång, publiceringsland eller publikationsforumsnivå.</li><li>Använd menyerna nedan för att begränsa antalet publikationer som ska visas efter publiceringsår, organisationer, vetenskapsområden osv.</li><li>Obs. En publikation kan ha flera vetenskapsområden och organisationer. Publikationen visas i alla relaterade vetenskapsområden och organisationer när man begränser sökningen av vetenskapsområde eller organisation.</li><li>Siffrorna inkluderar publikationer i forskning.fi-tjänsten. Informationen uppdateras dagligen. Egentliga årliga statistiken om vetenskap och forskning hittar du både i avsnittet <a href="/science-innovation-policy/science-research-figures">Siffror om vetenskap och forskning</a> och från utbildningsförvaltningens statistiktjänst <a href="https://vipunen.fi/sv-fi/h%C3%B6gskoleutbildning-och-fou-verksamhet">Vipunen <i class="fas fa-external-link-alt"></i></a>.</li></ul>',
    // tslint:disable-next-line: max-line-length
    publicationTooltipEn:
      '<ul><li>You can select a theme to view the number of publications, in which case you can see the annual distribution of publications by field of science, main field of science, organization, publication type, open access, publication country, or publication forum level.</li><li>You can filter the number of publications to include the publication years, organizations, fields of science, etc. from the menus below.</li><li>NB. A publication can link to multiple fields of science and organizations. The publication will show in all related fields of science and organizations when the search is filtered by field of science or organization.</li><li>The numbers include the publications included in the Research.fi service. They are updated daily as new publications are added to the service. You can find the actual annual statistics on science and research in the <a href="/science-innovation-policy/science-research-figures">‘Figures on science and research’ section</a> and from <a href="https://vipunen.fi/en-gb/higher-education-and-r-d-activity">Vipunen <i class="fas fa-external-link-alt"></i></a> - the statistical portal of the Finnish education administration.</li></ul>',
    // tslint:disable-next-line: max-line-length
    fundingTooltipFi:
      '<ul><li>Voit valita hankemäärien tarkasteluun teeman, jolloin näet hankkeiden jakautumisen vuosittain joko rahoittajan, organisaation, rahoitusmuodon tai tieteenalan mukaan.</li><li>Alla olevista valikoista voit rajata hankkeiden lukumääriin sisällytettäväksi haluamasi vuodet, organisaatiot, rahoittajat jne.</li><li>Huom. Yksittäiseen hankkeeseen voi liittyä useita tieteenaloja ja organisaatioita. Hanke näkyy kaikissa siihen liittyvissä tieteenaloissa ja organisaatioissa, kun hakua rajataan lukumäärän tai myöntösumman mukaan.</li><li>Lukumäärät sisältävät Tiedejatutkimus.fi-palvelun sisältämät hankkeet. Ne päivittyvät jatkuvasti, kun palveluun lisätään uusia hankkeita. Varsinaisia vuositilastoja tieteestä ja tutkimuksesta löydät <a href="/science-innovation-policy/science-research-figures">Lukuja tieteestä ja tutkimuksesta -osiosta</a> sekä opetushallinnon tilastopalvelu <a href="https://vipunen.fi/fi-fi/korkeakoulutuksen-yhteiset-ja-tk-toiminta">Vipusesta <i class="fas fa-external-link-alt"></i></a>.</li></ul>',
    // tslint:disable-next-line: max-line-length
    fundingTooltipSv:
      '<ul><li>Efter du har valt ett tema för att visa antalet projekter, kan du undersöka den årliga distributionen av projekter enligt finansiär, organisation, typ av finansiering eller vetenskapsområde.</li><li>Använd menyerna nedan för att begränsa antalet projekter som ska visas efter år, organisationer, finansiärer osv.</li><li>Obs. En projekt kan ha flera vetenskapsområden och organisationer. Projekten visas i alla relaterade vetenskapsområden och organisationer när man begränser sökningen av antalet projekter eller det beviljade beloppet.</li><li>Siffrorna inkluderar projekter i Forskning.fi-tjänsten. Informationen uppdateras dagligen. Egentliga årliga statistiken om vetenskap och forskning hittar du både i avsnittet <a href="/science-innovation-policy/science-research-figures">Siffror om vetenskap och forskning</a> och från utbildningsförvaltningens statistiktjänst <a href="https://vipunen.fi/sv-fi/h%C3%B6gskoleutbildning-och-fou-verksamhet">Vipunen <i class="fas fa-external-link-alt"></i></a>.</li></ul>',
    // tslint:disable-next-line: max-line-length
    fundingTooltipEn:
      '<ul><li>You can select a theme to view the number of projects, in which case you can see the annual distribution of projects by funder, organization, funding instrument or field of science.</li><li>You can filter the number of projects to include the years, organizations, funders, etc. from the menus below.</li><li>NB: A project can be linked to multiple fields of science and organizations. In this case, the project will show in all related fields of science and organizations when the search is filtered by number of projects or granted amount.</li><li>The numbers include the projects included in the Research.fi service. They are updated daily as new projects are added to the service. You can find the actual annual statistics on science and research in the <a href="/science-innovation-policy/science-research-figures">‘Figures on science and research’ section</a> and from <a href="https://vipunen.fi/en-gb/higher-education-and-r-d-activity">Vipunen <i class="fas fa-external-link-alt"></i></a> - the statistical portal of the Finnish education administration.</li></ul>',
    publication: [
      {
        field: 'year',
        title: $localize`:@@publicationCountByYear:Julkaisujen määrä vuosittain`,
        select: $localize`:@@yearOfPublication:Julkaisuvuosi`,
        filter: 'year',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'publicationYear',
            name: 'year',
            size: 1,
            order: 0,
          },
        ],
      },
      {
        field: 'fieldOfScience',
        title: $localize`:@@publicationCountByFOS:Julkaisujen määrä tieteenaloittain`,
        select: $localize`:@@fieldOfScience:Tieteenala`,
        // tslint:disable-next-line: max-line-length
        message:
          'Huom. Yhdellä julkaisulla voi olla useita tieteenaloja. Julkaisu sisältyy tällöin jokaisen siihen liitetyn tieteenalan lukumäärään.',
        filter: 'field',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'fieldNested',
            nested: 'fieldsOfScience',
          },
          {
            field: 'fieldsOfScience.fieldIdScience',
            name: 'fieldId',
            size: 100,
            order: 1,
            filterName: 'field',
            exclude: [0],
          },
          {
            field: 'fieldsOfScience.name|locale|Science.keyword',
            name: 'fieldsOfScience',
            size: 1,
            order: 1,
            exclude: [' '],
          },
        ],
      },
      {
        field: 'majorFieldOfScience',
        title: $localize`:@@publicationCountByMajor:Julkaisujen määrä päätieteenaloittain`,
        select: $localize`:@@mainFieldOfScience:Päätieteenala`,
        // tslint:disable-next-line: max-line-length
        message:
          'Huom. Yhdellä julkaisulla voi olla useita tieteenaloja. Julkaisu sisältyy tällöin jokaisen siihen liitetyn tieteenalan lukumäärään.',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'fieldNested',
            nested: 'fieldsOfScience',
          },
          {
            field: 'fieldsOfScience.fieldIdScience',
            name: 'fieldId',
            size: 100,
            order: 0,
            filterName: 'field',
            exclude: [0],
          },
        ],
      },
      {
        field: 'organization',
        title: $localize`:@@publicationCountByOrg:Julkaisujen määrä organisaatioittain`,
        select: $localize`:@@organization:Organisaatio`,
        // tslint:disable-next-line: max-line-length
        message:
          'Huom. Yhdellä julkaisulla voi olla useita organisaatioita. Julkaisu sisältyy tällöin jokaisen siihen liitetyn organisaation lukumäärään',
        filter: 'organization',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'orgNested',
            nested: 'author',
          },
          {
            field: 'author.organization.organizationId.keyword',
            name: 'organizationId',
            size: 100,
            order: 2,
            filterName: 'organization',
          },
          {
            field: 'author.organization.OrganizationName|locale|.keyword',
            name: 'organizationName',
            size: 1,
            order: 0,
          },
        ],
      },
      {
        field: 'publicationType',
        title: $localize`:@@publicationCountByType:Julkaisujen määrä julkaisutyypin mukaan`,
        select: $localize`:@@publicationType:Julkaisutyyppi`,
        filter: 'publicationType',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'publicationTypeCode.keyword',
            name: 'publicationType',
            size: 100,
            order: 1,
            filterName: 'publicationType',
            exclude: [' '],
          },
        ],
      },
      {
        field: 'country',
        title: $localize`:@@publicationCountByCountry:Julkaisujen määrä julkaisumaan mukaan`,
        select: $localize`:@@publicationCountry:Julkaisumaa`,
        filter: 'countryCode',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'internationalPublication',
            name: 'country',
            size: 2,
            order: 1,
          },
        ],
      },
      {
        field: 'lang',
        title: $localize`:@@publicationCountByLang:Julkaisujen määrä kielen mukaan`,
        select: $localize`:@@language:Kieli`,
        filter: 'lang',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'languages.languageCode.keyword',
            name: 'lang',
            size: 50,
            order: 2,
            exclude: [' '],
          },
          {
            field: 'languages.language|locale|.keyword',
            name: 'language',
            size: 50,
            order: 0,
          },
        ],
      },
      {
        field: 'juFo',
        title: $localize`:@@publicationCountByJuFo:Julkaisujen määrä julkaisufoorumitason mukaan`,
        select: $localize`:@@jufoLevel:Julkaisufoorumitaso`,
        filter: 'juFo',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'jufoClassCode.keyword',
            name: 'juFo',
            size: 5,
            order: 2,
            exclude: [' '],
          },
        ],
      },
      {
        field: 'openAccess',
        title: $localize`:@@publicationCountByOA:Julkaisujen määrä avoimen saatavuuden mukaan`,
        select: $localize`:@@openAccess:Avoin saatavuus`,
        filter: 'openAccess',
        hierarchy: [
          {
            field: 'publicationYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            script:
              'doc["openAccessCode"].value * 10 + doc["selfArchivedCode"].value',
            name: 'openAccess',
            size: 50,
            order: 2,
          },
        ],
      },
    ],
    funding: [
      {
        field: 'year',
        title: $localize`:@@fundingCountByYear:Hankkeiden jakautuminen vuosittain`,
        select: $localize`:@@startYear:Aloitusvuosi`,
        filter: 'year',
        hierarchy: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          // "Redundant" aggregations for easier data handling
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 1,
            order: 0,
          },
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 1,
            order: 0,
          },
          {
            name: 'orgNested',
            nested: 'fundingGroupPerson',
          },
          {
            field: 'fundingGroupPerson.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'fundingGroupPerson.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
        hierarchy2: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 1,
            order: 0,
          },
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 1,
            order: 0,
          },
          {
            name: 'orgNested',
            nested: 'organizationConsortium',
          },
          {
            name: 'finnishOrganization',
            filter: {
              field: 'organizationConsortium.isFinnishOrganization',
              value: [1],
            },
          },
          {
            field: 'organizationConsortium.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'organizationConsortium.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
      },
      // Removed due to incorrect functionality
      // {
      //     field: 'amount',
      //     title: 'Myönnetty summa vuosittain',
      //     select: $localize`:@@fundingGranted:Myönnetty rahoitus`,
      //     hierarchy: [
      //         {
      //             field: 'fundingStartYear',
      //             name: 'year',
      //             size: 10,
      //             order: 1
      //         },
      //         {
      //             field: 'amount_in_EUR',
      //             name: 'amount',
      //             size: 1000,
      //             order: 0
      //         }
      //     ]
      // },
      {
        field: 'funder',
        title: $localize`:@@fundingCountByFunder:Hankkeiden jakautuminen rahoittajan mukaan`,
        select: $localize`:@@fundingFunder:Rahoittaja`,
        filter: 'funder',
        hierarchy: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'funderBusinessId.pid_content.keyword',
            name: 'funderPid',
            size: 100,
            order: 1,
          },
          {
            field: 'funderNameFi.keyword',
            name: 'funder',
            size: 1,
            order: 1,
          },
          {
            name: 'orgNested',
            nested: 'fundingGroupPerson',
          },
          {
            field: 'fundingGroupPerson.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'fundingGroupPerson.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
        hierarchy2: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'funderBusinessId.pid_content.keyword',
            name: 'funderPid',
            size: 100,
            order: 1,
          },
          {
            field: 'funderNameFi.keyword',
            name: 'funder',
            size: 1,
            order: 1,
          },
          {
            name: 'orgNested',
            nested: 'organizationConsortium',
          },
          {
            name: 'finnishOrganization',
            filter: {
              field: 'organizationConsortium.isFinnishOrganization',
              value: [1],
            },
          },
          {
            field: 'organizationConsortium.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'organizationConsortium.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
      },
      {
        field: 'organization',
        title: $localize`:@@fundingCountByOrg:Hankkeiden jakautuminen organisaatioittain`,
        select: $localize`:@@organization:Organisaatio`,
        // tslint:disable-next-line: max-line-length
        message:
          'Huom. Yhdellä hankkeella voi olla useita organisaatioita. Hanke sisältyy tällöin jokaisen siihen liitetyn organisaation lukumäärään',
        filter: 'organization',
        hierarchy: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'orgNested',
            nested: 'fundingGroupPerson',
          },
          {
            name: 'fundedPerson',
            filter: {
              field: 'fundingGroupPerson.fundedPerson',
              value: [1],
            },
          },
          {
            field:
              'fundingGroupPerson.fundedPersonOrganizationName|locale|.keyword',
            name: 'sectorName',
            size: 10,
            order: 2,
            exclude: ' |Rahoittaja',
          },
          {
            field: 'fundingGroupPerson.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            order: 2,
            filterName: 'organization',
          },
          {
            field:
              'fundingGroupPerson.consortiumOrganizationName|locale|.keyword',
            name: 'organizationName',
            size: 1,
            order: 0,
          },
          {
            sum: 'fundingGroupPerson.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
        hierarchy2: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'orgNested',
            nested: 'organizationConsortium',
          },
          {
            name: 'finnishOrganization',
            filter: {
              field: 'organizationConsortium.isFinnishOrganization',
              value: [1],
            },
          },
          {
            field:
              'organizationConsortium.consortiumSectorName|locale|.keyword',
            name: 'sectorName',
            size: 10,
            order: 2,
            exclude: ' |Rahoittaja',
          },
          {
            field: 'organizationConsortium.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            order: 2,
            filterName: 'organization',
          },
          {
            field:
              'organizationConsortium.consortiumOrganizationName|locale|.keyword',
            name: 'organizationName',
            size: 1,
            order: 0,
          },
          {
            sum: 'fundingGroupPerson.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
      },
      {
        field: 'typeOfFunding',
        title: $localize`:@@fundingCountByType:Hankkeiden jakautuminen rahoitusmuodon mukaan`,
        select: $localize`:@@typeOfFunding:Rahoitusmuoto`,
        message:
          'Huom. Hankkeita, joille ei ole määritelty rahoitusmuotoa, ei lasketa mukaan kuavaajaan.',
        filter: 'typeOfFunding',
        hierarchy: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'typeOfFundingId.keyword',
            name: 'typeId',
            size: 100,
            exclude: ' *',
            order: 1,
          },
          {
            // tslint:disable-next-line: max-line-length
            script:
              'doc["typeOfFundingName|locale|.keyword"].value + "|" + doc["typeOfFundingNameEn.keyword"].value + "|" + doc["typeOfFundingNameFi.keyword"].value',
            name: 'typeName',
            size: 1,
            order: 0,
          },
          {
            name: 'orgNested',
            nested: 'fundingGroupPerson',
          },
          {
            field: 'fundingGroupPerson.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'fundingGroupPerson.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
        hierarchy2: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            field: 'typeOfFundingId.keyword',
            name: 'typeId',
            size: 100,
            exclude: ' *',
            order: 1,
          },
          {
            script:
              'doc["typeOfFundingName|locale|.keyword"].value + "|" + doc["typeOfFundingNameEn.keyword"].value + "|" + doc["typeOfFundingNameFi.keyword"].value',
            name: 'typeName',
            size: 1,
            order: 0,
          },
          {
            name: 'orgNested',
            nested: 'organizationConsortium',
          },
          {
            name: 'finnishOrganization',
            filter: {
              field: 'organizationConsortium.isFinnishOrganization',
              value: [1],
            },
          },
          {
            field: 'organizationConsortium.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'organizationConsortium.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
      },
      {
        field: 'fieldOfScience',
        title: $localize`:@@fundingCountByFOS:Hankkeiden jakautuminen tieteenaloittain`,
        select: $localize`:@@fieldOfScience:Tieteenala`,
        // tslint:disable-next-line: max-line-length
        message:
          'Huom. Yhdellä hankkeella voi olla useita tieteenaloja. Hanke sisältyy tällöin jokaisen siihen liitetyn tieteenalan lukumäärään. Hankkeita, joille ei ole määritelty tieteenalaa, ei lasketa mukaan kuvaajaan.',
        filter: 'field',
        hierarchy: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'fieldNested',
            nested: 'fieldsOfScience',
          },
          {
            field: 'fieldsOfScience.fieldIdScience',
            name: 'fieldId',
            size: 100,
            order: 1,
            filterName: 'field',
            exclude: [0],
          },
          {
            field: 'fieldsOfScience.name|locale|Science.keyword',
            name: 'fieldsOfScience',
            size: 1,
            order: 1,
            exclude: [' '],
          },
          {
            name: 'orgNested',
            nested: 'fundingGroupPerson',
          },
          {
            field: 'fundingGroupPerson.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'fundingGroupPerson.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
        hierarchy2: [
          {
            field: 'fundingStartYear',
            name: 'year',
            size: 10,
            order: 1,
          },
          {
            name: 'fieldNested',
            nested: 'fieldsOfScience',
          },
          {
            field: 'fieldsOfScience.fieldIdScience',
            name: 'fieldId',
            size: 100,
            order: 1,
            filterName: 'field',
            exclude: [0],
          },
          {
            field: 'fieldsOfScience.name|locale|Science.keyword',
            name: 'fieldsOfScience',
            size: 1,
            order: 1,
            exclude: [' '],
          },
          {
            name: 'orgNested',
            nested: 'organizationConsortium',
          },
          {
            name: 'finnishOrganization',
            filter: {
              field: 'organizationConsortium.isFinnishOrganization',
              value: [1],
            },
          },
          {
            field: 'organizationConsortium.consortiumOrganizationId.keyword',
            name: 'organizationId',
            size: 100,
            filterName: 'organization',
          },
          {
            sum: 'organizationConsortium.shareOfFundingInEur',
            name: 'moneySum',
            size: 1,
          },
        ],
      },
    ],
  };
}
