import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { faFileAlt, faUsers, faEuroSign, faSpinner, faAlignLeft, faCalculator, faCity } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class TabChangeService {
  tabData = [
    { data: 'publications', labelFi: 'Julkaisut', labelEn: 'Publications', link: 'publications', icon: faFileAlt},
    { data: 'persons',  labelFi: 'Tutkijat', labelEn: 'People', link: 'persons', icon: faUsers },
    { data: 'fundings', labelFi: 'Hankkeet', labelEn: 'Fundings', link: 'fundings', icon: faEuroSign },
    { data: '', labelFi: 'Aineistot', labelEn: 'Materials', link: '1', icon: faAlignLeft },
    { data: '', labelFi: 'Infrastruktuurit', labelEn: 'Infrastructures', link: '2', icon: faCalculator },
    { data: '', labelFi: 'Muut aktiviteetit', labelEn: 'Research activities', link: '3', icon: faSpinner },
    { data: 'organizations', labelFi: 'Organisaatiot', labelEn: 'Organizations', link: 'organizations', icon: faCity }
  ];

  private tabSource = new BehaviorSubject({data: '', labelFi: '', labelEn: '', link: '', icon: ''});
  currentTab = this.tabSource.asObservable();
  tab: string;
  tabQueryParams: any = {};
  locale: string;

  constructor( @Inject( LOCALE_ID ) protected localeId: string ) {

   }

  changeTab(tab: {data: string; labelFi: string, labelEn: string, link: string, icon: any}) {
    this.tab = tab.link;
    this.tabSource.next(tab);
  }
}
