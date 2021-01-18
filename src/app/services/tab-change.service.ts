import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { faFileAlt, faUsers, faBriefcase, faSpinner, faAlignLeft, faCalculator, faUniversity } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'publications', label: $localize`:@@publications:Julkaisut`, link: 'publications', icon: faFileAlt, singular: $localize`:@@publication:julkaisu`,
      tooltip: $localize`:@@publicationsTooltip:Suomalaisten yliopistojen, ammattikorkeakoulujen, tutkimuslaitosten ja yliopistosairaaloiden julkaisut.`},
    { data: '',  label: $localize`:@@authors:Tutkijat`, link: undefined, icon: faUsers, singular: $localize`:@@author:tutkija`,
      tooltip: $localize`:@@authorsTooltip:Suomessa toimivia tutkijoita.` },
    { data: 'fundings', label: $localize`:@@fundings:Hankkeet`, link: 'fundings', icon: faBriefcase, singular: $localize`:@@funding:hanke`,
      tooltip: $localize`:@@fundingsTooltip:Suomalaisten julkisten ja yksityisten tutkimusrahoittajien rahoituspäätöksiä siitä alkaen, kun rahoittaja on liittynyt palveluun. EU:n suomalaisille organisaatioille myöntämät rahoituspäätökset Horizon 2020 puiteohjelmasta alkaen.` },
    { data: 'materials', label: $localize`:@@materials:Aineistot`, link: 'materials', icon: faAlignLeft, singular: $localize`:@@material:aineisto`,
      tooltip: $localize`:@@materialsTooltip:Suomessa tuotettujen tutkimusaineistojen kuvailutietoja.` },
    { data: 'infrastructures', label: $localize`:@@infrastructures:Infrastruktuurit`, link: 'infrastructures', icon: faCalculator, singular: $localize`:@@infrastructure:infrastruktuuri`,
      tooltip: $localize`:@@infrastructuresTooltip:Suomessa ylläpidettäviä tutkimusinfrastruktuureja. Infrastruktuurit ovat keskitetysti, hajautetusti tai virtuaalisesti saatavilla olevia välineitä, laitteistoja, tietoverkkoja, tietokantoja, aineistoja ja palveluita, jotka mahdollistavat tutkimuksen tekemistä.`  },
    { data: '', label: $localize`:@@otherResearchActivities:Muut tutkimusaktiviteetit`, link: undefined, icon: faSpinner, singular: $localize`:@@otherResearchActivity:muu tutkimustoiminta`,
      tooltip: $localize`:@@otherResearcActivitiesTooltip:Tutkijoiden tutkimustyöhön liittyvät asiantuntijatehtävät, pätevyydet, tunnustukset ja muu toiminta.`  },
    { data: 'organizations', label: $localize`:@@organizations:Organisaatiot`, link: 'organizations', icon: faUniversity, singular: $localize`:@@organizationSingular:organisaatio`,
      tooltip: $localize`:@@organizationsTooltip:Tiedejatutkimus.fi -palveluun tietoja toimittavat tutkimusorganisaatiot ja &#8209;rahoittajat.`  }
  ];

  private tabSource = new BehaviorSubject({data: '', label: '', link: '', icon: '', singular: ''});
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

  constructor( @Inject( LOCALE_ID ) protected localeId: string ) { }

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

  changeTab(tab: {data: string; label: string, link: string, icon: any, singular: string}) {
    this.tab = tab.link;
    this.tabSource.next(tab);
  }

  // Show / hide skip to input - skip-link
  toggleSkipToInput(state) {
    this.skipToInput.next(state);
  }

  resetQueryParams() {
    Object.values(this.tabData).forEach(tab => this.tabQueryParams[tab.link] = {});
  }
}
