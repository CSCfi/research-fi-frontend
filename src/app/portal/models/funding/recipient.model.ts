// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Adapter } from '../adapter.model';
import {
  RecipientOrganization,
  RecipientOrganizationAdapter,
} from './recipient-organization.model';
import { LanguageCheck } from '../utils';

export class Recipient {
  [x: string]: any;
  constructor(
    public projectId: string,
    public personName: string,
    public personOrcid: string,
    public affiliation: string,
    public organizationName: string,
    public organizationId: string,
    public shareOfFundingEur: number,
    public amountEur: number,
    public contactPersonName: string,
    public contactPersonOrcid: string,
    public organizations: RecipientOrganization[],
    public combined: string
  ) {}
}
@Injectable({
  providedIn: 'root',
})
export class RecipientAdapter implements Adapter<Recipient> {
  constructor(
    private roa: RecipientOrganizationAdapter,
    @Inject(LOCALE_ID) protected localeId: string,
    private lang: LanguageCheck
  ) {}
  adapt(item: any): Recipient {
    const recipientObj = item.fundingGroupPerson
      ?.filter((x) => x.consortiumProject === item.funderProjectNumber)
      .shift();
    const organizations: RecipientOrganization[] = [];
    // Combine recipient names and organizations, this is used in funding results component
    let combined = '';
    if (item.recipientType === 'organization' && item.organizationConsortium) {
      item.organizationConsortium.forEach((o) =>
        organizations.push(this.roa.adapt({ ...o, euFunding: item.euFunding }))
      );
      // Get Finnish organizations only (based on business id)
      if (
        item.organizationConsortium.find(
          (org) =>
            org.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-'
        )
      ) {
        const finnish = item.organizationConsortium.filter(
          (org) =>
            org.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-'
        );

        combined =
          finnish.length > 1
            ? finnish
                .map((x) =>
                  this.lang.testLang('consortiumOrganizationName', x).trim()
                )
                .join('; ')
            : this.lang.testLang(
                'consortiumOrganizationName',
                finnish.find(
                  (org) =>
                    org.consortiumOrganizationBusinessId
                      ?.trim()
                      .slice(-2)[0] === '-'
                )
              );
      } else {
        combined = item.organizationConsortium
          .filter(
            (x) =>
              this.lang.testLang('consortiumOrganizationName', x).trim() !==
                '' &&
              // Check for finnish business ID identifier
              (x.consortiumOrganizationBusinessId?.trim().slice(-2)[0] ===
                '-' ||
                x.consortiumOrganizationBusinessId?.trim().slice(0, 2) === 'FI')
          )
          .map((x) =>
            this.lang.testLang('consortiumOrganizationName', x).trim()
          )
          .join('; ');
      }
      // Check that a finnish organization is found
    } else if (
      item.fundingGroupPerson &&
      item.fundingGroupPerson.find(
        // Check for finnish business ID identifier
        (x) =>
          x.consortiumOrganizationBusinessId?.trim().slice(-2)[0] === '-' ||
          x.consortiumOrganizationBusinessId?.trim().slice(0, 2) === 'FI'
      )
    ) {
      // Get target recipient
      const person = item.fundingGroupPerson.find(
        (x) => x.consortiumProject === item.funderProjectNumber
      );
      // Map recipients
      if (
        person &&
        this.lang.testLang('consortiumOrganizationName', person) !== ''
      ) {
        combined = person.fundingGroupPersonLastName
          ? person.fundingGroupPersonFirstNames +
            ' ' +
            person.fundingGroupPersonLastName +
            ', ' +
            this.lang.testLang('consortiumOrganizationName', person)
          : this.lang.testLang('consortiumOrganizationName', person);
      } else if (person) {
        combined =
          person.fundingGroupPersonFirstNames +
          ' ' +
          person.fundingGroupPersonLastName;
      } else {
        // If no match with funderProjectNumber
        combined = item.fundingGroupPerson
          ?.map((x) =>
            x.fundingGroupPersonLastName.trim().length > 0
              ? x.fundingGroupPersonFirstNames +
                ' ' +
                x.fundingGroupPersonLastName +
                (this.lang
                  .testLang('consortiumOrganizationName', recipientObj)
                  ?.trim().length > 0
                  ? ', ' +
                    this.lang
                      .testLang('consortiumOrganizationName', recipientObj)
                      ?.trim()
                  : null)
              : this.lang
                  .testLang('consortiumOrganizationName', recipientObj)
                  ?.trim()
          )
          ?.join('; ');
      }
      // If no match with Finnish organization
    } else if (item.recipientType === 'person') {
      if (
        item.fundingGroupPerson.find(
          (x) => x.fundingGroupPersonLastName?.trim().length > 0
        )
      ) {
        combined = item.fundingGroupPerson
          ?.map((x) =>
            x.fundingGroupPersonLastName.trim().length > 0
              ? x.fundingGroupPersonFirstNames +
                ' ' +
                x.fundingGroupPersonLastName
              : null
          )
          .join('; ');
      } else if (item.organizationConsortium) {
        combined = item.organizationConsortium
          .filter((x) => !x.countryCode || x.countryCode === 'FI')
          .map((x) =>
            this.lang.testLang('consortiumOrganizationName', x).trim()
          )
          .join('; ');
      }
    } else {
      combined = '-';
    }
    return new Recipient(
      recipientObj?.projectId,
      recipientObj
        ? recipientObj?.fundingGroupPersonFirstNames +
          ' ' +
          recipientObj?.fundingGroupPersonLastName
        : '',
      recipientObj?.fundingGroupPersonOrcid,
      recipientObj
        ? this.lang.testLang('consortiumOrganizationName', recipientObj)
        : undefined, // affiliation
      recipientObj?.consortiumOrganizationNameFi, // organizationName
      recipientObj?.consortiumOrganizationId,
      recipientObj?.shareOfFundingInEur,
      Math.round(item.amount_in_EUR),
      // tslint:disable-next-line: max-line-length
      (item.fundingContactPersonFirstNames || '') +
        ' ' +
        (item.fundingContactPersonLastName || ''), // Add "existence check" because of string operation
      item.fundingContactPersonOrcid,
      organizations,
      combined.trim().length > 0 ? combined : '-'
    );
  }
}
