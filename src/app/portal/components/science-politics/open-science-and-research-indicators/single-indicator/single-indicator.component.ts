import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription, combineLatest } from 'rxjs';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { WINDOW } from '@shared/services/window.service';

@Component({
  selector: 'app-single-indicator',
  templateUrl: './single-indicator.component.html',
  styleUrls: ['./single-indicator.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SingleIndicatorComponent implements OnInit {

  @ViewChild('iframe') iframe: ElementRef;
  resizeSub: Subscription;
  currentLocale = '';
  currentPageCaption = '';
  routeSub: Subscription;
  pageTextContent: any;
  visualizationUrl: any;
  siblingPageLinks = [];
  currentPageId = '';
  colWidth = 0;
  showHelp = false;
  mobile = this.window.innerWidth < 992;
  height = this.window.innerHeight;
  width = this.window.innerWidth;
  item = {sourceFi: 'Avoin tiede ja tutkimus', sourceSv: 'Open science and research', sourceEn: 'Öppen vetenskap och forskning'};

  portalAddress = '/science-innovation-policy/open-science-and-research-indicators/';

  constructor(private route: ActivatedRoute, private appSettingsService: AppSettingsService, private resizeService: ResizeService, @Inject(WINDOW) private window: Window) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.processPageData();
    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
  }

  ngAfterViewInit() {
    this.colWidth = this.iframe.nativeElement.offsetWidth;
  }

  processPageData() {
    if (this.route.snapshot.params){
      this.pageTextContent = this.route.snapshot.data.pages.find(
        (el) => el.id === this.route.snapshot.params.id
      );
      this.currentPageCaption = this.pageTextContent['title' + this.currentLocale];
      this.currentPageId = this.pageTextContent.id.substring(19, this.pageTextContent.id.length);
      this.siblingPageLinks = this.route.snapshot.data.pages.filter(
        (el) => el.id.startsWith('indicators_content')
      );
      this.visualizationUrl = this.route.snapshot.data.pages.find(
        (el) => el.id === ('indicators_link_' + this.currentPageId)
      );
      // Crop out html paragraph tags from start and end of the link from cms.
      this.visualizationUrl ? this.visualizationUrl =
        this.visualizationUrl['content' + this.currentLocale].substring(3, this.visualizationUrl['content' + this.currentLocale].length - 4) : '';

      this.siblingPageLinks.map(link => (
        link.image = 'assets/img/indicators/indicators_thumbnail_' + link.id.substring(19, link.id.length) + '.png'
      ));

      this.siblingPageLinks.map(link => (
        link.selected = link.id.substring(19, link.id.length) === this.currentPageId
      ));
    }
    else {
      // REDIRECT HERE
    }
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (this.width >= 992) {
      this.mobile = false;
    } else {
      this.mobile = true;
    }
    this.colWidth = this.iframe.nativeElement.offsetWidth - 15;
  }

  onClickedOutsideHelp(event) {
    this.showHelp = false;
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }
}


