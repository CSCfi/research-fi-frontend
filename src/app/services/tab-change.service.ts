import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { faFileAlt, faUsers, faBriefcase, faSpinner, faAlignLeft, faCalculator, faUniversity } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'publications', labelFi: 'Julkaisut', labelEn: 'Publications', link: 'publications', icon: faFileAlt},
    { data: '',  labelFi: 'Tutkijat', labelEn: 'People', link: '2', icon: faUsers },
    { data: 'fundings', labelFi: 'Hankkeet', labelEn: 'Fundings', link: 'fundings', icon: faBriefcase },
    { data: '', labelFi: 'Aineistot', labelEn: 'Materials', link: '1', icon: faAlignLeft },
    { data: 'infrastructures', labelFi: 'Infrastruktuurit', labelEn: 'Infrastructures', link: 'infrastructures', icon: faCalculator },
    { data: '', labelFi: 'Muut aktiviteetit', labelEn: 'Research activities', link: '3', icon: faSpinner },
    { data: 'organizations', labelFi: 'Organisaatiot', labelEn: 'Organizations', link: 'organizations', icon: faUniversity }
  ];

  private tabSource = new BehaviorSubject({data: '', labelFi: '', labelEn: '', link: '', icon: ''});
  private focusSource = new BehaviorSubject(false);
  private focusTarget = new BehaviorSubject('');
  currentTab = this.tabSource.asObservable();
  currentFocus = this.focusSource.asObservable();
  currentFocusTarget = this.focusTarget.asObservable();
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

  resetQueryParams() {
    Object.values(this.tabData).forEach(tab => this.tabQueryParams[tab.link] = {});
  }
}
