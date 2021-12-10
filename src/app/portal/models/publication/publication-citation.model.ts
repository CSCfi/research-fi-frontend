// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';

export class PublicationCitation {
  constructor(public apa: string, public chicago: string, public mla: string) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationCitationAdapter
  implements Adapter<PublicationCitation>
{
  types = [
    ['A1', 'A2', 'A4', 'B1', 'B3', 'D1', 'D3', 'E1'],
    ['A3', 'B2', 'D2'],
    ['C1', 'E2', 'D4', 'D5', 'G4', 'G5'],
    ['C2', 'E3', 'D6'],
  ];

  constructor() {}
  adapt(item: any): PublicationCitation {
    const joinWithAnd = (names: string[], and = '&'): string => {
      // Join with 'and' before last name
      return names.length > 1
        ? names.slice(0, -1).join(', ') + ` ${and} ` + names.slice(-1)
        : names.join(', ');
    };

    const formatNames = (s: string): string => {
      // Split names
      let names: string[] =
        s
          .split(';')
          .map((x) => x.trim())
          ?.filter((x) => x.length > 1) || [];
      // Reverse all name orders but first
      names =
        names
          .slice(0, 1)
          .concat(
            names.slice(1).map((x) => x.split(', ').reverse().join(' '))
          ) || [];
      return joinWithAnd(names, 'and');
    };

    const formatNamesInitials = (authors: string, order = 0): string => {
      if (!authors) return '';

      let names: any = authors.split(';');
      // Names with '&'
      names = names?.map((x) => x.split('&'))?.flat() || names;
      names =
        names
          ?.map((n) => n.trim().split(', '))
          ?.filter((x) => x?.every((y) => y.length > 1)) || names;

      // No comma between first and last name, kind of hacky
      names.forEach((name, i) => {
        if (name.length < 2) {
          names[i] = name[0].trim().split(' ') || name;
        }
        // If still only last name
        if (names[i].length < 2) {
          names[i] = [names[i][0], '_'];
        }
      });

      // Initials first
      if (order) {
        names = names.map(
          (n) =>
            n[1]
              .split(' ')
              .map((f) => f[0] + '.')
              .join(' ') +
            ' ' +
            n[0]
        );
        // Last name first
      } else {
        names = names.map(
          (n) =>
            n[0] +
            ' ' +
            n[1]
              .split(' ')
              .map((f) => f[0] + '.')
              .join(' ')
        );
      }
      names = joinWithAnd(names);
      return names;
    };

    const createApa = (type: string): string => {
      let res = '';

      // Lastname F. N., Othername O. N., ...
      const names = formatNamesInitials(item.authorsText);

      const year = `(${item.publicationYear}). `;

      const journal = `<i>${item.journalName || item.conferenceName}</i>`;

      const volume = item.volume ? ', <i>' + item.volume + '</i>' : '';

      const number = item.issueNumber ? '(' + item.issueNumber + ')' : '';

      const doi = item.doi ? 'doi: ' + item.doi : '';

      if (this.types[0].includes(type)) {
        const pages =
          item.pageNumberText || item.articleNumberText
            ? ', ' + (item.pageNumberText || item.articleNumberText)
            : '';

        res =
          names +
          ' ' +
          year +
          item.publicationName +
          '. ' +
          journal +
          ', ' +
          volume +
          number +
          pages +
          '. ' +
          doi;
      } else if (this.types[1].includes(type)) {
        const pages =
          item.pageNumberText || item.articleNumberText
            ? ', (' + (item.pageNumberText || item.articleNumberText) + ')'
            : '';
        const parentPublisherNames = item.parentPublicationPublisher
          ? formatNamesInitials(item.parentPublicationPublisher, 1) +
            ' (Eds.), '
          : '';

        res =
          names +
          ' ' +
          year +
          item.publicationName +
          '. ' +
          parentPublisherNames +
          item.parentPublicationName +
          pages +
          '. ' +
          item.publisherName +
          '. ' +
          doi;
      } else if (this.types[2].includes(type)) {
        res =
          names +
          ' ' +
          year +
          item.publicationName +
          '. ' +
          item.publisherName +
          '. ' +
          doi;
      } else if (this.types[3].includes(type)) {
        const parentPublisherNames = item.parentPublicationPublisher
          ? formatNamesInitials(item.parentPublicationPublisher, 1) +
            ' (Eds.), '
          : '';

        res =
          parentPublisherNames +
          year +
          '<i>' +
          item.publicationName +
          '</i>' +
          '. ' +
          item.publisherName +
          '. ' +
          doi;
      }

      return res;
    };

    const createChicago = (type: string): string => {
      let res = '';

      const names = item.authorsText ? formatNames(item.authorsText) : null;

      const journal = `<i>${item.journalName || item.conferenceName}</i>`;

      const volume = item.volume ? ', ' + item.volume : '';

      const issueNumber = item.issueNumber ? ', no. ' + item.issueNumber : '';

      const parentPublicationName = item.parentPublicationName
        ? 'In <i>' + item.parentPublicationName + '</i>'
        : '';

      let editorNames = item.parentPublicationPublisher
        ? joinWithAnd(
            item.parentPublicationPublisher
              .split(';')
              ?.map((x) => x.split(', ').reverse().join(' ')),
            'and'
          )
        : '';

      const pages =
        item.pageNumberText || item.articleNumberText
          ? ': ' + (item.pageNumberText || item.articleNumberText)
          : '';

      const publisherLocation = item.publisherLocation
        ? item.publisherLocation + ': '
        : '';

      const doi = item.doi ? 'doi: ' + item.doi : '';

      if (this.types[0].includes(type)) {
        res =
          names +
          '. ' +
          item.publicationYear +
          '. "' +
          item.publicationName +
          '." ' +
          journal +
          volume +
          issueNumber +
          pages +
          '. ' +
          doi;
      } else if (this.types[1].includes(type)) {
        editorNames = editorNames ? ', <i>edited by</i> ' + editorNames : '';

        res =
          names +
          '. ' +
          item.publicationYear +
          '. "' +
          item.publicationName +
          '." ' +
          parentPublicationName +
          editorNames +
          pages +
          '. ' +
          publisherLocation +
          (item.publisherName || '') +
          '. ' +
          doi;
      } else if (this.types[2].includes(type)) {
        res =
          names +
          '. ' +
          item.publicationYear +
          '. <i>' +
          item.publicationName +
          '</i>. ' +
          publisherLocation +
          (item.publisherName || '') +
          '. ' +
          doi;
      } else if (this.types[3].includes(type)) {
        editorNames = editorNames ? editorNames + ', eds. ' : '';

        res =
          editorNames +
          item.publicationYear +
          '. <i>' +
          item.publicationName +
          '</i>. ' +
          publisherLocation +
          (item.publisherName || '') +
          '. ' +
          doi;
      }

      return res;
    };

    const createMla = (type: string): string => {
      let res = '';

      const names = item.authorsText ? formatNames(item.authorsText) : null;

      const journal = `<i>${item.journalName || item.conferenceName}</i>`;

      const volume = item.volume ? ', vol. ' + item.volume : '';

      const issueNumber = item.issueNumber ? ', no. ' + item.issueNumber : '';

      const parentPublicationName = item.parentPublicationName
        ? '<i>' + item.parentPublicationName + '</i>, '
        : '';

      let editorNames = item.parentPublicationPublisher
        ? joinWithAnd(
            item.parentPublicationPublisher
              .split(';')
              ?.map((x) => x.split(', ').reverse().join(' ')),
            'and'
          )
        : '';

      const pages =
        item.pageNumberText || item.articleNumberText
          ? ' pp. ' + (item.pageNumberText || item.articleNumberText)
          : '';

      const doi = item.doi ? 'doi: ' + item.doi : '';

      if (this.types[0].includes(type)) {
        res =
          names +
          '. "' +
          item.publicationName +
          '." ' +
          journal +
          volume +
          issueNumber +
          ', ' +
          item.publicationYear +
          pages +
          '. ' +
          doi;
      } else if (this.types[1].includes(type)) {
        editorNames = editorNames ? 'edited by ' + editorNames + ', ' : '';

        res =
          names +
          '. "' +
          item.publicationName +
          '." ' +
          parentPublicationName +
          editorNames +
          (item.publisherName || '') +
          ', ' +
          item.publicationYear +
          pages +
          '. ' +
          doi;
      } else if (this.types[2].includes(type)) {
        res =
          names +
          '. <i>' +
          item.publicationName +
          '</i>. ' +
          (item.publisherName || '') +
          ', ' +
          item.publicationYear +
          '. ' +
          doi;
      } else if (this.types[3].includes(type)) {
        editorNames = editorNames ? editorNames + ', editor(s). ' : '';

        res =
          editorNames +
          '<i>' +
          item.publicationName +
          '</i>. ' +
          (item.publisherName || '') +
          ', ' +
          item.publicationYear +
          '. ' +
          doi;
      }

      return res;
    };

    const apa = createApa(item.publicationTypeCode);
    const chicago = createChicago(item.publicationTypeCode);
    const mla = createMla(item.publicationTypeCode);

    return new PublicationCitation(apa, chicago, mla);
  }
}
