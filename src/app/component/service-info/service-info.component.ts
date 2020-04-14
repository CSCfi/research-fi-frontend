import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { contents } from '../../../assets/static-data/service-info.json';

@Component({
  selector: 'app-service-info',
  templateUrl: './service-info.component.html',
  styleUrls: ['./service-info.component.scss']
})
export class ServiceInfoComponent implements OnInit {
  faInfo = faInfo;

  contents = contents;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string) {}

  ngOnInit(): void {
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tutkimus- ja innovaatiojärjestelmä - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        // Todo: Translate
        this.setTitle('Tutkimus- ja innovaatiojärjestelmä - Research.fi');
        break;
      }
    }
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

}
