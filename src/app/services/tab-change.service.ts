import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { faFileAlt, faUsers, faBriefcase, faSpinner, faAlignLeft, faCalculator, faUniversity } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'publications', labelFi: 'Julkaisut', labelEn: 'Publications', link: 'publications', icon: faFileAlt,
      tooltipFi: 'Suomalaisten yliopistojen, ammattikorkeakoulujen, tutkimuslaitosten ja yliopistosairaaloiden julkaisut.'},
    { data: '',  labelFi: 'Tutkijat', labelEn: 'People', link: '2', icon: faUsers,
      tooltipFi: 'Suomessa toimivia tutkijoita.' },
    { data: 'fundings', labelFi: 'Hankkeet', labelEn: 'Fundings', link: 'fundings', icon: faBriefcase,
      tooltipFi: 'Suomalaisten julkisten ja yksityisten tutkimusrahoittajien rahoituspäätöksiä siitä alkaen, kun rahoittaja on liittynyt palveluun. EU:n suomalaisille organisaatioille myöntämät rahoituspäätökset Horizon 2020 puiteohjelmasta alkaen.' },
    { data: '', labelFi: 'Aineistot', labelEn: 'Materials', link: '1', icon: faAlignLeft,
      tooltipFi: 'Suomessa tuotettujen tutkimusaineistojen kuvailutietoja.'  },
    { data: 'infrastructures', labelFi: 'Infrastruktuurit', labelEn: 'Infrastructures', link: 'infrastructures', icon: faCalculator,
      tooltipFi: 'Suomessa ylläpidettäviä tutkimusinfrastruktuureja. Infrastruktuurit ovat keskitetysti, hajautetusti tai virtuaalisesti saatavilla olevia välineitä, laitteistoja, tietoverkkoja, tietokantoja, aineistoja ja palveluita, jotka mahdollistavat tutkimuksen tekemistä.'  },
    { data: '', labelFi: 'Muut aktiviteetit', labelEn: 'Research activities', link: '3', icon: faSpinner,
      tooltipFi: 'Tutkijoiden tutkimustyöhön liittyvät asiantuntijatehtävät, pätevyydet, tunnustukset ja muu toiminta.'  },
    { data: 'organizations', labelFi: 'Organisaatiot', labelEn: 'Organizations', link: 'organizations', icon: faUniversity,
      tooltipFi: 'Tiedejatutkimus.fi -palveluun tietoja toimittavat tutkimusorganisaatiot ja -rahoittajat.'  }
  ];

  private tabSource = new BehaviorSubject({data: '', labelFi: '', labelEn: '', link: '', icon: ''});
  private focusSource = new BehaviorSubject(false);
  private focusTarget = new BehaviorSubject('');
  private skipToInput = new BehaviorSubject(true);
  currentTab = this.tabSource.asObservable();
  currentFocus = this.focusSource.asObservable();
  currentFocusTarget = this.focusTarget.asObservable();
  currentSkipToInput = this.skipToInput.asObservable();
  tab: string;
  tabQueryParams: any = {};
  locale: string;

  constructor( @Inject( LOCALE_ID ) protected localeId: string ) { }

  // If focus is true, focus result header.
  changeFocus(focus) {
    this.focusSource.next(focus);
  }

  targetFocus(target) {
    this.focusTarget.next(target);
  }

  changeTab(tab: {data: string; labelFi: string, labelEn: string, link: string, icon: any}) {
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
