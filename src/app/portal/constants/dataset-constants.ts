// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

export const DatasetRelations = [
  {
    id: 'relation',
    uri: 'http://purl.org/dc/terms/relation',
    label: {
      fi: 'Liittyvä aineisto',
      en: 'Related dataset',
    },
  },
  {
    id: 'cites',
    uri: 'http://purl.org/spar/cito/cites',
    label: {
      fi: 'Viittaa',
      en: 'Cites',
    },
  },
  {
    id: 'isCitedBy',
    uri: 'http://purl.org/spar/cito/isCitedBy',
    label: {
      fi: 'Viitattu',
      en: 'Is cited by',
    },
  },
  {
    id: 'isSupplementTo',
    uri: 'http://purl.org/vocab/frbr/core#isSupplementTo',
    label: {
      fi: 'Viittaus tausta-aineistoon',
      en: 'Is supplement to',
    },
  },
  {
    id: 'continues',
    uri: 'http://purl.org/vocab/frbr/core#successorOf',
    label: {
      fi: 'Täydentää aineistoa',
      en: 'Continues',
    },
  },
  {
    id: 'adms#previous',
    uri: 'http://www.w3.org/ns/adms#previous',
    label: {
      fi: 'Edellinen versio',
      en: 'Has previous version',
    },
  },
  {
    id: 'hasNextVersion',
    uri: 'http://www.w3.org/ns/adms#next',
    label: {
      fi: 'Seuraava versio',
      en: 'Has next version',
    },
  },
  {
    id: 'hasPart',
    uri: 'http://purl.org/dc/terms/hasPart',
    label: {
      fi: 'Osa aineistoa',
      en: 'Has part',
    },
  },
  {
    id: 'isPartOf',
    uri: 'http://purl.org/dc/terms/isPartOf',
    label: {
      fi: 'Kuuluu aineistoon',
      en: 'Is part of',
    },
  },
  {
    id: 'references',
    uri: 'http://purl.org/spar/cito/citesForInformation',
    label: {
      fi: 'Viittaa aineistoon',
      en: 'References',
    },
  },
  {
    id: 'isCompiledBy',
    uri: 'http://purl.org/spar/cito/isCompiledBy',
    label: {
      fi: 'Johdettu jollakin',
      en: 'Is compiled by',
    },
  },
  {
    id: 'alternate',
    uri: 'http://purl.org/vocab/frbr/core#alternate',
    label: {
      fi: 'Erimuotoinen vastine',
      en: 'Is variant form of',
    },
  },
  {
    id: 'isIdenticalTo',
    uri: 'http://www.w3.org/2002/07/owl#sameAs',
    label: {
      fi: 'Identtinen aineisto',
      en: 'Is identical to',
    },
  },
  {
    id: 'wasDerivedFrom',
    uri: 'http://www.w3.org/ns/prov#wasDerivedFrom',
    label: {
      fi: 'Johdettu aineistosta',
      en: 'Was derived from',
    },
  },
];
