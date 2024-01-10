import { Component, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import {
  getArticleTypeCodeAdditions, getFieldsOfScienceAdditions,
  getPublisherInternationalityAdditions, getJufoClassCodeAdditions,
  getLanguageCodeAdditions,
  getOrganizationAdditions,
  getParentPublicationTypeAdditions,
  getPeerReviewedAdditions,
  getPublicationAudienceAdditions,
  getPublicationFormatAdditions, getPublicationTypeCodeAdditions,
  getYearAdditions,
  HighlightedPublication,
  Publication2Service
} from '@portal/services/publication2.service';
import { map, take, tap } from 'rxjs/operators';
import { SharedModule } from '@shared/shared.module';
import { SearchBar2Component } from '@portal/search-bar2/search-bar2.component';
import { NgArrayPipesModule } from 'ngx-pipes';
import { OrganizationFilterComponent } from '@portal/components/organization-filter/organization-filter.component';
import { FilterOptionComponent } from '@portal/components/filter-option/filter-option.component';
import { LimitPipe } from '@portal/pipes/limit.pipe';
import { CollapsibleComponent } from '@portal/components/collapsible/collapsible.component';
import { MatButtonModule } from '@angular/material/button';
import { FilterLimitButtonComponent } from '@portal/components/filter-limit-button/filter-limit-button.component';
import { FirstDigitPipe } from '@shared/pipes/first-digit.pipe';
import { FirstLetterPipe } from '@shared/pipes/first-letter.pipe';

@Component({
  selector: 'app-publications2',
  templateUrl: './publications2.component.html',
  styleUrls: ['./publications2.component.scss'],
  imports: [CdkTableModule, FormsModule, AsyncPipe, JsonPipe, NgForOf, NgIf, LimitPipe, NgArrayPipesModule,
    SharedModule, //TODO not good?
    FormsModule,
    RouterModule,
    SearchBar2Component, OrganizationFilterComponent, FilterOptionComponent, CollapsibleComponent, MatButtonModule, NgStyle, FilterLimitButtonComponent, FirstDigitPipe, FirstLetterPipe, RouterLink
  ],
  standalone: true
})
export class Publications2Component implements OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  publications2Service = inject(Publication2Service);

  keywords = "";
  page = 1;
  size = 10;

  labelText = {
    yearOfPublication: $localize`:@@yearOfPublication:Julkaisuvuosi`,
    organization: $localize`:@@organization:Organisaatio`,
    fieldOfScience: $localize`:@@fieldOfScience:Tieteenala`,
    publicationType: $localize`:@@publicationType:Julkaisutyyppi`,
    publicationFormat: $localize`:@@publicationFormat:Julkaisumuoto`,
    publicationAudience: $localize`:@@publicationAudience:Julkaisun yleisö`,
    parentPublicationType: $localize`:@@parentPublicationType:Emojulkaisun tyyppi`,
    articleType: $localize`:@@articleType:Artikkelin tyyppi`,
    peerReviewed: $localize`:@@peerReviewed:Vertaisarvioitu`,
    publisherInternationality: $localize`:@@publisherInternationality:Kustantajan kansainvälisyys`,
    language: $localize`:@@language:Kieli`,
    jufoLevel: $localize`:@@jufoLevel:Julkaisufoorumitaso`,
  }

  publicationTypeLabels = [
    {id: "A", text: $localize`:@@publicationClassA:Vertaisarvioidut tieteelliset artikkelit`},
    {id: "B", text: $localize`:@@publicationClassB:Vertaisarvioimattomat tieteelliset kirjoitukset`},
    {id: "C", text: $localize`:@@publicationClassC:Tieteelliset kirjat`},
    {id: "D", text: $localize`:@@publicationClassD:Ammattiyhteisölle suunnatut julkaisut`},
    {id: "E", text: $localize`:@@publicationClassE:Suurelle yleisölle suunnatut julkaisut`},
    {id: "F", text: $localize`:@@publicationClassF:Julkinen taiteellinen ja taideteollinen toiminta`},
    {id: "G", text: $localize`:@@publicationClassG:Opinnäytteet`},
    {id: "I", text: $localize`:@@publicationClassI:Audiovisuaaliset julkaisut ja tieto- ja viestintätekniset sovellukset`},
  ];


  filterCount$ = new BehaviorSubject(0);
  filterCountLookup: Record<string, number> = {};

  updateFilterCount(key: string, value: number) {
    this.filterCountLookup[key] = value;
    const count = Object.values(this.filterCountLookup).reduce((a, b) => a + b, 0);

    this.filterCount$.next(count);
  }

  displayedColumns: string[] = ['publicationName', 'authorsText', 'publisherName', 'publicationYear'];

  highlights$ = this.publications2Service.getSearch(); // TODO: /*: Observable<HighlightedPublication[]>*/
  dataSource = new PublicationDataSource(this.highlights$);

  searchParams$ = this.route.queryParams.pipe( map(splitFields) );
  aggregations$ = this.publications2Service.getAggregations();

  yearAdditions$ = this.aggregations$.pipe(
    map(aggs => getYearAdditions(aggs).map((bucket: any) => ({ year: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.year - a.year))
  );

  yearFilters$ = combineLatest([this.yearAdditions$, this.searchParams$.pipe(map(params => params.year ?? []))]).pipe(
    map(([yearAdditions, enabledFilters]) => yearAdditions.map(yearAddition => ({
      year: yearAddition.year,
      count: yearAddition.count,
      enabled: enabledFilters.includes(yearAddition.year.toString())
    }))),
    tap(filters => this.updateFilterCount("year", filters.filter(filter => filter.enabled).length))
  );

  organizationNames$ = this.publications2Service.getOrganizationNames();

  organizationAdditions$ = this.aggregations$.pipe(
    map(aggs => getOrganizationAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count})) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  organizationFilters$ = combineLatest([this.organizationAdditions$, this.organizationNames$, this.searchParams$.pipe(map(params => params.organization ?? []))]).pipe(
    map(([organizationAdditions, organizationNames, enabledFilters]) => organizationAdditions.map(organizationAddition => ({
      id: organizationAddition.id,
      count: organizationAddition.count,
      name: organizationNames[organizationAddition.id].name,
      sectorId: organizationNames[organizationAddition.id].sectorId,
      enabled: enabledFilters.includes(organizationAddition.id)
    }))),
    tap(filters => this.updateFilterCount("organization", filters.filter(filter => filter.enabled).length))
  );

  languageCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getLanguageCodeAdditions(aggs).map((bucket: any) => ({ languageCode: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  languageCodeNames$ = this.publications2Service.getLanguageCodeNames();

  languageCodeFilters$ = combineLatest([this.languageCodeAdditions$, this.languageCodeNames$, this.searchParams$.pipe(map(params => params.language ?? []))]).pipe(
    map(([languageCodeAdditions, languageCodeNames, enabledFilters]) => languageCodeAdditions.map(languageCodeAddition => ({
      id: languageCodeAddition.languageCode,
      count: languageCodeAddition.count,
      name: languageCodeNames[languageCodeAddition.languageCode],
      enabled: enabledFilters.includes(languageCodeAddition.languageCode)
    }))),
    tap(filters => this.updateFilterCount("language", filters.filter(filter => filter.enabled).length))
  );

  publicationFormatNames$ = this.publications2Service.getPublicationFormatNames();

  publicationFormatAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationFormatAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publicationFormatFilters$ = combineLatest([this.publicationFormatAdditions$, this.publicationFormatNames$, this.searchParams$.pipe(map(params => params.format ?? []))]).pipe(
    map(([publicationFormatAdditions, publicationFormatNames, enabledFilters]) => publicationFormatAdditions.map(publicationFormatAddition => ({
      id: publicationFormatAddition.id,
      count: publicationFormatAddition.count,
      name: publicationFormatNames[publicationFormatAddition.id],
      enabled: enabledFilters.includes(publicationFormatAddition.id)
    }))),
    tap(filters => this.updateFilterCount("format", filters.filter(filter => filter.enabled).length))
  );

  publicationAudienceNames$ = this.publications2Service.getPublicationAudienceNames();

  publicationAudienceAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationAudienceAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publicationAudienceFilters$ = combineLatest([this.publicationAudienceAdditions$, this.publicationAudienceNames$, this.searchParams$.pipe(map(params => params.audience ?? []))]).pipe(
    map(([publicationAudienceAdditions, publicationAudienceNames, enabledFilters]) => publicationAudienceAdditions.map(publicationAudienceAddition => ({
      id: publicationAudienceAddition.id,
      count: publicationAudienceAddition.count,
      name: publicationAudienceNames[publicationAudienceAddition.id],
      enabled: enabledFilters.includes(publicationAudienceAddition.id)
    }))),
    tap(filters => this.updateFilterCount("audience", filters.filter(filter => filter.enabled).length))
  );

  peerReviewedAdditions$ = this.aggregations$.pipe(
    map(aggs => getPeerReviewedAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  peerReviewedNames$ = this.publications2Service.getPeerReviewedNames();

  peerReviewedFilters$ = combineLatest([this.peerReviewedAdditions$, this.peerReviewedNames$, this.searchParams$.pipe(map(params => params.peerReviewed ?? []))]).pipe(
    map(([peerReviewedAdditions, peerReviewedNames, enabledFilters]) => peerReviewedAdditions.map(peerReviewedAddition => ({
      id: peerReviewedAddition.id,
      count: peerReviewedAddition.count,
      name: peerReviewedNames[peerReviewedAddition.id],
      enabled: enabledFilters.includes(peerReviewedAddition.id)
    }))),
    tap(filters => this.updateFilterCount("peerReviewed", filters.filter(filter => filter.enabled).length))
  );

  // getParentPublicationTypeAdditions
  // getInternationalPublicationAdditions
  // getArticleTypeCodeAdditions
  // getJufoClassCodeAdditions

  parentPublicationTypeAdditions$ = this.aggregations$.pipe(
    map(aggs => getParentPublicationTypeAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  // publisherInternationalityAdditions$
  publisherInternationalityAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublisherInternationalityAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  // publisherInternationalityNames$
  publisherInternationalityNames$ = this.publications2Service.getInternationalPublicationNames();

  // publisherInternationalityFilters$
  publisherInternationalityFilters$ = combineLatest([this.publisherInternationalityAdditions$, this.publisherInternationalityNames$, this.searchParams$.pipe(map(params => params.international ?? []))]).pipe(
    map(([internationalPublicationAdditions, internationalPublicationNames, enabledFilters]) => internationalPublicationAdditions.map(internationalPublicationAddition => ({
      id: internationalPublicationAddition.id,
      count: internationalPublicationAddition.count,
      name: internationalPublicationNames[internationalPublicationAddition.id],
      enabled: enabledFilters.includes(internationalPublicationAddition.id)
    }))),
    tap(filters => this.updateFilterCount("international", filters.filter(filter => filter.enabled).length))
  );

  articleTypeCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getArticleTypeCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  articleTypeCodeNames$ = this.publications2Service.getArticleTypeCodeNames();

  articleTypeCodeFilters$ = combineLatest([this.articleTypeCodeAdditions$, this.articleTypeCodeNames$, this.searchParams$.pipe(map(params => params.articleType ?? []))]).pipe(
    map(([articleTypeCodeAdditions, articleTypeCodeNames, enabledFilters]) => articleTypeCodeAdditions.map(articleTypeCodeAddition => ({
      id: articleTypeCodeAddition.id,
      count: articleTypeCodeAddition.count,
      name: articleTypeCodeNames[articleTypeCodeAddition.id],
      enabled: enabledFilters.includes(articleTypeCodeAddition.id)
    }))),
    tap(filters => this.updateFilterCount("articleType", filters.filter(filter => filter.enabled).length))
  );

  jufoClassCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getJufoClassCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  jufoClassCodeFilters$ = combineLatest([this.jufoClassCodeAdditions$, this.searchParams$.pipe(map(params => params.jufo ?? []))]).pipe(
    map(([jufoClassCodeAdditions, enabledFilters]) => jufoClassCodeAdditions.map(jufoClassCodeAddition => ({
      id: jufoClassCodeAddition.id,
      count: jufoClassCodeAddition.count,
      name: jufoClassCodeAddition.id,
      enabled: enabledFilters.includes(jufoClassCodeAddition.id)
    }))),
    tap(filters => this.updateFilterCount("jufo", filters.filter(filter => filter.enabled).length))
  );

  fieldsOfScienceNames$ = this.publications2Service.getFieldsOfScienceNames();

  fieldsOfScienceAdditions$ = this.aggregations$.pipe(
    map(aggs => getFieldsOfScienceAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  fieldsOfScienceFilters$ = combineLatest([this.fieldsOfScienceAdditions$, this.fieldsOfScienceNames$, this.searchParams$.pipe(map(params => params.fieldsOfScience ?? []))]).pipe(
    map(([fieldsOfScienceAdditions, fieldsOfScienceNames, enabledFilters]) => fieldsOfScienceAdditions.map(fieldsOfScienceAddition => ({
      id: fieldsOfScienceAddition.id,
      count: fieldsOfScienceAddition.count,
      name: fieldsOfScienceNames[fieldsOfScienceAddition.id],
      enabled: enabledFilters.includes(fieldsOfScienceAddition.id)
    }))),
    tap(filters => this.updateFilterCount("fieldsOfScience", filters.filter(filter => filter.enabled).length))
  );

  publicationTypeCodeNames$ = this.publications2Service.getPublicationTypeCodeNames();

  publicationTypeCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationTypeCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publicationTypeCodeFilters$ = combineLatest([this.publicationTypeCodeAdditions$, this.publicationTypeCodeNames$, this.searchParams$.pipe(map(params => params.publicationTypeCode ?? []))]).pipe(
    map(([publicationTypeCodeAdditions, publicationTypeCodeNames, enabledFilters]) => publicationTypeCodeAdditions.map(publicationTypeCodeAddition => ({
      id: publicationTypeCodeAddition.id,
      count: publicationTypeCodeAddition.count,
      name: publicationTypeCodeNames[publicationTypeCodeAddition.id],
      enabled: enabledFilters.includes(publicationTypeCodeAddition.id)
    }))),
    tap(filters => this.updateFilterCount("publicationTypeCode", filters.filter(filter => filter.enabled).length))
  );

  // getParentPublicationTypeNames
  // getInternationalPublicationNames
  // getArticleTypeCodeNames

  parentPublicationTypeNames$ = this.publications2Service.getParentPublicationTypeNames();

  // TODO these give just ids and not names
  // internationalPublicationNames$ = this.publications2Service.getInternationalPublicationNames();
  // articleTypeCodeNames$ = this.publications2Service.getArticleTypeCodeNames();

  parentPublicationTypeFilters$ = combineLatest([this.parentPublicationTypeAdditions$, this.parentPublicationTypeNames$, this.searchParams$.pipe(map(params => params.parentPublicationType ?? []))]).pipe(
    map(([parentPublicationTypeAdditions, parentPublicationTypeNames, enabledFilters]) => parentPublicationTypeAdditions.map(parentPublicationTypeAddition => ({
      id: parentPublicationTypeAddition.id,
      count: parentPublicationTypeAddition.count,
      name: parentPublicationTypeNames[parentPublicationTypeAddition.id],
      enabled: enabledFilters.includes(parentPublicationTypeAddition.id)
    }))),
    tap(filters => this.updateFilterCount("parentPublicationType", filters.filter(filter => filter.enabled).length))
  );

  public mainFieldOfScienceName = {
    "1": $localize`:@@naturalSciences:Luonnontieteet`,
    "2": $localize`:@@engineeringTecnology:Tekniikka`,
    "3": $localize`:@@medicalHealthSciences:Lääke- ja terveystieteet`,
    "4": $localize`:@@agriculturalSciences:Maatalous- ja metsätieteet`,
    "5": $localize`:@@socialSciences:Yhteiskuntatieteet`,
    "6": $localize`:@@humanities:Humanistiset tieteet`,
    // 7 not used
    "8": $localize`:@@fieldsOfArt:Taiteenala`,
  }

  /*public collapseStates = {
    "language": false,
  };*/

  public filterLimits = {
    year: 10,
    language: 10,
  };


  searchParamsSubscription = this.searchParams$.subscribe(searchParams => {
    this.publications2Service.updateSearchTerms(searchParams);

    this.keywords = searchParams.q?.[0] ?? "";
    this.page = parseInt(searchParams.page?.[0] ?? "1");
    this.size = parseInt(searchParams.size?.[0] ?? "10");
  });

  total$ = this.publications2Service.getTotal();

  ngOnDestroy() {
    this.searchParamsSubscription.unsubscribe();
  }

  toggleParam(key: string, value: string) {
    this.searchParams$.pipe(take(1)).subscribe(filterParams => {
      const queryParams = { ...filterParams };

      if (queryParams[key] == null) {
        queryParams[key] = [];
      }

      const index = queryParams[key].indexOf(value);

      if (index === -1) {
        queryParams[key].push(value);
      } else {
        queryParams[key].splice(index, 1);
      }

      if (queryParams[key].length === 0) {
        delete queryParams[key];
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: concatFields(queryParams)
      });
    });
  }

  searchKeywords(keywords: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: keywords }, queryParamsHandling: 'merge'
    });
  }

  nextPage() { // TODO CLEAN UP
    this.searchParams$.pipe(take(1)).subscribe(searchParams => {
      const queryParams = { ...searchParams };
      const page = parseInt(queryParams.page?.[0] ?? "1");
      queryParams.page = [`${page + 1}`];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams
      });
    });
  }

  previousPage() { // TODO CLEAN UP
    this.searchParams$.pipe(take(1)).subscribe(searchParams => {
      const queryParams = { ...searchParams };
      const page = parseInt(queryParams.page?.[0] ?? "1");
      queryParams.page = [`${page - 1}`];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams
      });
    });
  }

  public num = 0;

  setPageSize(size: number) {
    console.log(size);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { size }, queryParamsHandling: 'merge'
    });
  }

  clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}

export class PublicationDataSource extends DataSource<HighlightedPublication> {
  constructor(private data$: Observable<HighlightedPublication[]>) {
    super();
  }

  connect(): Observable<HighlightedPublication[]> {
    return this.data$;
  }

  disconnect() { /**/ }
}

function concatParams(strings: string[]): string {
  return strings.sort().join(",");
}

function splitParams(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.flatMap(item => item.split(","));
  }

  return input.split(",");
}

function splitFields(obj: Record<string, string | string[]>): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const key in obj) {
    const value = obj[key];
    result[key] = splitParams(value);
  }

  return result;
}

function concatFields(obj: Record<string, string[]>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    result[key] = concatParams(value);
  }

  return result;
}
