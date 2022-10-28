import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  pageTextContent: any = '';
  visualizationUrl: any;
  dataSource: any;
  siblingPageLinks = [];
  currentPageId = '';
  colWidth = 0;
  showHelp = false;
  mobile = this.window.innerWidth < 992;
  height = this.window.innerHeight;
  width = this.window.innerWidth;
  item = {};

  currentPageUrl = '/science-innovation-policy/open-science-and-research-indicators/';

  constructor(private route: ActivatedRoute, private router: Router, private appSettingsService: AppSettingsService, private resizeService: ResizeService, @Inject(WINDOW) private window: Window, private cdRef : ChangeDetectorRef) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    if (this.areIndicatorsActive()){
      this.processPageData();
    } else {
      this.router.navigate([this.currentPageUrl]);
    }
    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
  }

  ngAfterViewInit() {
    this.colWidth = this.iframe.nativeElement.offsetWidth;
    this.cdRef.detectChanges();
  }

  areIndicatorsActive() {
    let isActive = this.route.snapshot.data.pages.some(
      (el) => el.id.startsWith('indicators_active')
    );
    return isActive;
  }

  processPageData() {
    if (this.route.snapshot.params) {
      this.pageTextContent = this.route.snapshot.data.pages.find(
        (el) => el.id === this.route.snapshot.params.id
      );
      if (this.pageTextContent) {
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

        this.dataSource = this.route.snapshot.data.pages.find(
          (el) => el.id === ('indicators_datasource_' + this.currentPageId)
        );
        // Crop out html paragraph tags from start and end of the link from cms.
        this.dataSource ? this.dataSource =
          this.dataSource['content' + this.currentLocale].substring(3, this.dataSource['content' + this.currentLocale].length - 4) : '';

        this.siblingPageLinks.map(link => (
          link.selected = link.id.substring(19, link.id.length) === this.currentPageId
        ));
      }
      else {
        this.router.navigate([this.currentPageUrl]);
      }
    }
    else {
      this.router.navigate([this.currentPageUrl]);
    }
  }

  onResize(dims) {
    this.colWidth = this.iframe.nativeElement.offsetWidth - 15;
    this.cdRef.detectChanges();
  }

  onClickedOutsideHelp(event) {
    this.showHelp = false;
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }
}


