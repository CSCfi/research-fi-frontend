import { Component, OnInit, Inject, LOCALE_ID, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { contents } from '../../../assets/static-data/service-info.json';
import { TabChangeService } from 'src/app/services/tab-change.service';

@Component({
  selector: 'app-service-info',
  templateUrl: './service-info.component.html',
  styleUrls: ['./service-info.component.scss']
})
export class ServiceInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  faInfo = faInfo;

  contents = contents;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: any;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService) {}

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
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
  }


  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
  }

}
