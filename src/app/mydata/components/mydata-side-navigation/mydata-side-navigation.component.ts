import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { AuthenticatedResult, OidcSecurityService } from 'angular-auth-oidc-client';
import { DraftService } from '@mydata/services/draft.service';
import { UtilityService } from '@shared/services/utility.service';
import { isPlatformBrowser, NgForOf, NgIf, PlatformLocation } from '@angular/common';
import { CMSContentService } from '@shared/services/cms-content.service';
import { Observable, Subscription } from 'rxjs';
import { ProfileService } from '@mydata/services/profile.service';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-mydata-side-navigation',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLinkActive
  ],
  templateUrl: './mydata-side-navigation.component.html',
  styleUrl: './mydata-side-navigation.component.scss'
})
export class MydataSideNavigationComponent implements OnInit, OnDestroy {
  private lang: string;
  private widthFlag: boolean;
  private isAuthenticated: Observable<AuthenticatedResult>;
  private routeSub: Subscription;
  private locale: string;
  private draftProfile: string;
  private appSettings: any;
  public navItems: any;
  private currentRoute: any;

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    public profileService: ProfileService,
    private platform: PlatformLocation,
    private utilityService: UtilityService,
    private cmsContentService: CMSContentService,
    private route: ActivatedRoute,
    public appSettingsService: AppSettingsService,
    private oidcSecurityService: OidcSecurityService,
    private draftService: DraftService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.locale = this.appSettingsService.capitalizedLocale;
    this.draftProfile = this.profileService.getDraftProfile();
    this.appSettings = this.appSettingsService.myDataSettings;
    this.navItems = this.appSettings.navItems;
    const currentUrl = this.router.url;
    console.log('currentUrl', currentUrl);

    this.navItems.map(item => {
      if (item.link === currentUrl){
        item.active = true;
      }
      console.log('item', item);
      return item;
    });

    console.log('navItems', this.navItems);

    this.routeSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log(event);
        this.currentRoute = event.urlAfterRedirects.split('#')[0];
        console.log('currentRoute', this.currentRoute);
      }
    });
  }

  /*
  * Inform user if unsaved changes in profile view
  */
  if (draftProfile) {
    this.notificationService.notify({
      notificationText: $localize`:@@youHaveUnpublishedChangesSnackbar:Sinulla on julkaisemattomia muutoksia profiilinäkymässä.`,
      buttons: [
        {
          label: $localize`:@@youHaveUnpublishedChangesSnackbarButton:Tarkasta muutokset.`,
          action: () => this.router.navigate(['mydata/profile']),
        },
      ],
    });
  }

  navigateTo(path: string){
    console.log('navigateTo', path);
    this.router.navigate([path]);
  }

  ngOnDestroy() {
    console.log('on destroy');
  }
}

