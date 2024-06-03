import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  faFileAlt,
  faUsers,
  faBriefcase,
  faAlignLeft,
  faCalculator,
  faUniversity,
  faBullhorn,
} from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root',
})
export class TabChangeService {
  tabData = [
    {
      data: 'publications',
      label: $localize`:@@publications:Julkaisut`,
      link: 'publications',
      icon: faFileAlt,
      singular: $localize`:@@publication:julkaisu`,
      tooltip: $localize`:@@publicationsTooltip:Suomalaisten yliopistojen, ammattikorkeakoulujen, tutkimuslaitosten ja yliopistosairaaloiden julkaisut.`,
    },
    {
      data: 'persons',
      label: $localize`:@@authors:Tutkijat`,
      link: 'persons',
      icon: faUsers,
      singular: $localize`:@@author:tutkija`,
      tooltip: $localize`:@@authorsTooltip:Suomalaiseen tutkimukseen liittyviä tutkijoita ja tutkimuksen asiantuntijoita.`,
      beta: true,
    },
    {
      data: 'fundings',
      label: $localize`:@@navigation.fundings:Myönnetty rahoitus`,
      link: 'fundings',
      icon: faBriefcase,
      singular: $localize`:@@funding:myönnetty rahoitus`,
      tooltip: $localize`:@@fundingsTooltip:Suomalaisten julkisten ja yksityisten tutkimusrahoittajien rahoituspäätöksiä siitä alkaen, kun rahoittaja on liittynyt palveluun. EU:n suomalaisille organisaatioille myöntämät rahoituspäätökset Horizon 2020 puiteohjelmasta alkaen.`,
    },
    {
      data: 'datasets',
      label: $localize`:@@datasets:Aineistot`,
      link: 'datasets',
      icon: faAlignLeft,
      singular: $localize`:@@dataset:aineisto`,
      tooltip: $localize`:@@datasetsTooltip:Suomessa tuotettujen tutkimusaineistojen kuvailutietoja.`,
    },
    {
      data: 'fundingCalls',
      label: $localize`:@@fundingCalls:Rahoitushaut`,
      link: 'funding-calls',
      icon: faBullhorn,
      singular: 'Rahoitushaku',
      tooltip: $localize`:@@fundingCallsTooltip:Suomalaisten tiedettä, taidetta ja kulttuuria rahoittavien säätiöiden ja rahastojen käynnissä olevia ja avautuvia rahoitushakuja.`,
      initialQueryParams: { status: 'open' },
    },
    {
      data: 'infrastructures',
      label: $localize`:@@infrastructures:Infrastruktuurit`,
      link: 'infrastructures',
      icon: faCalculator,
      singular: $localize`:@@infrastructure:infrastruktuuri`,
      tooltip: $localize`:@@infrastructuresTooltip:Suomessa ylläpidettäviä tutkimusinfrastruktuureja. Infrastruktuurit ovat keskitetysti, hajautetusti tai virtuaalisesti saatavilla olevia välineitä, laitteistoja, tietoverkkoja, tietokantoja, aineistoja ja palveluita, jotka mahdollistavat tutkimuksen tekemistä.`,
    },
    {
      data: 'organizations',
      label: $localize`:@@organizations:Organisaatiot`,
      link: 'organizations',
      icon: faUniversity,
      singular: $localize`:@@organizationSingular:organisaatio`,
      tooltip: $localize`:@@organizationsTooltip:Tiedejatutkimus.fi -palveluun tietoja toimittavat tutkimusorganisaatiot ja \u2011rahoittajat.`,
    },
  ];

  fundingCall = {
    data: 'funding-calls',
    label: $localize`:@@fundingCalls:Rahoitushaut`,
    link: 'funding-calls',
    icon: faBullhorn,
    singular: 'rahoitushaku',
    tooltip: '',
  };

  // List for tab / page data names. Used ie. in portal.module to check route
  resultPageList = [
    ...this.tabData.map((tab) => tab.data),
    this.fundingCall.data,
  ].filter((item) => item.length);

  private tabSource = new BehaviorSubject({
    data: '',
    label: '',
    link: '',
    icon: '',
    singular: '',
  });
  private focusSource = new BehaviorSubject(false);
  private focusTarget = new BehaviorSubject('');
  private skipToInput = new BehaviorSubject(true);
  private newPageSource = new BehaviorSubject(true);
  currentTab = this.tabSource.asObservable();
  currentFocus = this.focusSource.asObservable();
  currentFocusTarget = this.focusTarget.asObservable();
  currentSkipToInput = this.skipToInput.asObservable();
  newPage = this.newPageSource.asObservable();
  tab: string;
  tabQueryParams: any = {};
  locale: string;
  focus: string;

  initialTabQueryParams = { 'funding-calls': { status: 'open' } };

  constructor(@Inject(LOCALE_ID) protected localeId: string) {}

  // If focus is true, focus result header.
  changeFocus(focus) {
    this.focusSource.next(focus);
  }

  targetFocus(target) {
    this.focusTarget.next(target);
  }

  triggerNewPage() {
    this.newPageSource.next(true);
  }

  changeTab(tab: {
    data: string;
    label: string;
    link: string;
    icon: any;
    singular: string;
  }) {
    this.tab = tab.link;
    this.tabSource.next(tab);
  }

  // Show / hide skip to input - skip-link
  toggleSkipToInput(state) {
    this.skipToInput.next(state);
  }

  // Initialize tab based query params with initial values if available
  resetQueryParams() {
    Object.values(this.tabData).forEach((tab) => {
      return (this.tabQueryParams[tab.link] = this.tabData.find(
        (tabItem) => tabItem.link === tab.link
      ).initialQueryParams);
    });
  }
}
