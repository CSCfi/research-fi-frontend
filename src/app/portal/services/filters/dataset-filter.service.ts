import { isNgTemplate } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { StaticDataService } from '../static-data.service';
import { FilterMethodService } from './filter-method.service';

@Injectable({
  providedIn: 'root',
})
export class DatasetFilterService {
  filterData = [
    {
      field: 'year',
      label: $localize`:@@yearOfPublication:Julkaisuvuosi`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: true,
      tooltip: '',
    },
    {
      field: 'organization',
      label: $localize`:@@organization:Organisaatio`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
      hideSearch: false,
      tooltip: $localize`:@@datasetOrgFilterTooltip:Tutkimukseen tai aineiston tekemiseen osallistuneet organisaatiot. Palvelu ei toistaiseksi sisällä tietoja aineistojen ulkomaisista organisaatioista.`,
    },
    {
      field: 'dataSource',
      label: $localize`:@@datasetSource:Tietolähde`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: false,
      tooltip: $localize`:@@datasetSourceFilterTooltip:Lähde, josta aineisto on peräisin.`,
    },
    {
      field: 'field',
      label: $localize`:@@fieldOfScience:Tieteenala`,
      hasSubFields: true,
      open: false,
      limitHeight: true,
      hideSearch: false,
      tooltip: $localize`:@@datasetFieldFilterTooltip:Tilastokeskuksen tieteenalaluokitus`,
    },
    {
      field: 'accessType',
      label: $localize`:@@datasetAccess:Saatavuus`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: false,
      tooltip:
        '<p><strong>' +
        $localize`:@@datasetAccessOpen:Avoin` +
        ': </strong>' +
        $localize`:@@datasetAccessOpenTooltip:Aineisto on avoimesti saatavilla` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu` +
        ': </strong>' +
        $localize`:@@datasetAccessRestrictedTooltip:Aineiston saatavuutta on rajoitettu. Katso rajoituksen tarkemmat tiedot aineiston lähteestä.` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessLogin:Vaatii kirjautumisen` +
        ': </strong>' +
        $localize`:@@datasetAccessLoginTooltip:Pääsy aineistoon vaatii kirjautumisen Fairdata-palvelussa.` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessPermit:Vaatii luvan` +
        ': </strong>' +
        $localize`:@@datasetAccessPermitTooltip:Pääsy aineistoon vaatii luvan hakemista Fairdata-palvelussa.` +
        '</p><p><strong>' +
        $localize`:@@datasetAccessEmbargo:Embargo` +
        ': </strong>' +
        $localize`:@@datasetAccessEmbargoTooltip:Embargo eli julkaisuviive määrittää ajankohdan, jolloin aineisto on saatavilla.` +
        '</p>',
    },
    {
      field: 'lang',
      label: $localize`:@@language:Kieli`,
      hasSubFields: false,
      open: true,
      limitHeight: true,
      hideSearch: false,
      tooltip: $localize`:@@datasetLangFilterTooltip:Aineistossa käytetty kieli.`,
    },
  ];

  singleFilterData = [];

  constructor(private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data.aggregations;
    source.year.buckets = this.mapYear(source.year.years.buckets);
    source.organization = this.organization(source.organization);
    source.dataSource.buckets = this.filterEmptyKeys(source.dataSource.dataSources.buckets);
    source.lang.buckets = this.lang(source.lang.langs.buckets);
    
    source.field.buckets = this.minorField(
      source.field.fields.buckets.filter(
        (item) => item.doc_count > 0
      )
    );

    source.accessType.buckets = this.accessType(source.accessType.accessTypes.buckets);
    source.shaped = true;
    return source;
  }

  filterEmptyKeys(arr) {
    return arr.filter((item) => item.key !== ' ');
  }

  mapYear(data) {
    const clone = cloneDeep(data);
    clone.map((item) => {
      item.key = item.key.toString();
    });
    return clone;
  }

  organization(data) {
    const source = cloneDeep(data) || [];
    source.buckets = source.sectorName ? source.sectorName.buckets : [];
    source.buckets.forEach((item) => {
      item.subData = item.org.buckets.filter(
        (x) => x.doc_count > 0 && x.key.trim().length > 0
      );
      item.subData.map((subItem) => {
        subItem.label = subItem.label || subItem.key;
        subItem.key = subItem.orgId.buckets[0].key;
        subItem.doc_count = subItem.doc_count;
      });
      item.doc_count = item.subData
        .map((s) => s.doc_count)
        .reduce((a, b) => a + b, 0);
    });
    return source;
  }

  minorField(data) {
    if (data.length) {
      // check if major aggregation is available
      const combinedMajorFields = data.length
        ? this.filterMethodService.separateMinor(data ? data : [], 'dataset')
        : [];

      const result = cloneDeep(this.staticDataService.majorFieldsOfScience);

      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (result[i]) {
          result[i].subData = combinedMajorFields[i];
          // Add doc counts to major fields of science
          result[i].doc_count = result[i].subData
            .map((x) => x.doc_count)
            .reduce((a, b) => a + b, 0);
        }
      }

      return [...result.filter((item) => item.subData.length > 0)];
    }
  }

  accessType(data) {
    data.forEach(type => {
      switch (type.key) {
        case 'open': {
          type.label = $localize`:@@datasetAccessOpen:Avoin`;
          break;
        }
        case 'permit': {
          type.label = $localize`:@@datasetAccessPermit:Vaatii luvan hakemista Fairdata-palvelussa`;
          break;
        }
        case 'login': {
          type.label = $localize`:@@datasetAccessLogin:Vaatii kirjautumisen Fairdata-palvelussa`;
          break;
        }
        case 'restricted': {
          type.label = $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu`;
          break;
        }
        case 'embargo': {
          type.label = $localize`:@@datasetAccessEmbargo:Embargo`;
          break;
        }
      }
    })
    return data;
  }

  lang(data) {
    const langs = data.map(lang => {
      return {
        label: lang.language.buckets[0]?.key !== 'undefined'
          ? lang.language.buckets[0]?.key
          : $localize`:@@notKnown:Ei tiedossa`,
        key: lang.key.toLowerCase(),
        doc_count: lang.doc_count
      }
    });
    // Move no language content to the end
    const noLangIdx = langs.findIndex(x => x.key === 'zxx');
    langs.push(...langs.splice(noLangIdx, 1));

    return langs.filter(lang => lang.key !== ' '); 
  }

}
