// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT
import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { Recipient, RecipientAdapter } from './recipient.model';
import { Funder, FunderAdapter } from './funder.model';
import { LanguageCheck } from '../utils';
import { RelatedFunding, RelatedFundingAdapter } from './related-funding.model';
import { UtilityService } from '@shared/services/utility.service';

export class Funding {
  constructor(
    public id: number,
    public name: string, // projectNameFi
    public acronym: string,
    public description: string, // projectDescriptionFi
    public startYear: number, // fundingStartYear
    public endYear: number, // FundingEndYear
    public academyConsortium: string, // fundingGroupPerson ->
    public otherConsortium: any[], // fundingGroupPerson ->
    public recipient: Recipient,
    public funder: Funder,
    public funderProjectNumber: string,
    public fieldsOfScience: string,
    public fieldsOfResearch: string,
    public fieldsOfTheme: string,
    public keywords: string,
    public projectHomepage: string,
    public recipientType: string,
    public euFunding: boolean,
    public relatedFundings: RelatedFunding[],
    public additionalOrgs: { name: string; orgId: number }[],
    public totalFundingAmount: number
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class FundingAdapter implements Adapter<Funding> {
  constructor(
    private r: RecipientAdapter,
    private f: FunderAdapter,
    private rf: RelatedFundingAdapter,
    private lang: LanguageCheck,
    private util: UtilityService
  ) {}
  adapt(item: any): Funding {
    const recipientObj = item.fundingGroupPerson
      ? item.fundingGroupPerson
          .filter((x) => x.consortiumProject === item.funderProjectNumber)
          .shift()
      : {};

    // Determine recipient type based on existence and contents of fundingGroupPerson
    switch (item.fundingGroupPerson?.length) {
      // No person -> organization
      case undefined: {
        item.recipientType = 'organization';
        break;
      }
      // One person -> person, don't show consortium
      case 1: {
        item.recipientType = 'person';
        break;
      }
      // More than one -> consortium
      default: {
        item.recipientType = 'consortium';
        break;
      }
    }

    // Translate academy consortium role
    if (recipientObj && recipientObj.roleInFundingGroup) {
      switch (recipientObj?.roleInFundingGroup) {
        case 'leader': {
          recipientObj.roleInFundingGroup = {
            labelFi: 'Johtaja',
            labelEn: 'Leader',
          };
          break;
        }
        case 'partner': {
          recipientObj.roleInFundingGroup = {
            labelFi: 'Partneri',
            labelEn: 'Partner',
          };
          break;
        }
      }
    }

    // Trim all string elements
    item.fundingGroupPerson?.forEach((element) => {
      Object.keys(element).map(
        (k) =>
          (element[k] =
            typeof element[k] === 'string' ? element[k].trim() : element[k])
      );
    });
    const otherConsortiumObjs = item.fundingGroupPerson
      ? item.fundingGroupPerson.filter(
          (x) => x.consortiumProject !== item.funderProjectNumber
        )
      : [];

    // Translate academy consortium role in other consortiums
    if (otherConsortiumObjs && otherConsortiumObjs[0]?.roleInFundingGroup) {
      otherConsortiumObjs.forEach(
        (consortium) =>
          (consortium.roleInFundingGroup = this.lang.translateRole(
            consortium.roleInFundingGroup,
            false
          ))
      );
    }

    const funder = this.f.adapt(item);

    // Set EU funding status
    item.euFunding =
      item.funderNameFi.toLowerCase() === 'euroopan unioni' ? true : false;

    const recipient = this.r.adapt(item);

    const relatedFundings =
      item?.relatedFunding?.map((x) => this.rf.adapt(x)) || [];

    // Sum of original funding and related fundings, or only original if no related fundings
    const totalFundingAmount = relatedFundings
      ? recipient.amountEur +
        relatedFundings
          ?.map((x) => x.shareOfFunding)
          ?.reduce((a, b) => a + b, 0)
      : recipient.amountEur;

    // Get all unique organizations in related fundings
    const relatedOrgs = this.util.uniqueArray(
      relatedFundings.map((x) => {
        return { name: x.orgName?.trim(), orgId: x.orgId };
      }),
      (x) => x.name
    );

    // Get all organizations in related fundings that are not part of the original funding
    const additionalOrgs = relatedOrgs.filter(
      (x) => x.name !== recipient.affiliation
    );

    // Funding end year as the latest end year of related fundings, or original if no related fundings
    const endYear = Math.max(
      item.fundingEndYear,
      ...relatedFundings.map((x) => x.fundingEndYear)
    );

    // TODO: Translate
    const science = item.fieldsOfScience
      ?.map((x) => this.lang.translateFieldOfScience(x))
      .join('; ');
    const research = item.keywords
      ?.filter((x) => x.scheme === 'Tutkimusala')
      .map((x) => x.keyword)
      .join(', ');
    const theme = item.keywords
      ?.filter((x) => x.scheme === 'Teema-ala')
      .map((x) => x.keyword)
      .join(', ');
    const keyword = item.keywords
      ?.filter((x) => x.scheme === 'Avainsana')
      .map((x) => x.keyword)
      .join(', ');

    return new Funding(
      item.mainProjectId || item.projectId,
      this.lang.testLang('projectName', item),
      item.projectAcronym,
      this.lang.testLang('projectDescription', item),
      item.fundingStartYear,
      endYear > item.fundingStartYear ? endYear : undefined,
      recipientObj?.roleInFundingGroup,
      otherConsortiumObjs,
      recipient,
      funder,
      item.funderProjectNumber,
      science,
      research,
      theme,
      keyword,
      item.projetHomepage,
      item.recipientType,
      item.euFunding,
      relatedFundings,
      additionalOrgs,
      // undefined, // Temporary related fundings
      totalFundingAmount
      // recipient.amountEur // Temporary fundingAmount
    );
  }
}
