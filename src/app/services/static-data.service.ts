//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {
  // Filters, Fields of study
  majorFieldsOfScience = [
    {id: 1, key: 'Luonnontieteet', checked: false, subData: [], doc_count: 0},
    {id: 2, key: 'Tekniikka', checked: false, subData: [], doc_count: 0},
    {id: 3, key: 'Lääke- ja yritystieteet', checked: false, subData: [], doc_count: 0},
    {id: 4, key: 'Maatalous- ja metsätieteet', checked: false, subData: [], doc_count: 0},
    {id: 5, key: 'Yhteiskuntatieteet', checked: false, subData: [], doc_count: 0},
    {id: 6, key: 'Humanistiset tieteet', checked: false, subData: [], doc_count: 0},
    {id: 9, key: 'Muut tieteet', checked: false, subData: [], doc_count: 0}
  ];

  // Filters, Publication class
  publicationClass = [
    {id: 1, class: 'A', label: 'Vertaisarvioidut tieteelliset artikkelit', types: [
      {type: 'A1', label: 'Kirjoitus tieteellisessä aikakauslehdessä', key: '', doc_count: 0},
      {type: 'A2', label: 'Kirjan tai muun kokoomateoksen osa', key: '', doc_count: 0},
      {type: 'A3', label: 'Vertaisarvioimaton artikkeli konferenssijulkaisussa', key: '', doc_count: 0},
      {type: 'A4', label: 'Artikkeli konferenssijulkaisussa', key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 2, class: 'B', label: 'Vertaisarvioimattomat tieteelliset kirjoitukset', types: [
      {type: 'B1', label: 'Alkuperäisartikkeli tieteellisessä aikakauslehdessä', key: '', doc_count: 0},
      {type: 'B2', label: 'Katsausartikkeli tieteellisessä aikakauslehdessä', key: '', doc_count: 0},
      {type: 'B3', label: 'Kirjan tai muun kokoomateoksen osa', key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 3, class: 'C', label: 'Tieteelliset kirjat (monografiat)', types: [
      {type: 'C1', label: 'Kustannettu tieteellinen erillisteos', key: '', doc_count: 0},
      {type: 'C2', label: 'Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero', key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 4, class: 'D', label: 'Ammattiyhteisölle suunnatut julkaisut', types: [
      {type: 'D1', label: 'Artikkeli ammattilehdessä', key: '', doc_count: 0},
      {type: 'D2', label: 'Artikkeli ammatillisessa käsi- tai opaskirjassa, ammatillisessa tietojärjestelmässä tai oppikirja-aineisto', key: '', doc_count: 0},
      {type: 'D3', label: 'Artikkeli ammatillisessa konferenssijulkaisussa', key: '', doc_count: 0},
      {type: 'D4', label: 'Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys', key: '', doc_count: 0},
      {type: 'D5', label: 'Oppikirja, ammatillinen käsi- tai opaskirja taikka sanakirja', key: '', doc_count: 0},
      {type: 'D6', label: 'Toimitettu ammatillinen teos', key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 5, class: 'E', label: 'Suurelle yleisölle suunnatut julkaisut', types: [
      {type: 'E1', label: 'Yleistajuinen artikkeli, sanomalehtiartikkeli', key: '', doc_count: 0},
      {type: 'E2', label: 'Yleistajuinen monografia', key: '', doc_count: 0},
      {type: 'E3', label: 'Toimitettu yleistajuinen teos', key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 6, class: 'F', label: 'Julkinen taiteellinen ja taideteollinen toiminta', types: [
      {type: 'F1', label: 'Erillisjulkaisu', key: '', doc_count: 0},
      {type: 'F2', label: 'Julkinen taiteellinen teoksen osatoteutus', key: '', doc_count: 0},
      {type: 'F3', label: 'Ei-taiteellisen julkaisun taiteellinen osa', key: '', doc_count: 0}
    ],
    checked: false
    },
    {id: 7, class: 'G', label: 'Opinnäytteet', types: [
      {type: 'G4', label: 'Monografiaväitöskirja', key: '', doc_count: 0},
      {type: 'G5', label: 'Artikkeliväitöskirja', key: '', doc_count: 0}
    ]}
  ];

  juFoCode = [
    {key: '3', labelFi: 'Korkein taso'},
    {key: '2', labelFi: 'Johtava taso'},
    {key: '1', labelFi: 'Perustaso'},
    {key: '0', labelFi: 'Muut'},
    {key: ' ', labelFi: 'Ei arviota'},
  ];

  // Query parameters
  minScore = 10;

  httpErrors = {
    400: 'HTTP pyyntöä ei voitu käsitellä',
    401: 'Pyyntö vaatii sen käsittelyyn oikeutetut tunnukset',
    403: 'Ei oikeutta käsitellä pyyntöä',
    404: 'Haluttua tietoa ei ole olemassa',
    405: 'Pyyntömetodi ei ole sallitty',
    500: 'Palvelinvirhe. Palvelimella tapahtui virhe pyyntöä käsitellessä'
  };

  constructor() { }

  // Query fields where exact match isn't needed
  queryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = ['publicationName^2', 'publicationYear', 'authorsText',
              'journalName', 'conferenceName', 'parentPublicationName', 'parentPublicationPublisher',
              'publisherName', 'publisherLocation', 'doi', 'doiHandle', 'greenOpenAccessAddress',  'fields_of_education',
              'issn', 'issn2', 'isbn', 'isbn2', 'keywords.keyword', 'publicationOrgId',
              'jufoCode', 'jufoClassCode', 'fields_of_science.nameFiScience', 'fields_of_science.nameEnScience',
              'fields_of_science.nameSvScience',];
        break;
      }
      case 'person': {
        res = ['firstName', 'lastName'];
        break;
      }
      case 'funding': {
        res = ['projectNameFi^2', 'projectNameEn^2', 'projectNameSv^2', 'projectAcronym', 'projectDescriptionFi', 'projectDescriptionEn',
        'projectDescriptionSv', 'fundingStartYear', 'fundingContactPersonLastName', 'fundingContactPersonFirstNames',
        'funderNameFi', 'funderNameEn', 'funderNameSv', 'funderNameUnd', '' , 'typeOfFundingId', 'typeOfFundingNameFi',
        'typeOfFundingNameEn', 'typeOfFundingNameSv', 'callProgrammeNameFi', 'callProgrammeNameEn', 'callProgrammeNameSv',
        'callProgrammeHomepage', 'callProgrammeUnd', 'funderProjectNumber', 'keywords.keyword', 'keyword.scheme',
        'fundedNameFi', 'funderNameFi'];
        break;
      }
      case 'infrastructure': {
        res = ['name^2', 'description', 'scientificDescription', 'startYear', 'acronym', 'responsibleOrganizationNameFi',
        'responsibleOrganizationNameEn', 'responsibleOrganizationNameSv', 'keywords.keyword', 'services.serviceName',
        'services.serviceDescription', 'services.serviceType', 'services.servicePointName', ''];
        break;
      }
      case 'organization': {
        res = ['nameFi^2', 'nameEn^2', 'nameSv^2', 'variantNames', 'organizationBackground', 'predecessors.nameFi', 'related', 'homepage',
        'visitingAddress', 'businessId', 'TKOppilaitosTunnus', 'subUnits'];
        break;
      }
    }
    console.log(res);
    return res;
  }

  nestedQueryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = [
          'author.nameFiSector',
          'author.organization.OrganizationNameFi',
          'author.organization.organizationUnit.organizationUnitNameFi',
          'author.organization.organizationUnit.organizationUnitNameEn',
          'author.organization.organizationUnit.organizationUnitNameSv',
          'author.organization.organizationUnit.person.authorFirstNames',
          'author.organization.organizationUnit.person.authorLastName'
        ];
        break;
      }
      case 'funding': {
        res = [
          'organizationConsortium.consortiumOrganizationBusinessId',
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
          'fundingGroupPerson.consortiumProject'
        ]
      }
    }
  }
}
