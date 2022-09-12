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
import { LanguageCheck, testFinnishBusinessId } from '../utils';
import { orderBy } from 'lodash-es';

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
    public euFundingRecipients: Record<string, unknown>[],
    public personNameAndOrg: string
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
    /*
     * Listing of recipients depends on multiple factors:
     * Recipient type, country of recipient organization and if funding type is EU funding.
     * Recipient object is used in search results (recipient column) and single-recipient components.
     */

    const recipientObj = item.recipientObj;

    // Filter empty properties
    typeof recipientObj === 'object' &&
      Object.keys(recipientObj).forEach(
        (k) => recipientObj[k] == '' && delete recipientObj[k]
      );

    const joinName = (firstNames: string, lastName: string) =>
      `${firstNames} ${lastName}`.trim();

    const organizations: RecipientOrganization[] = [];
    let personNameAndOrg = '';

    if (recipientObj) {
      // Combine recipient names and organizations, this is used in funding results component
      if (
        item.recipientType === 'organization' &&
        item.organizationConsortium
      ) {
        item.organizationConsortium.forEach((o) =>
          organizations.push(
            this.roa.adapt({ ...o, euFunding: item.euFunding })
          )
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

          personNameAndOrg =
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
          personNameAndOrg = item.organizationConsortium
            .filter(
              (x) =>
                this.lang.testLang('consortiumOrganizationName', x).trim() !==
                  '' &&
                // Check for finnish business ID identifier
                (x.consortiumOrganizationBusinessId?.trim().slice(-2)[0] ===
                  '-' ||
                  x.consortiumOrganizationBusinessId?.trim().slice(0, 2) ===
                    'FI')
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
            x.consortiumOrganizationBusinessId &&
            testFinnishBusinessId(x.consortiumOrganizationBusinessId)
        )
      ) {
        // Get target recipient
        const person = recipientObj.fundingGroupPersonLastName
          ? recipientObj
          : item.fundingGroupPerson.find(
              (x) =>
                x.consortiumProject === item.funderProjectNumber &&
                x.consortiumOrganizationBusinessId &&
                testFinnishBusinessId(x.consortiumOrganizationBusinessId)
            );

        // Map recipients
        if (
          person &&
          this.lang.testLang('consortiumOrganizationName', person) !== ''
        ) {
          personNameAndOrg = person.fundingGroupPersonLastName
            ? person.fundingGroupPersonFirstNames +
              ' ' +
              person.fundingGroupPersonLastName +
              ', ' +
              this.lang.testLang('consortiumOrganizationName', person)
            : this.lang.testLang('consortiumOrganizationName', person);
        } else if (person) {
          personNameAndOrg =
            person.fundingGroupPersonFirstNames +
            ' ' +
            person.fundingGroupPersonLastName;
        } else {
          // If no match with funderProjectNumber
          personNameAndOrg = item.fundingGroupPerson
            ?.map((x) =>
              x.fundingGroupPersonLastName.trim().length > 0
                ? joinName(
                    x.fundingGroupPersonFirstNames,
                    x.fundingGroupPersonLastName
                  ) +
                  (this.lang
                    .testLang('consortiumOrganizationName', recipientObj)
                    ?.trim().length > 0
                    ? ', ' +
                      this.lang
                        .testLang('consortiumOrganizationName', recipientObj)
                        ?.trim()
                    : '')
                : this.lang
                    .testLang('consortiumOrganizationName', recipientObj)
                    ?.trim()
            )
            ?.join('; ');
        }
        // If no match with Finnish organization
      } else if (item.recipientType === 'consortium') {
        // Possible matching person if no Finnnish organization
        const consortiumPersonNoMatchingRecipient =
          item.fundingGroupPerson.find(
            (person) =>
              person.fundedPerson === 1 &&
              person.fundingGroupPersonLastName.trim().length > 0
          );

        // Return consortium recipient name if no organization
        if (
          !this.lang.testLang('consortiumOrganizationName', recipientObj) &&
          recipientObj.fundingGroupPersonLastName
        ) {
          personNameAndOrg = joinName(
            recipientObj.fundingGroupPersonFirstNames,
            recipientObj.fundingGroupPersonLastName
          );
        } else if (consortiumPersonNoMatchingRecipient) {
          personNameAndOrg = joinName(
            consortiumPersonNoMatchingRecipient.fundingGroupPersonFirstNames,
            consortiumPersonNoMatchingRecipient.fundingGroupPersonLastName
          );
        }
      } else if (item.recipientType === 'person') {
        if (
          item.fundingGroupPerson.find(
            (x) => x.fundingGroupPersonLastName?.trim().length > 0
          )
        ) {
          personNameAndOrg = item.fundingGroupPerson
            ?.map((x) =>
              x.fundingGroupPersonLastName.trim().length > 0
                ? joinName(
                    x.fundingGroupPersonFirstNames,
                    x.fundingGroupPersonLastName
                  )
                : null
            )
            .join('; ');
        } else if (item.organizationConsortium) {
          personNameAndOrg = item.organizationConsortium
            .filter((x) => !x.countryCode || x.countryCode === 'FI')
            .map((x) =>
              this.lang.testLang('consortiumOrganizationName', x).trim()
            )
            .join('; ');
        }
      } else {
        personNameAndOrg = '-';
      }
    }

    /*
     * Special use case for EU funding with multiple persons as recipients.
     * Rule: Funding is EU funding and has 'consortium' as recipientType (multiple objects in fundingGroupPerson).
     * Sort by Finnish organizations first.
     *
     * Note: the use case of euFundingRecipients variable is now extended to regular projects too in the funding details page.
     */
    const euFundingRecipients =
      item.fundingGroupPerson?.length &&
      item.fundingGroupPerson
        .flat()
        .map((person) => ({
          personName: person.fundingGroupPersonLastName
            ? `${person.fundingGroupPersonFirstNames} ${person.fundingGroupPersonLastName}`
            : '',
          organizationName: this.lang.testLang(
            'consortiumOrganizationName',
            person
          ),
          finnishOrganization: testFinnishBusinessId(
            person.consortiumOrganizationBusinessId
          ),
          personIsFunded: person?.fundedPerson === 1,
          organizationId: person.consortiumOrganizationId,
          projectId: person.projectId,
          shareOfFundingInEur: person.shareOfFundingInEur,
          orcid: person.fundingGroupPersonOrcid,
          role: this.lang.translateRole(person.roleInFundingGroup, true),
        }))
        .sort((a, b) => b.finnishOrganization - a.finnishOrganization);

    // Display combined EU funding recipients in search results view
    if (item.euFunding && euFundingRecipients) {
      personNameAndOrg = euFundingRecipients
        .map(
          (recipient) =>
            `${recipient.personName}, ${recipient.organizationName}`
        )
        .join('; ');
    }

    // Sort organizations by finnish organizations first
    // Additional sort for organizations that can be linked insides portal
    const sortedOrganizations = orderBy(
      organizations,
      ['finnishOrganization', 'portalEquivalent'],
      ['desc', 'desc']
    );

    return new Recipient(
      recipientObj?.projectId,
      recipientObj?.fundingGroupPersonLastName
        ? joinName(
            recipientObj.fundingGroupPersonFirstNames,
            recipientObj.fundingGroupPersonLastName
          )
        : '',
      recipientObj?.fundingGroupPersonOrcid,
      recipientObj
        ? this.lang.testLang('consortiumOrganizationName', recipientObj)
        : undefined, // affiliation
      recipientObj?.consortiumOrganizationNameFi, // organizationName
      recipientObj?.consortiumOrganizationId,
      recipientObj?.shareOfFundingInEur,
      Math.round(item.amount_in_EUR),
      (item.fundingContactPersonFirstNames || '') +
        ' ' +
        (item.fundingContactPersonLastName || ''), // Add "existence check" because of string operation
      item.fundingContactPersonOrcid,
      sortedOrganizations,
      euFundingRecipients,
      personNameAndOrg.trim().length > 0 ? personNameAndOrg : '-'
    );
  }
}
