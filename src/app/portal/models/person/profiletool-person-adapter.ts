import { cloneDeep } from 'lodash-es';
import { UtilityService } from '@shared/services/utility.service';
import { FieldTypes as fieldTypes } from '@mydata/constants/fieldTypes';
import { GroupTypes as groupTypes } from '@mydata/constants/groupTypes';

export function convertToProfileToolFormat(profile: any, localeId: string) {
  console.log(profile);

  if (profile) {
    let profileFormattedTemp = [];
    console.log('profile', profile);

    // 1/8 --- CONTACT
    let contact = [];

    // OTHER NAMES
    let typedOtherNames = cloneDeep(profile.personal.otherNames);
    typedOtherNames = typedOtherNames.map(item => {
      item.itemMeta = { type: fieldTypes.personOtherNames, show: true };
      return item;
    });

    let otherNames = {
      id: 'otherNames',
      label: 'Muut nimet',
      items: typedOtherNames
    };
    contact.push(otherNames);

    // EMAIL
    let typedEmails = cloneDeep(profile.personal.emails);
    typedEmails = typedEmails.map(item => {
      item.itemMeta = { type: fieldTypes.personEmailAddress, show: true };
      return item;
    });
    let emails = {
      id: 'email',
      label: 'Sähköposti',
      items: typedEmails
    };
    contact.push(emails);

    // WEBLINKS
    let typedWebLinks = cloneDeep(profile.personal.webLinks);
    typedWebLinks = typedWebLinks.map(item => {
      item.itemMeta = { type: fieldTypes.personWebLink, show: true };
      return item;
    });
    let links = {
      id: 'webLinks',
      label: 'Linkit',
      items: cloneDeep(typedWebLinks)
    };
    contact.push(links);

    profileFormattedTemp.push({
      id: 'contact', label: 'Yhteystiedot', fields: contact
    });

    // 2/8 --- DESCRIPTION
    cloneDeep(profile.personal.researcherDescriptions[0]);
    const description = {
      id: 'description',
      label: 'Tutkimustoiminnan kuvaus',
      fields: []
    };
    const descriptionTyped = [];
    const itemMeta = { show: true, type: 140 };
    descriptionTyped.push(cloneDeep(profile.personal.researcherDescriptions[0]));
    descriptionTyped[0].itemMeta = itemMeta;

    description.fields.push({
      id: 'researchDescription',
      label: 'Kuvaus',
      items: cloneDeep(descriptionTyped)
    });
    profileFormattedTemp.push(description);


    // KEYWORDS
    const keywordsTyped = profile.personal.keywords.map(item => {
      item.itemMeta = { show: true, type: fieldTypes.personKeyword };
      return item;
    });
    description.fields.push({ id: 'keywords', label: 'Avainsanat', items: keywordsTyped });

    // 3/8 --- AFFILIATIONS
    const affiliationObj = {
      id: groupTypes.affiliation, label: 'Affiliaatiot', fields: [{
        id: 'affiliation', label: 'Affiliaatiot', items: cloneDeep(profile.activity.affiliations)
      }]
    };
    profileFormattedTemp.push(affiliationObj);

    // 4/8 --- EDUCATION
    const educationObj = {
      id: groupTypes.education, label: 'Koulutus', fields: [{
        id: 'education', label: 'Koulutus', items: cloneDeep(profile.activity.educations)
      }]
    };
    profileFormattedTemp.push(educationObj);

    // 5/8 --- PUBLICATION
    let typedPublications = cloneDeep(profile.activity.publications);
    typedPublications = typedPublications.map(item => {
      item.itemMeta = { type: fieldTypes.activityPublication, show: true };
      return item;
    });

    const publication = {
      id: groupTypes.publication,
      label: 'Julkaisut',
      fields: [{ id: 'publication', label: 'Julkaisut', items: typedPublications }]
    };
    profileFormattedTemp.push(publication);

    // 6/8 --- DATASET
    let typedDatasets = cloneDeep(profile.activity.researchDatasets);
    typedDatasets = typedDatasets.map(item => {
      item.itemMeta = { type: fieldTypes.activityDataset, show: true };
      return item;
    });

    const dataset = {
      id: groupTypes.dataset,
      label: 'Aineistot',
      fields: [{ id: 'dataset', label: 'Aineistot', items: typedDatasets }]
    };
    profileFormattedTemp.push(dataset);

    // 7/8 --- FUNDING
    let typedFundings = cloneDeep(profile.activity.fundingDecisions);
    typedFundings = typedFundings.map(item => {
      item.itemMeta = { type: fieldTypes.activityFunding, show: true };
      return item;
    });

    const funding = {
      id: groupTypes.funding,
      label: 'Myönnetty rahoitus',
      fields: [{ id: 'funding', label: 'Myönnetty rahoitus', items: typedFundings }]
    };
    profileFormattedTemp.push(funding);

    // 8/8 --- ACTIVITIES AND REWARDS
    const activities = {
      id: groupTypes.activitiesAndRewards,
      label: 'Aktiviteetit ja palkinnot',
      fields: [{
        id: 'activitiesAndRewards',
        label: 'Aktiviteetit ja palkinnot',
        items: cloneDeep(profile.activity.activitiesAndRewards)
      }]
    };
    profileFormattedTemp.push(activities);

    // 9/8 --- COOPERATION
    const allOptionsSelected = profile.cooperation.map(item => {
      item.selected = true;
      return item;
    });

    const cooperationObj = {
      id: 'cooperation',
      label: 'Yhteistyö',
      fields: allOptionsSelected
    };
    profileFormattedTemp.push(cooperationObj);

    console.log('FORMATTED PROFILE', profileFormattedTemp);
    return profileFormattedTemp;
  }
}

// Point of language test is to populate data if no content available in current locale.
function checkTranslation(field, item, localeId) {
  // tslint:disable-next-line: curly
  if (!item) return undefined;
  // Change locale to field name format
  const capitalizedLocale =
    localeId.charAt(0).toUpperCase() + localeId.slice(1);
  // Get the content based on the current locale
  const content = item[field + capitalizedLocale]?.toString()?.trim() || '';
  // Check if the original locale has valuable content
  const contentIsValid = UtilityService.stringHasContent(content);

  // Dont perform checks if content is valid
  if (contentIsValid) {
    return content;
  }
  // Return content based on locale and priority if field doesn't exist in its original locale
  let res;
  switch (localeId) {
    case 'fi': {
      res = UtilityService.stringHasContent(item[field + 'En'])
        ? item[field + 'En']
        : item[field + 'Sv'];
      break;
    }
    case 'en': {
      res = UtilityService.stringHasContent(item[field + 'Fi'])
        ? item[field + 'Fi']
        : item[field + 'Sv'];
      break;
    }
    case 'sv': {
      res = UtilityService.stringHasContent(item[field + 'En'])
        ? item[field + 'En']
        : item[field + 'Fi'];
      break;
    }
  }
  // If still no content and Und exists, take that
  res =
    !UtilityService.stringHasContent(res) && item[field + 'Und']
      ? item[field + 'Und']
      : res;
  return res;
}