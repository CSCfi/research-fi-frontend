import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { SecondaryButtonComponent } from '@shared/components/buttons/secondary-button/secondary-button.component';
import { ProfileService } from '@mydata/services/profile.service';
import { DraftSummaryComponent } from '@mydata/components/profile/draft-summary/draft-summary.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DraftService } from '@mydata/services/draft.service';
import { map } from 'rxjs/operators';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import {
  AutomaticPublishingSettingsComponent
} from '@mydata/components/automatic-publishing-settings/automatic-publishing-settings.component';
import { BehaviorSubject } from 'rxjs';
import { DialogEventsService } from '@shared/services/dialog-events.service';
import { BiographyService } from '@mydata/services/biography.service';

@Component({
    selector: 'app-sticky-footer',
    imports: [
        AsyncPipe,
        MatButton,
        NgIf,
        PrimaryActionButtonComponent,
        SecondaryButtonComponent,
        DraftSummaryComponent,
        DialogComponent,
        RouterLink,
        TertiaryButtonComponent,
        AutomaticPublishingSettingsComponent
    ],
    templateUrl: './sticky-footer.component.html',
    styleUrl: './sticky-footer.component.scss'
})
export class StickyFooterComponent implements OnInit, OnDestroy {
  public accountSettingsFoldOpen = new BehaviorSubject<boolean>(false);

  orcidData: any;
  profileData: any;
  collaborationOptions: any[];
  highlightOpenness$: any;
  automaticPublishing$: any;
  orcid: string;

  isProfilePublished = this.draftService.person$.pipe(map((person) => person != null ));
  isDraftProfileChanged =  this.draftService.edited$;
  isProfileVisible = this.profileService.getProfileVisibilityObservable();
  publishingInProgress = this.draftService.getPublishingInProgressObservable();
  isLogoutConfirmModalVisible = this.draftService.showLogoutConfirmModal.subscribe(val => {
    if (val === true) {
      this.draftService.showLogoutConfirmModal.next(false);
      this.showDiscardChangesAndLogout();
    }
  });

  constructor(
    public profileService: ProfileService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private biographyService: BiographyService,
    public draftService: DraftService,
    public collaborationsService: CollaborationsService,
    private dialogEventService: DialogEventsService
  ) {
    //this.profileService.initializeProfileVisibilityAndSettings();
  }

  ngOnInit(): void {

    // Get data from resolver
    const orcidProfile = this.route.snapshot.data.orcidProfile;

    this.orcidData = orcidProfile;
    this.orcid = orcidProfile.orcid;
    this.profileData = this.draftService.getDraftProfile();
    this.collaborationOptions = this.collaborationsService.confirmedPayload;
    this.highlightOpenness$ = this.draftService.highlightOpennessPayloadSubObs;
    this.automaticPublishing$ = this.draftService.automaticPublishingPayloadSubObs;
    }

  // Dialog texts
  publishUpdatedProfile = $localize`:@@publishUpdatedProfile:Julkaise päivitetty profiili`;
  discardChanges = $localize`:@@discardChanges:Hylkää muutokset`;
  logout = $localize`:@@logout:Kirjaudu ulos`;
  republishUpdatedProfile = $localize`:@@mydata.profile.republish-modal.title:Julkaise piilotettu profiili`;
  republishText = $localize`:@@publish:Julkaise`;
  unpublishedChanges = $localize`:@@unpublishedChanges:Julkaisemattomia muutoksia`;
  @ViewChild('discardChangesTemplate', { static: true }) discardChangesTemplate: ElementRef;

  // Dialog variables
  showDialog: boolean;
  dialogTitle: any;
  dialogTemplate: any;
  dialogExtraContentTemplate: any;
  currentDialogActions: any[];
  disableDialogClose: boolean;

  basicDialogActions = [
    { label: $localize`:@@close:Sulje`, primary: true, method: 'close' },
  ];
  publishUpdatedProfileDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@publish:Julkaise`, primary: true, method: 'publish' },
  ];
  discardChangesActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.discardChanges,
      primary: true,
      method: 'discard',
    },
  ];

  republishActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'close' },
    {
      label: this.republishText,
      primary: true,
      method: 'republish',
    },
  ];

  clearData(){

  }

  showDiscardChangesAndLogout(){
    this.dialogEventService.setDiscardChangesModalVisibleState(true);
  }

  openDialog(title: string, template: any, extraContentTemplate: any, actions: any, disableDialogClose: boolean) {
    this.profileData = this.draftService.getDraftProfile();
    this.dialogTitle = title;
    this.showDialog = true;
    this.dialogTemplate = template;
    this.dialogExtraContentTemplate = extraContentTemplate;
    this.currentDialogActions = actions;
    this.disableDialogClose = disableDialogClose;
  }

  closeDialog() {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;
    this.disableDialogClose = false;
  }

  doDialogAction(action: string) {
    this.dialog.closeAll();
    this.dialogTitle = '';
    this.showDialog = false;
    this.dialogTemplate = null;

    switch (action) {
      case 'publish': {
        this.draftService.publish();
        break;
      }
      case 'discard': {
        this.draftService.clearDraftData();
        this.biographyService.clearData();
        break;
      }
      case 'republish': {
        this.draftService.republish();
        break;
      }
    }
  }

  emitAutomaticPublishingActiveState(state: any){
    this.accountSettingsFoldOpen.next(true);
    this.draftService.addToAutomaticPublishingPayload(state)
  }

  ngOnDestroy() {
    if (this.isLogoutConfirmModalVisible) {
      this.isLogoutConfirmModalVisible.unsubscribe();
    }
  }
}
















