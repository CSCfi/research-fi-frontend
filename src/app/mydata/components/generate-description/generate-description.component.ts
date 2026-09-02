import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { AsyncPipe, isPlatformBrowser, JsonPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import { CommonStrings } from '@mydata/constants/strings';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { SimpleDropdownComponent } from '@shared/components/simple-dropdown/simple-dropdown.component';
import { SecondaryButtonComponent } from '@shared/components/buttons/secondary-button/secondary-button.component';
import { BiographyService } from '@mydata/services/biography.service';
import { BehaviorSubject, lastValueFrom, Observable, Subscription } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { PatchService } from '@mydata/services/patch.service';
import { Constants } from '@mydata/constants';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { ProfileService } from '@mydata/services/profile.service';
import { FormsModule } from '@angular/forms';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-generate-description',
  imports: [
    AsyncPipe,
    TertiaryButtonComponent,
    DialogComponent,
    MatCheckbox,
    SvgSpritesComponent,
    SimpleDropdownComponent,
    SecondaryButtonComponent,
    NgClass,
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './generate-description.component.html',
  styleUrl: './generate-description.component.scss'
})
export class GenerateDescriptionComponent implements OnInit, OnDestroy {
  @Input() fullProfiledata: any;
  @Input() data: any;
  @Input() hasSelectedItems: any = false;
  @Input() sectionIndex: number = 0;
  @Output() openDialogCall = new EventEmitter<number>();

  showDialog$ = new BehaviorSubject(false);

  editString = CommonStrings.reselect;
  selectString = CommonStrings.select;

  contentCreationStep = 1;

  descriptionOfResearchText = $localize`:@@descriptionOfResearch:Tutkimustoiminnan kuvaus`;

  aitta_modalIntroText = $localize`:@@aitta_infoText:Voit luoda itsellesi tutkimustoiminnan kuvauksen tekoälyn avulla. Kuvauksen luomiseen käytetään vain Tiedejatutkimus.fi:ssä julkaistun profiilisi tietoja. Tietojasi ei käytetä kielimallin kouluttamiseen eikä niitä säilytetä CSC:n Aitta-palvelussa.`;

  selectInformationToDisplayInProfile = $localize`:@@aitta_selectInformationToDisplayInProfile:Valitse profiilissasi näytettävät tiedot`;
  noPublicDataText = $localize`:@@aitta_youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;
  languageVersionsTitle = $localize`:@@aitta_languageVersionsTitle:Kieliversiot`;

  selectDefaultLabel = $localize`:@@select:Valitse`;

  selectDescriptionSourceTitle = $localize`:@@aitta_selectDescriptionSourceTitle:Kuvauksen tietolähde`;
  aiGeneratedDescription = $localize`:@@aitta_aiGeneratedDescription:Tekoälyavusteinen kuvaus`;
  descriptionFromOtherDataSources = $localize`:@@aitta_descriptionFromOtherDataSources:Kuvaus muista tietolähteistä`;
  descriptionOptions = [this.aiGeneratedDescription, this.descriptionFromOtherDataSources];

  editDescriptionLabel = $localize`:@@aitta_editDescription:Muokkaa kuvausta`;

  editDescriptionLabelFi = $localize`:@@aitta_editDescriptionFi:Muokkaa suomenkielistä kuvausta`;
  editDescriptionLabelEn = $localize`:@@aitta_editDescriptionEn:Muokkaa englanninkielistä kuvausta`;
  editDescriptionLabelSv = $localize`:@@aitta_editDescriptionSv:Muokkaa ruotsinkielistä kuvausta`;

  selectDescriptionLanguageTitle = $localize`:@@aitta_descriptionLanguageTitle:Kuvauksen kieli`;
  languageFi = $localize`:@@languageFi:Suomi`;
  languageSv = $localize`:@@languageSv:Ruotsi`;
  languageEn = $localize`:@@languageSv:Englanti`;

  aitta_generatingDescriptionInfoText = $localize`:@@aitta_generatingdescriptionInfoText:Luodaan kieliversioita. Tämä voi viedä pari minuuttia.`;

  generateDescriptionButtonText = $localize`:@@aitta_generateDescriptionButtonText:Luo kuvaus`;
  generateNewDescriptionButtonText = $localize`:@@aitta_generateNewDescriptionButtonText:Luo uusi kuvaus`;
  deleteDescriptionButtonText = $localize`:@@aitta_deleteDescriptionButtonText:Poista kuvaus`;
  selectLanguageVersionsText = $localize`:@@aitta_selectLanguageVersionsText:Valitse kieliversiot`;
  closeToBackgroundButtonText = $localize`:@@aitta_closeToBackgroundButtonText:Sulje taustalle`;

  researchDescriptionGenerationDone = $localize`:@@aitta_researchDescriptionGenerationDone:Tutkimustoiminnan kuvauksen luonti valmistui`;
  languageVersionsGenerationDone = $localize`:@@aitta_languageVersionsGenerationDone:Kieliversioiden luonti valmistui`;

  languageVersionsInstructionBoxText = $localize`:@@aitta_languageVersionsInstructionBoxText:Tutkimustoiminnan kuvaus kannattaa kirjoittaa englanniksi, suomeksi ja ruotsiksi, jotta se saavuttaa mahdollisimman laajan yleisön.`;

  researchDescriptionSavedToDraft = $localize`:@@aitta_researchDescriptionSavedToDraft:Tutkimustoiminnan kuvaus on tallennettu profiililuonnokseesi.`;

  aitta_youCanGenerateMultipleLanguageVersions = $localize`:@@aitta_youCanGenerateMultipleLanguageVersions:Voit luoda kuvauksesta useita kieliversioita.`

  reviewButtonText = $localize`:@@aitta_reviewButtonText:Tarkista luotu kuvaus`;

  keywordsText = $localize`:@@keywords:Avainsanat`;

  aiGeneratedTextMayContainErrors = $localize`:@@aitta_aiGeneratedTextMayContainErrors:Tekoälyn luoma teksti voi sisältää asiavirheitä. Muistathan tarkastaa tekstin.`;

  dialogActions1 = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@aitta_useDescriptionButtonText:Käytä kuvausta`, primary: true, method: 'save' }
  ];

  dialogActionsCreateDescription = [
    {
      label: $localize`:@@cancel:Peruuta`,
      primary: false,
      method: 'cancelGenerateBiography',
      svgSymbolName: 'create-new-diamond',
      svgCssClass: 'create-new-diamond-icon',
      flexStart: true
    },
    {
      label: $localize`:@@closeToBackgroundButtonText:Sulje taustalle`,
      primary: true,
      method: 'closeToBackgroundButtonText'
    }
  ];

  dialogActionsCreateNewDescriptionAiFinished = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@aitta_save:Tallenna`,
      primary: true,
      method: 'saveChanges'
    }
  ];

  dialogActionsCreateNewDescriptionAiNotFinished = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancelGenerateBiography' },
    {
      label: $localize`:@@aitta_save:Tallenna`,
      primary: true,
      method: 'saveChanges',
      disabled: true
    }
  ];

  dialogActionsAddDescriptionNotAi = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@aitta_useDescriptionButtonText:Käytä kuvausta`,
      primary: true,
      method: 'addNotAiBiographiesToPayload'
    }
  ];

  dialogActionsCreateNewDescriptionOngoing = [
    {
      label: $localize`:@@generateNewDescriptionButtonText:Luo uusi kuvaus`,
      tertiary: true,
      method: 'generateNewBiography',
      disabled: 'true'
    },
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@aitta_save:Tallenna`,
      primary: true,
      method: 'saveChanges'
    }
  ];

  dialogActionsSelectLanguageVersions = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@saveSelections:Tallenna valinnat`,
      primary: true,
      method: 'saveLanguageVersions'
    }
  ];

  useAiBiographyText = $localize`:@@aitta_useDescriptionButtonText:Käytä kuvausta`;
  useAiBiography = true;

  generatingDescriptionInfoText = [$localize`:@@aitta_generatingDescriptionInFinnish:Luodaan kuvausta suomeksi. Tämä voi viedä pari minuuttia.`, $localize`:@@aitta_generatingDescriptionInSwedish:Luodaan kuvausta ruotsiksi. Tämä voi viedä pari minuuttia.`, $localize`:@@aitta_generatingDescriptionInEnglish:Luodaan kuvausta englanniksi. Tämä voi viedä pari minuuttia.`];

  dialogActions = [];

  descriptionSource = -1;
  descriptionSourceInSavedDraft = -1;
  selectedLanguageNotAi = 0;
  selectedLanguageTab = 0;

  keywordsSelectedFromBackEnd = false;
  keywordsSelectedDraft = false;
  keywordsSourceLocalized = '';

  useMockData = false;
  selectedKeywordsStr = '';
  selectedKeywordsValues = [];
  selectedKeywordsShowItemMetas = [];
  selectedKeywordsHideItemMetas = [];

  selectedNotAiBiographyIndex = -1;
  selectedNotAiBiographyItem = undefined;

  languageCodes = ['fi', 'en', 'sv'];

  notAiBiographies = [];

  aiBiographiesFromBackend = { fi: '', en: '', sv: '', itemMeta: undefined };

  savedDraftBiographies: Observable<any>;

  savedDraftBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  isBiographyAiGeneratedObs$ = new BehaviorSubject(false);

  finishedGeneratingAiBiographyObs$ = new BehaviorSubject(false);

  userEditableBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  biographyGenerationOngoing$ = this.biographyService.biographyGenerationOngoing;
  generateBiographyRequested$ = new BehaviorSubject(false);
  translationsRequested$ = this.biographyService.translationsRequested;

  langVersionEnUsed$ = new BehaviorSubject(false);
  langVersionSvUsed$ = new BehaviorSubject(false);

  dropdownLanguageSelection = 0;

  initDoneOnce = false;

  private biographyGenerationOngoingSub: Subscription;
  private biographyGenerationErrorSub: Subscription;
  private capitalizedLocale: string;

  private clearDataSub: Subscription;
  private updateDataSub: Subscription;

  biographyModalTextAreaValue = '';
  biographyReadyDismissed$ = new BehaviorSubject(false);

  constructor(
    public biographyService: BiographyService,
    private patchService: PatchService,
    private snackbarService: SnackbarService,
    private profileService: ProfileService,
    private appSettingsService: AppSettingsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.capitalizedLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    if (!this.biographyService.isBiographyGenerationOngoing()) {
      this.initBiographies();
    }

    // Biography generation finished
    this.biographyGenerationOngoing$.subscribe(response => {
      if (response === false) {
        this.dialogActions = [...this.dialogActionsCreateNewDescriptionAiFinished];
        this.contentCreationStep = 3;
      }
    });

    this.clearDataSub = this.biographyService.clearDataRequested.subscribe(val => {
      if (val === true) {
        this.clearData();
      }
    });

    this.updateDataSub = this.biographyService.updateDataRequested.subscribe(val => {
      if (val === true) {
        this.initBiographies();
      }
    });
  }

  clearData() {
    this.contentCreationStep = 1;
    this.aiBiographiesFromBackend = { fi: '', en: '', sv: '', itemMeta: undefined };
    this.savedDraftBiographiesObs$.next({ fi: '', en: '', sv: '', itemMeta: undefined });
    this.userEditableBiographiesObs$.next({ fi: '', en: '', sv: '', itemMeta: undefined });
    this.initBiographies();
    this.initDoneOnce = false;
  }

  ngOnDestroy(): void {
    this.biographyGenerationOngoingSub ? this.biographyGenerationOngoingSub.unsubscribe() : undefined;
    this.biographyGenerationErrorSub ? this.biographyGenerationErrorSub.unsubscribe() : undefined;
    this.clearDataSub ? this.clearDataSub.unsubscribe() : undefined;
    this.updateDataSub ? this.updateDataSub.unsubscribe() : undefined;
  }

  openDialog(dialogName: string) {
    console.log('openDialog', dialogName);
    if (dialogName === 'review') {
      this.selectDescriptionSource(0);
      this.biographyReadyDismissed$.next(true);
      }
    if (!this.biographyService.isBiographyGenerationOngoing()) {
      if (!this.initDoneOnce) {
        this.initBiographies();
      }
    }

    this.showDialog$.next(true);
    this.selectDescriptionLanguageAi(this.dropdownLanguageSelection);
  }

  initBiographies() {
    this.savedDraftBiographies = this.savedDraftBiographiesObs$.asObservable();

    this.selectedKeywordsValues = [];
    this.selectedKeywordsShowItemMetas = [];
    this.selectedKeywordsHideItemMetas = [];

    this.notAiBiographies = [];
    this.translationsRequested$.next(false);
    if (this.data && this.data.id === 'researchDescription') {
      this.data?.keywordItems?.items.forEach(item => {
        let kwDataSources = item?.dataSources;
        if (kwDataSources?.length > 0) {
          if (this.capitalizedLocale === 'Fi') {
            this.keywordsSourceLocalized = kwDataSources[0]?.organization.nameFi;
          } else if (this.capitalizedLocale === 'Sv') {
            this.keywordsSourceLocalized = kwDataSources[0]?.organization.nameSv;
          } else if (this.capitalizedLocale === 'En') {
            this.keywordsSourceLocalized = kwDataSources[0]?.organization.nameEn;
          }
        }

        // One keywords is selected so show all, since they are shown as group like all or none
        if (item.itemMeta.show === true) {
          this.keywordsSelectedDraft = true;
          this.keywordsSelectedFromBackEnd = true;
        }
        this.selectedKeywordsValues.push(item.value);
        item.itemMeta.show = true;
        this.selectedKeywordsShowItemMetas.push(cloneDeep(item.itemMeta));
        item.itemMeta.show = false;
        this.selectedKeywordsHideItemMetas.push(cloneDeep(item.itemMeta));
      });
      this.selectedKeywordsStr = this.selectedKeywordsValues.join(', ');
    }

    // Take biography from old api
    if (this.data && this.data.id === 'researchDescription') {
      let itemIndex = -1;
      this.data?.items.forEach(item => {
        itemIndex += 1;
        // Ai generated biography exists
        if (item.dataSources[0].registeredDataSource === 'Tiedejatutkimus.fi') {
          //this.aiGeneratedBiographyExists = true;
          // User has not edited biography yet, so fetch ai generated biography
          if (this.userEditableBiographiesObs$.getValue().fi.length < 1 && this.userEditableBiographiesObs$.getValue().en.length < 1 && this.userEditableBiographiesObs$.getValue().sv.length < 1) {
            this.aiBiographiesFromBackend['fi'] = item?.researchDescriptionFi;
            this.aiBiographiesFromBackend['en'] = item?.researchDescriptionEn;
            this.aiBiographiesFromBackend['sv'] = item?.researchDescriptionSv;
            this.aiBiographiesFromBackend['itemMeta'] = item?.itemMeta;
            this.userEditableBiographiesObs$.next(this.aiBiographiesFromBackend);
            //this.savedDraftBiographiesObs$.next(this.aiBiographiesFromBackend);
            if (item.itemMeta.show === true) {
              this.isBiographyAiGeneratedObs$.next(true);
              this.selectDescriptionSource(0);
            } else {
              this.isBiographyAiGeneratedObs$.next(false);
              if (this.descriptionSourceInSavedDraft !== -1) {
                  this.selectDescriptionSource(this.descriptionSourceInSavedDraft);
                } else {
                this.selectDescriptionSource(-1);
              }
            }
          }
        } else {
          // Add biographies from not ai sources
          let biographyStub = {
            fi: item?.researchDescriptionFi ?? '',
            en: item?.researchDescriptionEn ?? '',
            sv: item?.researchDescriptionSv ?? '',
            itemMeta: item?.itemMeta
          };
          this.notAiBiographies.push(biographyStub);

          // This makes currently active checked in listing
          if (item?.itemMeta?.show === true) {
            this.selectDescriptionSource(1);
            this.selectedNotAiBiographyIndex = itemIndex;
            this.selectedNotAiBiographyItem = item;
          } else {
            if (this.descriptionSourceInSavedDraft !== -1) {
              this.selectDescriptionSource(this.descriptionSourceInSavedDraft);
            }
          }
        }
        // Shared for old api and Ai generated
        if (item.itemMeta.show === true) {
          let currentlyVisibleBiography = { fi: '', en: '', sv: '', itemMeta: undefined };
          currentlyVisibleBiography['fi'] = item?.researchDescriptionFi;
          currentlyVisibleBiography['en'] = item?.researchDescriptionEn;
          currentlyVisibleBiography['sv'] = item?.researchDescriptionSv;
          currentlyVisibleBiography['itemMeta'] = item.itemMeta;

          this.savedDraftBiographiesObs$.next(currentlyVisibleBiography);

          //this.userEditableBiographiesObs$.next(currentlyVisibleBiography);
        }

        if (this.biographyService.isBiographyGenerationOngoing()) {
          this.dialogActions = [...this.dialogActionsCreateDescription];
          this.contentCreationStep = 2;
        } else {
          this.dialogActions = [...this.dialogActionsCreateNewDescriptionAiFinished];
          this.contentCreationStep = 3;
        }
      });
    }
    //this.userEditableBiographiesObs$.next(this.savedDraftBiographiesObs$.getValue());
    this.biographyModalTextAreaValue = this.userEditableBiographiesObs$.getValue().fi;
    this.initLanguageSelectDefaultValue();
    this.initDoneOnce = true;
  };

  initLanguageSelectDefaultValue(){
    if (this.savedDraftBiographiesObs$.getValue().fi.length > 0) {
      this.selectedLanguageTab = 0;
    } else if (this.savedDraftBiographiesObs$.getValue().en.length > 0) {
      this.selectedLanguageTab = 1;
    } else if (this.savedDraftBiographiesObs$.getValue().sv.length > 0) {
      this.selectedLanguageTab = 2;
    } else {
      this.selectedLanguageTab = 0;
    }
  }

  generateAndPatchBiographyPayload() {
    this.translationsRequested$.next(false);
    // Take biography from old api

    // Fetch latest saved values from backend
    const newProfileData = this.profileService.fetchProfileDataFromBackend().then(
      (value) => {
        if (value) {
          // Update profile for draft preview
          value.profileData[1].fields[1].items = value.profileData[1].fields[1].items.map(previewItem => {

            // Ai generated biography exists
            if (previewItem.dataSources[0].registeredDataSource === 'Tiedejatutkimus.fi') {
              let patchItem = cloneDeep(previewItem);
              // Show or hide ai generated
              previewItem.researchDescriptionFi = this.userEditableBiographiesObs$.getValue().fi;
              previewItem.researchDescriptionEn = this.userEditableBiographiesObs$.getValue().en;
              previewItem.researchDescriptionSv = this.userEditableBiographiesObs$.getValue().sv;

              if (this.capitalizedLocale === 'Fi') {
                previewItem.value = previewItem.researchDescriptionFi;
              } else if (this.capitalizedLocale === 'Sv') {
                previewItem.value = previewItem.researchDescriptionSv;
              } else if (this.capitalizedLocale === 'En') {
                previewItem.value = previewItem.researchDescriptionEn;
              }

              // Hide item with empty text content, otherwise empty section with caption is shown in profile view
              patchItem.itemMeta.show = this.useAiBiography;
              if (previewItem.researchDescriptionFi.length < 1 && previewItem.researchDescriptionEn.length < 1 && previewItem.researchDescriptionSv.length < 1) {
                patchItem.itemMeta.show = false;
              }
              this.patchService.addToPayload(patchItem.itemMeta);

            } else {
              let patchItem = cloneDeep(previewItem);
              // Hide all not selected
              if (patchItem.itemMeta.id === this.selectedNotAiBiographyItem?.itemMeta?.id) {
                patchItem.itemMeta.show = true;
              } else {
                patchItem.itemMeta.show = false;
              }
              this.patchService.addToPayload(patchItem.itemMeta);

              // Update visible version in UI for non AI generated
              if (!this.useAiBiography) {
                if (this.notAiBiographies[this.selectedNotAiBiographyIndex]) {
                  this.savedDraftBiographiesObs$.next(this.notAiBiographies[this.selectedNotAiBiographyIndex]);
                } else {
                  this.savedDraftBiographiesObs$.next({ fi: '', en: '', sv: '', itemMeta: undefined });
                }
              }
            }
            return previewItem;
          });

          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(Constants.draftProfile, JSON.stringify(value.profileData));
          }

          // Patch keywords
          if (this.keywordsSelectedDraft) {
            this.patchService.addToPayload(this.selectedKeywordsShowItemMetas);
          } else {
            this.patchService.addToPayload(this.selectedKeywordsHideItemMetas);
          }
          this.patchService.confirmPayload();
        }
      });
    this.showDraftSaveSuccessNotification();

    // Data needs to be refetched
    this.initDoneOnce = false;
  }

  showDraftSaveSuccessNotification(): void {
    this.generateBiographyRequested$.next(false);
    this.snackbarService.show(
      $localize`:@@draftUpdated:Luonnos päivitetty`,
      'success'
    );
  }

  showBiographyGenerationFailedNotification(): void {
    this.snackbarService.show(
      $localize`:@@aitta_errorTimeout:Tutkimustoiminnan kuvauksen luonti epäonnistui. Yhteys aikakatkaistiin.`,
      'error'
    );
  }

  selectDescriptionLanguageNotAi(input: any) {
    this.selectedLanguageNotAi = input;
  }

  setSelectLanguageTab(input: any) {
    this.selectedLanguageTab = input;
  }

  selectDescriptionLanguageAi(input) {
    if (this.biographyGenerationOngoing$.getValue() !== true) {
      if (input === 0) {
        this.biographyModalTextAreaValue = this.userEditableBiographiesObs$.getValue().fi;
      }
      if (input === 1) {
        this.biographyModalTextAreaValue = this.userEditableBiographiesObs$.getValue().sv;
      }
      if (input === 2) {
        this.biographyModalTextAreaValue = this.userEditableBiographiesObs$.getValue().en;
      }
      this.dropdownLanguageSelection = input;
    }
  }

  biographyFieldTextChange(languageNumber, isFirstModal: boolean) {
    let biographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };

    biographyStub.fi = this.userEditableBiographiesObs$.getValue().fi;
    biographyStub.sv = this.userEditableBiographiesObs$.getValue().sv;
    biographyStub.en = this.userEditableBiographiesObs$.getValue().en;
    biographyStub.itemMeta = this.userEditableBiographiesObs$.getValue().itemMeta;

    if (languageNumber === 0) {
      biographyStub.fi = this.biographyModalTextAreaValue;
    }
    if (languageNumber === 1) {
      biographyStub.sv = this.biographyModalTextAreaValue;
    }
    if (languageNumber === 2) {
      biographyStub.en = this.biographyModalTextAreaValue;
    }
    this.userEditableBiographiesObs$.next(biographyStub);
  }

  saveAiBioChanges() {
    // Clear old language versions after generated new bio in Finnish
    let patchBiographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
    patchBiographyStub.itemMeta = this.userEditableBiographiesObs$.getValue().itemMeta;
    patchBiographyStub.fi = this.userEditableBiographiesObs$.getValue().fi;
    patchBiographyStub.sv = this.userEditableBiographiesObs$.getValue().sv;
    patchBiographyStub.en = this.userEditableBiographiesObs$.getValue().en;

    this.biographyService.updateBiography(patchBiographyStub).then();
    this.savedDraftBiographiesObs$.next(cloneDeep(patchBiographyStub));

    this.setSelectedNotAiBiographyItem(undefined);

    this.generateAndPatchBiographyPayload();
    this.showDialog$.next(false);
    this.showDraftSaveSuccessNotification();
    this.initLanguageSelectDefaultValue();

    /*    return this.biographyService.artificialDelayResolve(3000, '').then(() => {
          this.generateAndPatchBiographyPayload();
          this.showDialog$.next(false);
          this.showDraftSaveSuccessNotification();
        });*/
    this.descriptionSourceInSavedDraft = 0;
  }

  deleteSelectedDescription() {
    this.biographyModalTextAreaValue = '';
    let patchBiographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
    patchBiographyStub.itemMeta = this.userEditableBiographiesObs$.getValue().itemMeta;

    this.dropdownLanguageSelection === 0 ? patchBiographyStub.fi = '' : patchBiographyStub.fi = this.userEditableBiographiesObs$.getValue().fi;
    this.dropdownLanguageSelection === 1 ? patchBiographyStub.sv = '' : patchBiographyStub.sv = this.userEditableBiographiesObs$.getValue().sv;
    this.dropdownLanguageSelection === 2 ? patchBiographyStub.en = '' : patchBiographyStub.en = this.userEditableBiographiesObs$.getValue().en;
    this.userEditableBiographiesObs$.next(cloneDeep(patchBiographyStub));

    this.biographyService.updateBiography(cloneDeep(patchBiographyStub)).then();
    this.savedDraftBiographiesObs$.next(cloneDeep(patchBiographyStub));
    this.selectDescriptionLanguageAi(this.dropdownLanguageSelection);
  }

  selectDescriptionSource(input: any) {
    this.descriptionSource = input;
    if (this.descriptionSource === 1) {
      this.dialogActions = [...this.dialogActionsAddDescriptionNotAi];
    } else {
      this.useAiBiography = true;
      if (this.biographyService.isBiographyGenerationOngoing()) {
        this.dialogActions = [...this.dialogActionsCreateDescription];
        this.contentCreationStep = 2;
      } else {
        this.dialogActions = [...this.dialogActionsCreateNewDescriptionAiFinished];
        this.contentCreationStep = 3;
      }
    }
  }

  async generateBiography() {
    this.generateBiographyRequested$.next(true);
    this.biographyReadyDismissed$.next(false);
    this.contentCreationStep = 2;
    this.dialogActions = [...this.dialogActionsCreateDescription];

    const selectedLanguageAbbreviations = ['fi', 'sv', 'en'];

    // Deleting is needed for UI check mark state update
    this.deleteSelectedDescription();

    this.biographyService.generateBiography(this.useMockData, selectedLanguageAbbreviations[this.dropdownLanguageSelection]).then();

    this.biographyGenerationErrorSub = this.biographyService.biographyGenerationError.subscribe(error => {
      if (error) {
        this.showBiographyGenerationFailedNotification();
        this.biographyService.biographyGenerationOngoing.next(false);
        this.biographyGenerationErrorSub.unsubscribe();
      }
    });
    this.finishedGeneratingAiBiographyObs$.next(false);
    if (this.dropdownLanguageSelection === 0) {
      this.biographyGenerationOngoingSub = this.biographyService.biographyGenerationOngoing.subscribe(onGoing => {
        if (onGoing === false) {
          const generatedBiographyFi = cloneDeep(this.biographyService.generatedBiographyData.getValue());
          this.userEditableBiographiesObs$.next({
            fi: generatedBiographyFi,
            en: this.userEditableBiographiesObs$.getValue().en,
            sv: this.userEditableBiographiesObs$.getValue().sv,
            itemMeta: this.userEditableBiographiesObs$.getValue().itemMeta
          });
          this.biographyModalTextAreaValue = generatedBiographyFi;

          this.selectDescriptionLanguageAi(0);
          this.contentCreationStep = 3;
          this.finishedGeneratingAiBiographyObs$.next(true);
          this.biographyGenerationOngoingSub ? this.biographyGenerationOngoingSub.unsubscribe() : undefined;
        }
      });
    } else if (this.dropdownLanguageSelection === 1) {
      this.biographyGenerationOngoingSub = this.biographyService.biographyGenerationOngoing.subscribe(onGoing => {
        if (onGoing === false) {
          const generatedBiographySv = cloneDeep(this.biographyService.generatedBiographyDataSv.getValue());
          this.userEditableBiographiesObs$.next({
            fi: this.userEditableBiographiesObs$.getValue().fi,
            en: this.userEditableBiographiesObs$.getValue().en,
            sv: generatedBiographySv,
            itemMeta: this.userEditableBiographiesObs$.getValue().itemMeta
          });
          this.biographyModalTextAreaValue = generatedBiographySv;

          this.selectDescriptionLanguageAi(1);
          this.contentCreationStep = 3;
          this.finishedGeneratingAiBiographyObs$.next(true);
          this.biographyGenerationOngoingSub ? this.biographyGenerationOngoingSub.unsubscribe() : undefined;
        }
      });
    } else if (this.dropdownLanguageSelection === 2) {
      this.biographyGenerationOngoingSub = this.biographyService.biographyGenerationOngoing.subscribe(onGoing => {
        if (onGoing === false) {
          const generatedBiographyEn = cloneDeep(this.biographyService.generatedBiographyDataEn.getValue());

          this.userEditableBiographiesObs$.next({
            fi: this.userEditableBiographiesObs$.getValue().fi,
            en: generatedBiographyEn,
            sv: this.userEditableBiographiesObs$.getValue().sv,
            itemMeta: this.userEditableBiographiesObs$.getValue().itemMeta
          });
          this.biographyModalTextAreaValue = generatedBiographyEn;

          this.selectDescriptionLanguageAi(2);
          this.contentCreationStep = 3;
          this.finishedGeneratingAiBiographyObs$.next(true);
          this.biographyGenerationOngoingSub ? this.biographyGenerationOngoingSub.unsubscribe() : undefined;
        }
      });
    }
  }

  setSelectedNotAiBiographyIndex(index: number) {
    if (this.selectedNotAiBiographyIndex !== index) {
      this.selectedNotAiBiographyIndex = index;
    } else {
      this.selectedNotAiBiographyIndex = undefined;
    }
  }

  setSelectedNotAiBiographyItem(biographyData: any) {
    if (this.selectedNotAiBiographyIndex) {
      this.selectedNotAiBiographyItem = biographyData;
    } else {
      this.selectedNotAiBiographyItem = undefined;
    }
  }

  toggleKeywordsSelected() {
    this.keywordsSelectedDraft = !this.keywordsSelectedDraft;
  }

  async doDialogAction(action: string) {
    switch (action) {
      case 'addNotAiBiographiesToPayload': {
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        this.selectDescriptionSource(1);
        this.descriptionSourceInSavedDraft = 1;
        this.generateAndPatchBiographyPayload();
        this.useAiBiography = false;
      }

      case 'closeToBackgroundButtonText': {
        this.showDialog$.next(false);
        this.isBiographyAiGeneratedObs$.next(true);
        break;
      }
      case 'review': {
        this.contentCreationStep = 3;
        break;
      }
      case 'saveChanges': {
        this.saveAiBioChanges();
        this.isBiographyAiGeneratedObs$.next(true);
        break;
      }

      case 'cancelGenerateBiography': {
        this.biographyService.biographyGenerationOngoing.next(false);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        this.initDoneOnce = false;
        break;
      }

      case 'cancel': {
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        this.keywordsSelectedDraft = this.keywordsSelectedFromBackEnd;
        this.initDoneOnce = false;
        break;
      }

      default: {
        //this.biographyService.biographyGenerationOngoing.next(false);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        break;
      }
    }
  }
}

