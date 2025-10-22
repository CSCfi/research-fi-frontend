import { Component } from '@angular/core';
import { checkTranslation as checkTranslation} from '@portal/models/person/profiletool-person-adapter';
import { FieldTypes as fieldTypes } from '@mydata/constants/fieldTypes';
import { cloneDeep } from 'lodash-es';

export interface cvDataFormatted {
  firstNames: string;
  lastName: string;
  orcid: string;
  date: string;
  degrees: any[];
  otherEducationAndExpertise: any[];
  currentEmployment: any[];
  previousWorkExperience: any[];
  researchFundingAndGrants: any[];
  researchSupervisionAndLeadershipExperience: any[];
  teachingMerits: any[];
  awardsAndHonors: any[];
  researchDatasets: any[];
  publications: any[];
  activities: any[];
}


function getDateNow() {
  let d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  return [day, month, year].join('.');
}

export function formatCvData(lang: string, profileData, orcid: string, filterVisible: boolean) {
  console.log('formatCvData', JSON.stringify(profileData), filterVisible);

  let visibleNames = profileData[0].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let affiliations = profileData[2].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  let parsedAffiliations = affiliations.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    item.organizationName = checkTranslation('organizationName', item, lang) ?? '';
    return item;
  });


  let primaryAffiliations = [];
  let nonPrimaryAffiliations = [];
  parsedAffiliations.forEach(affiliation => {
    if (affiliation.itemMeta.primaryValue === true) {
      primaryAffiliations.push(affiliation);
    }
    else {
      nonPrimaryAffiliations.push(affiliation);
    }
  });

  let parsedEducation = profileData[3].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  console.log(parsedEducation, profileData[3]);
  parsedEducation = parsedEducation.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    return item;
  });

  let parsedPublications = filterVisible === true ? profileData[4].fields[0].items.filter(item => item.itemMeta.show === true) : profileData[4].fields[0].items;

  let parsedDatasets = profileData[5].fields[0].items.filter(item =>  filterVisible === true ? profileData[4].fields[0].items : item);
  parsedDatasets = parsedDatasets.map(item => {
    item.name = checkTranslation('name', item, lang) ?? '';
    return item;
  });

  let parsedFundings = profileData[6].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  parsedFundings = parsedFundings.map(item => {
    item.name = checkTranslation('projectName', item, lang) ?? '';
    item.funder.name = checkTranslation('funderName', item, lang) ?? '';
    return item;
  });


  let parsedActivities = profileData[7].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let formattedData: cvDataFormatted = {
    awardsAndHonors: [],
    currentEmployment: primaryAffiliations,
    degrees: parsedEducation,
    firstNames: visibleNames[0].firstNames,
    lastName: visibleNames[0].lastName,
    orcid: orcid,
    date: getDateNow(),
    otherEducationAndExpertise: [],
    previousWorkExperience: nonPrimaryAffiliations,
    publications: parsedPublications,
    researchDatasets: parsedDatasets,
    researchFundingAndGrants: parsedFundings,
    activities: parsedActivities,
    researchSupervisionAndLeadershipExperience: [],
    teachingMerits: []
  }

  return formattedData;
}

