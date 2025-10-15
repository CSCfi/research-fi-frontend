import { Component } from '@angular/core';

export interface cvDataFormatted {
  firstName: string;
  lastName: string;
  orcid: string;
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
}


export function formatCvData(lang: string, profileData, orcid: string, filterVisible: boolean) {
  console.log('formatCvData', JSON.stringify(profileData), filterVisible);


  let visibleNames = profileData[0].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  console.log('visibleNames', visibleNames);

  let affiliations = profileData[2].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  let primaryAffiliations = [];
  let nonPrimaryAffiliations = [];
  affiliations.forEach(affiliation => {
    if (affiliation.itemMeta.primaryAffiliation === true) {
      primaryAffiliations.push(affiliation);
    }
    else {
      nonPrimaryAffiliations.push(affiliation);
    }
  });

  let parsedEducation = profileData[3].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let parsedPublications = filterVisible === true ? profileData[4].fields[0].items.filter(item => item.itemMeta.show === true) : profileData[4].fields[0].items;
  let parsedDatasets = profileData[5].fields[0].items.filter(item =>  filterVisible === true ? profileData[4].fields[0].items : item);

  let parsedFundings = profileData[6].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);
  let parsedActivities = profileData[7].fields[0].items.filter(item => filterVisible ? item.itemMeta.show === true : item);

  let formattedData: cvDataFormatted = {
    awardsAndHonors: [],
    currentEmployment: primaryAffiliations,
    degrees: parsedEducation,
    firstName: visibleNames[0].firstName,
    lastName: visibleNames[0].lastName,
    orcid: orcid,
    otherEducationAndExpertise: [],
    previousWorkExperience: nonPrimaryAffiliations,
    publications: parsedPublications,
    researchDatasets: parsedDatasets,
    researchFundingAndGrants: parsedFundings,
    researchSupervisionAndLeadershipExperience: [],
    teachingMerits: []
  }

  return formattedData;
}

