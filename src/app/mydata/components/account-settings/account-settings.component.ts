import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ProfileService } from '@mydata/services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CommonStrings } from '@mydata/constants/strings';
import { cloneDeep } from 'lodash-es';
import { Constants } from '@mydata/constants';
import { getName } from '@mydata/utils';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { PrimaryActionButtonComponent } from '../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SecondaryButtonComponent } from '../../../shared/components/buttons/secondary-button/secondary-button.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { BannerDividerComponent } from '@shared/components/banner-divider/banner-divider.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import {
  MydataSideNavigationComponent
} from '@mydata/components/mydata-side-navigation/mydata-side-navigation.component';
import { StickyFooterComponent } from '@mydata/components/sticky-footer/sticky-footer.component';
import {
  AutomaticPublishingSettingsComponent
} from '@mydata/components/automatic-publishing-settings/automatic-publishing-settings.component';
import { DraftService } from '@mydata/services/draft.service';
import {
  BannerContent,
  GeneralInfoBannerComponent
} from '@shared/components/general-info-banner/general-info-banner.component';

@Component({
    selector: 'app-account-settings',
    templateUrl: './account-settings.component.html',
    styleUrls: ['./account-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        SecondaryButtonComponent,
        MatProgressSpinner,
        PrimaryActionButtonComponent,
        DialogComponent,
        AsyncPipe,
        BannerDividerComponent,
        SvgSpritesComponent,
        MydataSideNavigationComponent,
        StickyFooterComponent,
        AutomaticPublishingSettingsComponent,
        GeneralInfoBannerComponent
    ]
})
export class AccountSettingsComponent implements OnInit {
  orcid: any;
  orcidData: any;
  profileData: any;


  orcidFetchStateChangeInProgress: boolean;
  loadingHideProfile: boolean;

  accountSettingsTitle = $localize`:@@accountSettings:Tiliasetukset`;

  textContent = $localize`:@@automaticPublishingShortDescription:Voit määrittää, että sinuun liittyvät uudet tiedot julkaistaan automaattisesti profiilissasi.`;

  automaticPublishingBannerContent: BannerContent = {
    bannerId: 'automatic_publishing_banner',
    bannerType: 'profile-tool-banner',
    iconType: 'info',
    bannerTheme: 'yellow',
    heading: $localize`:@@automaticPublishingIsPossible:Tietojen automaattinen julkaiseminen on nyt mahdollista`,
    textContent: $localize`:@@automaticPublishingShortDescription:Voit määrittää, että sinuun liittyvät uudet tiedot julkaistaan automaattisesti profiilissasi.`,
    link1Target: 'internal',
    link1Text: $localize`:@@readMoreAndTakeIntoUse:Lue lisää ja ota käyttöön`,
    link1Url: '/mydata/profile/account-settings',
    rememberDismissed: true
  }

  // Dialog variables
  showDialog: boolean;
  dialogTitle: any;
  dialogTemplate: any;
  dialogExtraContentTemplate: any;
  currentDialogActions: any[];
  disableDialogClose: boolean;
  showDataToPublish = $localize`:@@showDataToPublish:Näytä julkaistavat tiedot`;
  basicDialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];


  // Delete profile variables
  deleteProfileInProgress: boolean;
  connProblemDeleteProfile: boolean;
  connectionProblemDeleteProfile = $localize`:@@connectionProblemDeleteProfile:Yhteysongelma. Profiilin poisto ei onnistu. Kokeile hetken kuluttua uudestaan....`;
  deleteProfileWait = $localize`:@@deleteProfileWait:Profiilia poistetaan, odota hetki...`;
  deleteProfileTitle = $localize`:@@removeProfileCaption:Profiilin poistaminen`;
  deleteProfileModalTitle = $localize`:@@deleteProfileModalTitle:Haluatko poistaa julkisen profiilisi?`;
  generalInfoDeleteProfile = $localize`:@@accountSettingsProfileRemovalInfo:Profiilin poistaminen tarkoittaa sitä, että julkinen profiilisi poistetaan ja ORCIDista tuomasi tiedot poistetaan. Myös kirjautumisen yhteydessä profiilityökaluun tallennetut tiedot poistetaan.`;
  deleteProfileModalText = $localize`:@@accountSettingsProfileRemovalModalText:Profiilin poistaminen tarkoittaa sitä, että julkinen profiilisi poistetaan ja ORCIDista tuomasi tiedot poistetaan. Myös kirjautumisen yhteydessä profiilityökaluun tallennetut tiedot poistetaan.`;
  deleteProfileDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@deleteProfile:Poista profiili`,
      primary: true,
      method: 'delete',
    },
  ];

  // Hide profile variables
  hideProfileInProgress: boolean;
  connProblemHideProfile: boolean;
  connectionProblemHideProfile = $localize`:@@connectionProblemHideProfile:Yhteysongelma. Profiilin piilottaminen ei onnistu. Kokeile hetken kuluttua uudestaan....`;
  hideProfileWait = $localize`:@@hideProfileWait:Profiilia piilotetaan, odota hetki...`;

  // HIDE PROFILE
  hideProfileTitle = $localize`:@@hideProfileCaption:Julkisen profiilin piilottaminen`;
  generalInfoHideProfile = $localize`:@@accountSettingsHideAccountInfo:Julkisen profiilin piilottaminen tarkoittaa sitä, että profiilisi piilotetaan Tiedejatutkimus.fi-palvelusta. Voit edelleen kirjautua työkaluun ja julkaista profiilisi uudestaan.`;

  hideProfileModalTitle = $localize`:@@hideProfileModalTitle:Haluatko piilottaa julkisen profiilisi?`;
  hideProfileModalText = $localize`:@@accountSettingsHideAccountModalText:Julkisen profiilin piilottaminen tarkoittaa sitä, että profiilisi piilotetaan Tiedejatutkimus.fi-palvelusta. Voit edelleen kirjautua työkaluun ja julkaista profiilisi uudestaan.`;

  // REPUBLISH PROFILE
  showProfileTitle = $localize`:@@mydata.account.title-for-hide:Julkaise piilotettu profiili`;
  showProfileText = $localize`:@@mydata.account.text-for-hide:Piilottamasi profiili julkaistaan uudestaan niillä tiedoilla, jotka olet aiemmin valinnut julkisiksi Tiedejatutkimus.fi-palveluun.`;

  showProfileModalTitle = $localize`:@@mydata.account.hide-modal.title:Haluatko julkaista piilottamasi profiilin?`;
  showProfileModalText = $localize`:@@mydata.account.hide-modal.text:Piilottamasi profiili julkaistaan uudestaan niillä tiedoilla, jotka olet aiemmin valinnut julkisiksi Tiedejatutkimus.fi-palveluun.`;

  hideProfileDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@hideProfile:Piilota profiili`,
      primary: true,
      method: 'hidePublicProfile',
    },
  ];

  showProfileDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@mydata.account.republish-button.text:Julkaise profiili`,
      primary: true,
      method: 'showPublicProfile',
    },
  ];

  // Automatic publishing modal
  automaticPublishingModalTitleEnable = $localize`:@@automaticPublishingModalTitle: Haluatko ottaa automaattisen julkaisemisen käyttöön?`;
  automaticPublishingModalTitleDisable = $localize`:@@automaticPublishingModalTitle: Haluatko ottaa automaattisen julkaisemisen pois käytöstä?`;
  automaticPublishingDialogActionsEnable = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@enableAutomaticPublishing:Ota automaattinen julkaiseminen käyttöön`,
      primary: true,
      method: 'enableAutomaticPublishing',
    },
  ];

  automaticPublishingDialogActionsDisable = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@disableAutomaticPublishing:Ota automaattinen julkaiseminen pois käytöstä`,
      primary: true,
      method: 'disableAutomaticPublishing',
    },
  ];

  enableAutomaticPublishing = $localize`:@@enableAutomaticPublishing:Ota automaattinen julkaiseminen käyttöön`;
  disableAutomaticPublishing = $localize`:@@disableAutomaticPublishing:Ota automaattinen julkaiseminen pois käytöstä`;

  automaticPublishingTitle = $localize`:@@automaticPublishingTitle:Tietojen automaattinen julkaiseminen`;

  automaticPublishingAccountSettingsInfoText1 = $localize`:@@automaticPublishingAccountSettingsInfoText1:Kun ominaisuus on valittu, tietolähteissä tehdyt muutokset näkyvät automaattisesti profiilissasi.`;
  automaticPublsihingInfoTextBullet1 = $localize`:@@automaticPublsihingInfoTextBullet1:Tutkimustoiminnan kuvaus ja osa yhteystiedoista eivät kuulu automaattisen julkaisemisen piiriin.`;
  automaticPublsihingInfoTextBullet2 = $localize`:@@automaticPublsihingInfoTextBullet2:Katso tarkempi määrittely`;
  automaticPublsihingInfoTextBullet2Link = 'https://wiki.eduuni.fi/x/cbJqJ';


  // Orcid variables
  isOrcidFetchInUse = false;
  automaticOrcidFetchCaption = $localize`:@@showDataToPublish:ORCID-tietojen automaattinen päivittyminen`;
  generalInfoOrcid = $localize`:@@accountSettingsOrcidInfo:Tämä asetus lisää jatkossa ORCID-palveluun lisäämäsi tai kotiorganisaatiossasi ORCID-tunnisteeseesi liitetyt uudet tiedot automaattisesti julkiseen profiiliisi Tiedejatutkimus.fi-palvelussa.`;
  orcidFetchModalTextEnable = $localize`:@@accountSettingsOrcidModalTextEnable:ORCID-palveluun lisäämäsi tai kotiorganisaatiossasi ORCID-tunnisteeseesi liitetyt uudet tiedot päivittyvät jatkossa automaattisesti julkiseen profiiliisi Tiedejatutkimus.fi-palvelussa.`;
  orcidFetchModalTextDisable = $localize`:@@accountSettingsOrcidModalTextDisable:ORCID-palveluun lisäämäsi tai kotiorganisaatiossasi ORCID-tunnisteeseesi liitetyt uudet tiedot eivät enää päivity automaattisesti julkiseen profiiliisi Tiedejatutkimus.fi-palvelussa.`;
  disableOrcidFetchDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@disableOrcidDataFetch:Poista käytöstä`,
      primary: true,
      method: 'changeOrcidFetchState',
    },
  ];

  enableOrcidFetchDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: $localize`:@@enableOrcidDataFetch:Ota käyttöön`,
      primary: true,
      method: 'changeOrcidFetchState',
    },
  ];

  profileVisibility$ = this.profileService.getProfileVisibilityObservable();
  automaticPublishingState = false;

  constructor(public profileService: ProfileService, private draftService: DraftService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog, public oidcSecurityService: OidcSecurityService,  private snackbarService: SnackbarService) {
    this.profileService.fetchProfileVisibilityAndSettings();
  }

  ngOnInit(): void {
    // Get data from resolver
    const orcidProfile = this.route.snapshot.data.orcidProfile;
    this.profileData = this.route.snapshot.data.myDataProfile;

    this.orcidData = orcidProfile;
    this.orcid = orcidProfile.orcid;

    if (this.profileService.automaticPublishingInitialState$.getValue()) {
      this.automaticPublishingState = this.profileService.automaticPublishingInitialState$.getValue();
    }
  }

  openDialog(props: { template: TemplateRef<any>; disableDialogClose: boolean; title: string; actions: ({ method: string; label: string; primary: boolean } | { method: string; label: string; primary: boolean })[] }){
    this.dialogTitle = props.title;
    this.showDialog = true;
    this.dialogTemplate = props.template;
    //this.dialogExtraContentTemplate = props.extraContentTemplate;
    this.currentDialogActions = props.actions;
    this.disableDialogClose = props.disableDialogClose;
  }

  doDialogAction(action: string) {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;

    switch (action) {
      case 'delete': {
        this.deleteProfile();
        break;
      }
      case 'showPublicProfile': {
        this.showPublicProfile();
        break;
      }
      case 'hidePublicProfile': {
        this.hidePublicProfile();
        break;
      }
      case 'changeOrcidFetchState': {
        this.enableOrDisableOrcidFetching();
        break;
      }
      case 'enableAutomaticPublishing': {
        this.patchAutomaticPublishingActiveState(true);
        break;
      }
      case 'disableAutomaticPublishing': {
        this.patchAutomaticPublishingActiveState(false);
        break;
      }
    }
  }

  closeDialog() {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
    this.deleteProfileInProgress = false;
    this.hideProfileInProgress = false;
    this.disableDialogClose = false;
  }

  enableOrDisableOrcidFetching() {
    this.orcidFetchStateChangeInProgress = true;
    if (this.isOrcidFetchInUse) {
      // TODO: method call and error handling here when back end implementation ready
    }
    else {
      // TODO: method call and error handling here when back end implementation ready
    }
  }

  async showPublicProfile() {
    await this.profileService.showProfile();

    try {
      this.hideProfileInProgress = true;
      await this.profileService.showProfile();

      this.hideProfileInProgress = false;
      this.snackbarService.show(
      $localize`:@@profilePublishedToast:Profiili julkaistu. Tiedot näkyvät muutaman minuutin kuluttua tiedejatutkimus.fi -palvelussa.`,
      'success'
    );
    } catch (error) {
      console.error(error);
    }
  }

  patchAutomaticPublishingActiveState(state: any){
    this.draftService.patchAutomaticPublishingPromise(state).then(
      (value) => {
        this.dialog.closeAll();
        if (state === true) {
          this.automaticPublishingState = true;
          this.snackbarService.show(
            $localize`:@@automaticPublishingEnabledToast:Automaattinen julkaiseminen on otettu käyttöön ja muutokset on tallennettu tiliasetuksiisi.`,
            'success'
          );
        }
        else {
          this.automaticPublishingState = false;
          this.snackbarService.show(
            $localize`:@@automaticPublishingDisabledToast:Automaattinen julkaiseminen on otettu pois käytöstä ja muutokset on tallennettu tiliasetuksiisi.`,
            'success'
          );
        }
      },
      (reason) => {
        //TODO: implement error handling
      },);
  }

  hidePublicProfile() {
    this.hideProfileInProgress = true;
    this.connProblemHideProfile = false;
    this.profileService
      .hideProfile()
      .then(
        (value) => {
          this.hideProfileInProgress = false;
            this.dialog.closeAll();
            this.snackbarService.show(
              $localize`:@@profileHiddenToast:Profiilin piilottaminen onnistui. Profiilisi piilotetaan Tiedejatutkimus.fi -palvelusta muutaman minuutin kuluttua.`,
              'success'
            );
            //this.reset();
        },
        (reason) => {
          this.hideProfileInProgress = false;
          this.connProblemHideProfile = true;
        },);
  }


  deleteProfile() {
    this.deleteProfileInProgress = true;
    this.connProblemDeleteProfile = false;
    this.profileService
      .deleteProfile()
      .then(
        (value) => {
          this.deleteProfileInProgress = false;
          this.dialog.closeAll();
          this.reset();

          // Wait for dialog to close
          setTimeout(() => {
            this.oidcSecurityService.logoff();
            }, 500);

        },
        (reason) => {
          this.deleteProfileInProgress = false;
          this.connProblemDeleteProfile = true;
        },);
  }

  /*
 * Clear draft data from storage and service
 */
  reset() {
    const currentProfileData = cloneDeep(
      this.profileService.currentProfileData
    );

    sessionStorage.removeItem(Constants.draftProfile);
    sessionStorage.removeItem(Constants.draftPatchPayload);
    sessionStorage.removeItem(Constants.draftPublicationPatchPayload);
    sessionStorage.removeItem(Constants.draftDatasetPatchPayload);
    sessionStorage.removeItem(Constants.draftFundingPatchPayload);
    sessionStorage.removeItem(Constants.draftCollaborationPatchPayload);
    sessionStorage.removeItem(Constants.draftHighlightOpenness);

    this.profileData = currentProfileData;
    this.profileService.setEditorProfileName(getName(currentProfileData));
  }
}
