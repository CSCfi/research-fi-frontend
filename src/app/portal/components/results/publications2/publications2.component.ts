import { Component, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe, NgForOf, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  getArticleTypeCodeAdditions,
  getFieldsOfScienceAdditions,
  getJufoClassCodeAdditions,
  getLanguageCodeAdditions,
  getOpenAccessAdditions,
  getOrganizationAdditions,
  getParentPublicationTypeAdditions,
  getPeerReviewedAdditions,
  getPublicationAudienceAdditions,
  getPublicationFormatAdditions,
  getPublicationTypeCodeAdditions,
  getPublisherInternationalityAdditions,
  getPublisherOpenAccessCodeAdditions,
  getSelfArchivedCodeAdditions,
  getYearAdditions,
  HighlightedPublication,
  Publication2Service, SearchParams
} from '@portal/services/publication2.service';
import { filter, map, take, tap } from 'rxjs/operators';
// import { SharedModule } from '@shared/shared.module';
import { SearchBar2Component } from '@portal/search-bar2/search-bar2.component';
import { NgArrayPipesModule, NgMathPipesModule } from 'ngx-pipes';
import { OrganizationFilterComponent } from '@portal/components/organization-filter/organization-filter.component';
import { FilterOptionComponent } from '@portal/components/filter-option/filter-option.component';
import { LimitPipe } from '@portal/pipes/limit.pipe';
import { CollapsibleComponent } from '@portal/components/collapsible/collapsible.component';
import { MatButtonModule } from '@angular/material/button';
import { FilterLimitButtonComponent } from '@portal/components/filter-limit-button/filter-limit-button.component';
import { FirstDigitPipe } from '@shared/pipes/first-digit.pipe';
import { FirstLetterPipe } from '@shared/pipes/first-letter.pipe';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { ColumnSorterComponent } from '@shared/components/column-sorter/column-sorter.component';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { SecondaryButtonComponent } from '@shared/components/buttons/secondary-button/secondary-button.component';
import { TagPeerReviewedComponent } from '@shared/components/tags/tag-peer-reviewed/tag-peer-reviewed.component';
import { TagOpenAccessComponent } from '@shared/components/tags/tag-open-access/tag-open-access.component';
import { TagDoiComponent } from '@shared/components/tags/tag-doi/tag-doi.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-publications2',
  templateUrl: './publications2.component.html',
  styleUrls: ['./publications2.component.scss'],
  imports: [CdkTableModule, FormsModule, AsyncPipe, JsonPipe, NgForOf, NgIf, LimitPipe, NgArrayPipesModule,
    // SharedModule, //TODO do not depend on shared module
    FormsModule,
    RouterModule,
    SearchBar2Component, OrganizationFilterComponent, FilterOptionComponent, CollapsibleComponent, MatButtonModule, NgStyle, FilterLimitButtonComponent, FirstDigitPipe, FirstLetterPipe, RouterLink,
    LayoutModule, ColumnSorterComponent, NgTemplateOutlet, NgMathPipesModule, PaginationComponent, PrimaryActionButtonComponent, SecondaryButtonComponent, TagPeerReviewedComponent, TagOpenAccessComponent, TagDoiComponent, SvgSpritesComponent
  ],
  standalone: true
})
export class Publications2Component implements OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  publications2Service = inject(Publication2Service);
  breakpointObserver = inject(BreakpointObserver);
  dialog = inject(Dialog);

  keywords = "";
  page = 1;
  size = 10;

  sort = "";

  dialogRef?: DialogRef<any>;
  @ViewChild('searchDialog') dialogTemplate: TemplateRef<any>;

  // Dialog for insturctions / tutorial
  tutorialDialogRef?: DialogRef<any>;
  @ViewChild('tutorialDialog') tutorialDialogTemplate: TemplateRef<any>;

  openTutorialDialog() {
    this.tutorialDialogRef = this.dialog.open(this.tutorialDialogTemplate, {
      panelClass: 'large-responsive-panel',
    });

    this.tutorialDialogRef.closed.subscribe(() => {
      console.log('The tutorial dialog was closed');
    });
  }

  closeTutorialDialog() {
    this.tutorialDialogRef?.close();
  }

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
    openAccess: $localize`:@@openAccess:Avoin saatavuus`,
    publisherOpenAccess: $localize`:@@publisherOpenAccess:Julkaisukanavan avoin saatavuus`,
    selfArchivedCode: $localize`:@@selfArchivedCode:Rinnakkaistallenne`,
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

  openDialog() {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      panelClass: 'fullscreen-panel',
    });

    this.dialogRef.closed.subscribe(() => {
      console.log('The dialog2 was closed');
    });
  }

  closeDialog() {
    this.dialogRef?.close();
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.keywords,
        page: this.page.toString(),
        size: this.size.toString(),
      }
    });
  }

  displayedColumns: string[] = ['icon', 'publicationName', 'authorsText', 'publisherName', 'publicationYear'];

  highlights$ = this.publications2Service.getSearch(); // TODO: /*: Observable<HighlightedPublication[]>*/
  dataSource = new PublicationDataSource(this.highlights$);

  searchParams$ = this.route.queryParams.pipe( map(splitFields) );
  aggregations$ = this.publications2Service.getAggregations();

  yearAdditions$ = this.aggregations$.pipe(
    map(aggs => getYearAdditions(aggs)
      .map((bucket: any) => ({ year: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.year - a.year))
  );

  enabledYearFilters$ = this.searchParams$.pipe(map(params => params.year ?? []));

  yearFilters$ = combineLatest([this.yearAdditions$, this.enabledYearFilters$]).pipe(
    map(([yearAdditions, enabledFilters]) => yearAdditions.map(yearAddition => ({
      year: yearAddition.year,
      count: yearAddition.count,
      enabled: enabledFilters.includes(yearAddition.year.toString())
    })))
  );

  organizationNames$ = this.publications2Service.getOrganizationNames();

  organizationAdditions$ = this.aggregations$.pipe(
    map(aggs => getOrganizationAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count})) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  enabledOrganizationFilters$ = this.searchParams$.pipe(map(params => params.organization ?? []));

  enabledOrganizationFiltersWithNames$ = combineLatest([this.enabledOrganizationFilters$, this.organizationNames$]).pipe(
    map(([enabledFilters, organizationNames]) => enabledFilters.map(filter => ({ id: filter, name: organizationNames[filter].name })))
  );

  organizationFilters$ = combineLatest([this.organizationAdditions$, this.organizationNames$, this.enabledOrganizationFilters$]).pipe(
    map(([organizationAdditions, organizationNames, enabledFilters]) => organizationAdditions.map(organizationAddition => ({
      id: organizationAddition.id,
      count: organizationAddition.count,
      name: organizationNames[organizationAddition.id].name,
      sectorId: organizationNames[organizationAddition.id].sectorId,
      enabled: enabledFilters.includes(organizationAddition.id)
    })))
  );

  languageCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getLanguageCodeAdditions(aggs).map((bucket: any) => ({ languageCode: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  languageCodeNames$ = this.publications2Service.getLanguageCodeNames();

  enabledLanguageCodeFilters$ = this.searchParams$.pipe(map(params => params.language ?? []));

  enabledLanguageCodeFiltersWithNames$ = combineLatest([this.enabledLanguageCodeFilters$, this.languageCodeNames$]).pipe(
    map(([enabledFilters, languageCodeNames]) => enabledFilters.map(filter => ({ id: filter, name: languageCodeNames[filter] })))
  );

  languageCodeFilters$ = combineLatest([this.languageCodeAdditions$, this.languageCodeNames$, this.enabledLanguageCodeFilters$]).pipe(
    map(([languageCodeAdditions, languageCodeNames, enabledFilters]) => languageCodeAdditions.map(languageCodeAddition => ({
      id: languageCodeAddition.languageCode,
      count: languageCodeAddition.count,
      name: languageCodeNames[languageCodeAddition.languageCode],
      enabled: enabledFilters.includes(languageCodeAddition.languageCode)
    })))
  );

  publicationFormatNames$ = this.publications2Service.getPublicationFormatNames();

  publicationFormatAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationFormatAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.filter(publicationFormatAddition => publicationFormatAddition.id !== "-1")),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  enabledPublicationFormatFilters$ = this.searchParams$.pipe(map(params => params.format ?? []));

  enabledPublicationFormatFiltersWithNames$ = combineLatest([this.enabledPublicationFormatFilters$, this.publicationFormatNames$]).pipe(
    map(([enabledFilters, publicationFormatNames]) => enabledFilters.map(filter => ({ id: filter, name: publicationFormatNames[filter] })))
  );

  publicationFormatFilters$ = combineLatest([this.publicationFormatAdditions$, this.publicationFormatNames$, this.enabledPublicationFormatFilters$]).pipe(
    map(([publicationFormatAdditions, publicationFormatNames, enabledFilters]) => publicationFormatAdditions.map(publicationFormatAddition => ({
      id: publicationFormatAddition.id,
      count: publicationFormatAddition.count,
      name: publicationFormatNames[publicationFormatAddition.id],
      enabled: enabledFilters.includes(publicationFormatAddition.id)
    })))
  );

  publicationAudienceNames$ = this.publications2Service.getPublicationAudienceNames();

  publicationAudienceAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationAudienceAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.filter(publicationAudienceAddition => publicationAudienceAddition.id !== "-1")),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  enabledPublicationAudienceFilters$ = this.searchParams$.pipe(map(params => params.audience ?? []));

  enabledPublicationAudienceFiltersWithNames$ = combineLatest([this.enabledPublicationAudienceFilters$, this.publicationAudienceNames$]).pipe(
    map(([enabledFilters, publicationAudienceNames]) => enabledFilters.map(filter => ({ id: filter, name: publicationAudienceNames[filter] })))
  );

  publicationAudienceFilters$ = combineLatest([this.publicationAudienceAdditions$, this.publicationAudienceNames$, this.enabledPublicationAudienceFilters$]).pipe(
    map(([publicationAudienceAdditions, publicationAudienceNames, enabledFilters]) => publicationAudienceAdditions.map(publicationAudienceAddition => ({
      id: publicationAudienceAddition.id,
      count: publicationAudienceAddition.count,
      name: publicationAudienceNames[publicationAudienceAddition.id],
      enabled: enabledFilters.includes(publicationAudienceAddition.id)
    })))
  );

  peerReviewedAdditions$ = this.aggregations$.pipe(
    map(aggs => getPeerReviewedAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.filter(peerReviewedAddition => ![' ', '-1'].includes(peerReviewedAddition.id))),
    map(aggs => aggs.sort((a, b) => b.count - a.count)),
  );

  peerReviewedNames$ = this.publications2Service.getPeerReviewedNames();

  enabledPeerReviewedFilters$ = this.searchParams$.pipe(map(params => params.peerReviewed ?? []));

  enabledPeerReviewedFiltersWithNames$ = combineLatest([this.enabledPeerReviewedFilters$, this.peerReviewedNames$]).pipe(
    map(([enabledFilters, peerReviewedNames]) => enabledFilters.map(filter => ({ id: filter, name: peerReviewedNames[filter] })))
  );

  peerReviewedFilters$ = combineLatest([this.peerReviewedAdditions$, this.peerReviewedNames$, this.enabledPeerReviewedFilters$]).pipe(
    map(([peerReviewedAdditions, peerReviewedNames, enabledFilters]) => peerReviewedAdditions.map(peerReviewedAddition => ({
      id: peerReviewedAddition.id,
      count: peerReviewedAddition.count,
      name: peerReviewedNames[peerReviewedAddition.id],
      enabled: enabledFilters.includes(peerReviewedAddition.id)
    })))
  );

  parentPublicationTypeAdditions$ = this.aggregations$.pipe(
    map(aggs => getParentPublicationTypeAdditions(aggs).map((bucket: any) => ({ id: bucket.key, count: bucket.doc_count })) ?? []),
    map(aggs => aggs.filter(parentPublicationTypeAddition => parentPublicationTypeAddition.id !== "-1")),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publisherInternationalityAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublisherInternationalityAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.filter(internationalPublicationAddition => internationalPublicationAddition.id !== "9")),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publisherInternationalityNames$ = this.publications2Service.getInternationalPublicationNames();

  enabledPublisherInternationalityFilters$ = this.searchParams$.pipe(map(params => params.international ?? []));

  enabledPublisherInternationalityFiltersWithNames$ = combineLatest([this.enabledPublisherInternationalityFilters$, this.publisherInternationalityNames$]).pipe(
    map(([enabledFilters, publisherInternationalityNames]) => enabledFilters.map(filter => ({ id: filter, name: publisherInternationalityNames[filter] })))
  );

  publisherInternationalityFilters$ = combineLatest([this.publisherInternationalityAdditions$, this.publisherInternationalityNames$, this.enabledPublisherInternationalityFilters$]).pipe(
    map(([internationalPublicationAdditions, internationalPublicationNames, enabledFilters]) => internationalPublicationAdditions.map(internationalPublicationAddition => ({
      id: internationalPublicationAddition.id,
      count: internationalPublicationAddition.count,
      name: internationalPublicationNames[internationalPublicationAddition.id],
      enabled: enabledFilters.includes(internationalPublicationAddition.id)
    })))
  );

  articleTypeCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getArticleTypeCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  articleTypeCodeNames$ = this.publications2Service.getArticleTypeCodeNames();

  enabledArticleTypeCodeFilters$ = this.searchParams$.pipe(map(params => params.articleType ?? []));

  enabledArticleTypeCodeFiltersWithNames$ = combineLatest([this.enabledArticleTypeCodeFilters$, this.articleTypeCodeNames$]).pipe(
    map(([enabledFilters, articleTypeCodeNames]) => enabledFilters.map(filter => ({ id: filter, name: articleTypeCodeNames[filter] })))
  );

  articleTypeCodeFilters$ = combineLatest([this.articleTypeCodeAdditions$, this.articleTypeCodeNames$, this.enabledArticleTypeCodeFilters$]).pipe(
    map(([articleTypeCodeAdditions, articleTypeCodeNames, enabledFilters]) => articleTypeCodeAdditions.map(articleTypeCodeAddition => ({
      id: articleTypeCodeAddition.id,
      count: articleTypeCodeAddition.count,
      name: articleTypeCodeNames[articleTypeCodeAddition.id],
      enabled: enabledFilters.includes(articleTypeCodeAddition.id)
    })))
  );

  jufoClassCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getJufoClassCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  enabledJufoClassCodeFilters$ = this.searchParams$.pipe(map(params => params.jufo ?? []));

  jufoClassCodeFilters$ = combineLatest([this.jufoClassCodeAdditions$, this.enabledJufoClassCodeFilters$]).pipe(
    map(([jufoClassCodeAdditions, enabledFilters]) => jufoClassCodeAdditions.map(jufoClassCodeAddition => ({
      id: jufoClassCodeAddition.id,
      count: jufoClassCodeAddition.count,
      name: jufoClassCodeAddition.id,
      enabled: enabledFilters.includes(jufoClassCodeAddition.id)
    })))
  );

  fieldsOfScienceNames$ = this.publications2Service.getFieldsOfScienceNames();

  fieldsOfScienceAdditions$ = this.aggregations$.pipe(
    map(aggs => getFieldsOfScienceAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  enabledFieldsOfScienceFilters$ = this.searchParams$.pipe(map(params => params.fieldsOfScience ?? []));

  enabledFieldsOfScienceFiltersWithNames$ = combineLatest([this.enabledFieldsOfScienceFilters$, this.fieldsOfScienceNames$]).pipe(
    map(([enabledFilters, fieldsOfScienceNames]) => enabledFilters.map(filter => ({ id: filter, name: fieldsOfScienceNames[filter] })))
  );

  fieldsOfScienceFilters$ = combineLatest([this.fieldsOfScienceAdditions$, this.fieldsOfScienceNames$, this.enabledFieldsOfScienceFilters$]).pipe(
    map(([fieldsOfScienceAdditions, fieldsOfScienceNames, enabledFilters]) => fieldsOfScienceAdditions.map(fieldsOfScienceAddition => ({
      id: fieldsOfScienceAddition.id,
      count: fieldsOfScienceAddition.count,
      name: fieldsOfScienceNames[fieldsOfScienceAddition.id],
      enabled: enabledFilters.includes(fieldsOfScienceAddition.id)
    })))
  );

  publicationTypeCodeNames$ = this.publications2Service.getPublicationTypeCodeNames();

  publicationTypeCodeAdditions$ = this.aggregations$.pipe(
    map(aggs => getPublicationTypeCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  enabledPublicationTypeCodeFilters$ = this.searchParams$.pipe(map(params => params.publicationTypeCode ?? []));

  enabledPublicationTypeCodeFiltersWithNames$ = combineLatest([this.enabledPublicationTypeCodeFilters$, this.publicationTypeCodeNames$]).pipe(
    map(([enabledFilters, publicationTypeCodeNames]) => enabledFilters.map(filter => ({ id: filter, name: publicationTypeCodeNames[filter] })))
  );

  publicationTypeCodeFilters$ = combineLatest([this.publicationTypeCodeAdditions$, this.publicationTypeCodeNames$, this.enabledPublicationTypeCodeFilters$]).pipe(
    map(([publicationTypeCodeAdditions, publicationTypeCodeNames, enabledFilters]) => publicationTypeCodeAdditions.map(publicationTypeCodeAddition => ({
      id: publicationTypeCodeAddition.id,
      count: publicationTypeCodeAddition.count,
      name: publicationTypeCodeNames[publicationTypeCodeAddition.id],
      enabled: enabledFilters.includes(publicationTypeCodeAddition.id)
    })))
  );

  parentPublicationTypeNames$ = this.publications2Service.getParentPublicationTypeNames();

  enabledParentPublicationTypeFilters$ = this.searchParams$.pipe(map(params => params.parentPublicationType ?? []));

  enabledParentPublicationTypeFiltersWithNames$ = combineLatest([this.enabledParentPublicationTypeFilters$, this.parentPublicationTypeNames$]).pipe(
    map(([enabledFilters, parentPublicationTypeNames]) => enabledFilters.map(filter => ({ id: filter, name: parentPublicationTypeNames[filter] })))
  );

  parentPublicationTypeFilters$ = combineLatest([this.parentPublicationTypeAdditions$, this.parentPublicationTypeNames$, this.enabledParentPublicationTypeFilters$]).pipe(
    map(([parentPublicationTypeAdditions, parentPublicationTypeNames, enabledFilters]) => parentPublicationTypeAdditions.map(parentPublicationTypeAddition => ({
      id: parentPublicationTypeAddition.id,
      count: parentPublicationTypeAddition.count,
      name: parentPublicationTypeNames[parentPublicationTypeAddition.id],
      enabled: enabledFilters.includes(parentPublicationTypeAddition.id)
    })))
  );

  additionsFromOpenAccess$ = this.aggregations$.pipe(
    map(aggs => getOpenAccessAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  openAccessNames$ = this.publications2Service.getOpenAccessNames();

  enabledOpenAccessFilters$ = this.searchParams$.pipe(map(params => params.openAccess ?? []));

  enabledOpenAccessFiltersWithNames$ = combineLatest([this.enabledOpenAccessFilters$, this.openAccessNames$]).pipe(
    map(([enabledFilters, openAccessNames]) => enabledFilters.map(filter => ({ id: filter, name: openAccessNames[filter] })))
  );

  openAccessFilters$ = combineLatest([this.additionsFromOpenAccess$, this.openAccessNames$, this.enabledOpenAccessFilters$]).pipe(
    map(([additionsFromOpenAccess, openAccessNames, enabledFilters]) => additionsFromOpenAccess.map(additionFromOpenAccess => ({
      id: additionFromOpenAccess.id,
      count: additionFromOpenAccess.count,
      name: openAccessNames[additionFromOpenAccess.id],
      enabled: enabledFilters.includes(additionFromOpenAccess.id)
    })))
  );

  additionsFromPublisherOpenAccess$ = this.aggregations$.pipe(
    map(aggs => getPublisherOpenAccessCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  publisherOpenAccessNames$ = this.publications2Service.getPublisherOpenAccessNames();

  enabledPublisherOpenAccessFilters$ = this.searchParams$.pipe(map(params => params.publisherOpenAccessCode ?? []));

  enabledPublisherOpenAccessFiltersWithNames$ = combineLatest([this.enabledPublisherOpenAccessFilters$, this.publisherOpenAccessNames$]).pipe(
    map(([enabledFilters, publisherOpenAccessNames]) => enabledFilters.map(filter => ({ id: filter, name: publisherOpenAccessNames[filter] })))
  );

  publisherOpenAccessFilters$ = combineLatest([this.additionsFromPublisherOpenAccess$, this.publisherOpenAccessNames$, this.enabledPublisherOpenAccessFilters$]).pipe(
    map(([additionsFromPublisherOpenAccess, publisherOpenAccessNames, enabledFilters]) => additionsFromPublisherOpenAccess.map(additionFromPublisherOpenAccess => ({
      id: additionFromPublisherOpenAccess.id,
      count: additionFromPublisherOpenAccess.count,
      name: publisherOpenAccessNames[additionFromPublisherOpenAccess.id],
      enabled: enabledFilters.includes(additionFromPublisherOpenAccess.id)
    })))
  );

  additionsFromSelfArchivedCode$ = this.aggregations$.pipe(
    map(aggs => getSelfArchivedCodeAdditions(aggs).map((bucket: any) => ({ id: bucket.key.toString(), count: bucket.doc_count })) ?? []),
    map(aggs => aggs.sort((a, b) => b.count - a.count))
  );

  selfArchivedCodeNames$ = this.publications2Service.getSelfArchivedCodeNames();

  enabledSelfArchivedCodeFilters$ = this.searchParams$.pipe(map(params => params.selfArchivedCode ?? []));

  enabledSelfArchivedCodeFiltersWithNames$ = combineLatest([this.enabledSelfArchivedCodeFilters$, this.selfArchivedCodeNames$]).pipe(
    map(([enabledFilters, selfArchivedCodeNames]) => enabledFilters.map(filter => ({ id: filter, name: selfArchivedCodeNames[filter] })))
  );

  selfArchivedCodeFilters$ = combineLatest([this.additionsFromSelfArchivedCode$, this.selfArchivedCodeNames$, this.enabledSelfArchivedCodeFilters$]).pipe(
    map(([additionsFromSelfArchivedCode, selfArchivedCodeNames, enabledFilters]) => additionsFromSelfArchivedCode.map(additionFromSelfArchivedCode => ({
      id: additionFromSelfArchivedCode.id,
      count: additionFromSelfArchivedCode.count,
      name: selfArchivedCodeNames[additionFromSelfArchivedCode.id],
      enabled: enabledFilters.includes(additionFromSelfArchivedCode.id)
    })))
  );

  searchTermsCount$ = this.searchParams$.pipe(
    map(params => Object.keys(params).filter(key => !['q', 'page', 'size', 'sort'].includes(key)).reduce((acc, key) => acc + params[key].length, 0))
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

  public filterLimits = {
    year: 10,
    language: 10,
  };

  breakpointSubscription = this.breakpointObserver.observe(['(max-width: 1200px)', '(max-width: 990px)']).subscribe(result => {
    this.displayedColumns = ['icon', 'publicationName', 'authorsText', 'publisherName', 'publicationYear'];

    if (result.breakpoints['(max-width: 990px)']) {
      this.displayedColumns = ['publicationName', 'publicationYear'];
    } else if (result.breakpoints['(max-width: 1200px)']) {
      this.displayedColumns = ['icon', 'publicationName', 'authorsText', 'publicationYear'];
    }
  });

  narrowBreakpoint$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 990px)').pipe(map(result => result.matches));

  searchParamsSubscription = this.searchParams$.subscribe(searchParams => {
    this.publications2Service.updateSearchTerms(searchParams);

    this.keywords = searchParams.q?.[0] ?? "";
    this.page = parseInt(searchParams.page?.[0] ?? "1");
    this.size = parseInt(searchParams.size?.[0] ?? "10");
    this.sort = searchParams.sort?.[0] ?? "";
  });

  total$ = this.publications2Service.getTotal();

  ngOnDestroy() {
    this.searchParamsSubscription.unsubscribe();
    this.breakpointSubscription.unsubscribe();
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

      queryParams.page = ["1"];

      this.router.navigate([], {
        relativeTo: this.route,
        // skipLocationChange: true,
        queryParams: concatFields(queryParams)
      });
    });
  }

  setParam(key: string, value: string) {
    this.searchParams$.pipe(take(1)).subscribe(filterParams => {
      const queryParams = { ...filterParams };

      queryParams[key] = [value];

      queryParams.page = ["1"];

      this.router.navigate([], {
        relativeTo: this.route,
        // skipLocationChange: true,
        queryParams: concatFields(queryParams)
      });
    });
  }

  clearParam(key: string) {
    this.searchParams$.pipe(take(1)).subscribe(filterParams => {
      const queryParams = { ...filterParams };

      delete queryParams[key];

      queryParams.page = ["1"];

      this.router.navigate([], {
        relativeTo: this.route,
        // skipLocationChange: true,
        queryParams: concatFields(queryParams)
      });
    });
  }

  toggleSort(field: string) {
    this.searchParams$.pipe(take(1)).subscribe(params => {
      const existingSort = params.sort?.pop() ?? "";

      if (existingSort === field + "Desc") {
        this.clearParam("sort");
      } else if (existingSort === field) {
        this.setParam("sort", field + "Desc");
      } else {
        this.setParam("sort", field);
      }
    });
  }

  setKeywords(keywords: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      // skipLocationChange: true,

      queryParams: {
        q: keywords,
        page: "1"
      },

      queryParamsHandling: 'merge'
    });
  }

  nextPage() {
    this.searchParams$.pipe(take(1)).subscribe(searchParams => {
      const queryParams = { ...searchParams };

      const page = parseInt(queryParams.page?.[0] ?? "1");
      queryParams.page = [`${page + 1}`];

      this.router.navigate([], {
        relativeTo: this.route,
        // skipLocationChange: true,
        queryParams: queryParams
      });
    });
  }

  previousPage() {
    this.searchParams$.pipe(take(1)).subscribe(searchParams => {
      const queryParams = { ...searchParams };

      const page = parseInt(queryParams.page?.[0] ?? "1");
      queryParams.page = [`${page - 1}`];

      this.router.navigate([], {
        relativeTo: this.route,
        // skipLocationChange: true,
        queryParams: queryParams
      });
    });
  }

  setPageSize(size: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      // skipLocationChange: true,
      queryParams: { size }, queryParamsHandling: 'merge'
    });
  }

  clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  clearKeywordField() {
    this.keywords = "";
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
    if (key === 'q') {
      result[key] = [obj[key] as string];
    } else {
      const value = obj[key];
      result[key] = splitParams(value);
    }
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
