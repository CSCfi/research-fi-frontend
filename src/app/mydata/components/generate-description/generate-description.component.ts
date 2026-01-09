import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { CommonStrings } from '@mydata/constants/strings';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { AutofocusDirective } from '@shared/directives/autofocus.directive';
import { MatCheckbox } from '@angular/material/checkbox';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { SimpleDropdownComponent } from '@shared/components/simple-dropdown/simple-dropdown.component';
import { SecondaryButtonComponent } from '@shared/components/buttons/secondary-button/secondary-button.component';
import { BiographyService } from '@mydata/services/biography.service';
import { BehaviorSubject, lastValueFrom, Subscription } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { PatchService } from '@mydata/services/patch.service';
import { unsignedDecimalNumber } from 'docx';
import { Constants } from '@mydata/constants';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { ProfileService } from '@mydata/services/profile.service';

@Component({
  selector: 'app-generate-description',
  imports: [
    AsyncPipe,
    NgIf,
    TertiaryButtonComponent,
    DialogComponent,
    MatCheckbox,
    SvgSpritesComponent,
    SimpleDropdownComponent,
    SecondaryButtonComponent,
    NgClass,
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

  aitta_modalIntroText = $localize`:@@aitta_modalIntroText:Voit luoda itsellesi tutkimustoiminnan kuvauksen tekoälyn avulla. Kuvauksen luomiseen käytetään vain Tiedejatutkimus.fi:ssä julkaistun profiilisi tietoja.`;

  selectInformationToDisplayInProfile = $localize`:@@aitta_selectInformationToDisplayInProfile:Valitse profiilissasi näytettävät tiedot`;
  noPublicDataText = $localize`:@@aitta_youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;
  languageVersionsTitle = $localize`:@@aitta_languageVersionsTitle:Kieliversiot`;

  selectDescriptionSourceTitle = $localize`:@@aitta_selectDescriptionSourceTitle:Valitse kuvaus`;
  aiGeneratedDescription = $localize`:@@aitta_aiGeneratedDescription:Tekoälyavusteinen kuvaus`;
  descriptionFromOtherDataSources = $localize`:@@aitta_descriptionFromOtherDataSources:Kuvaus muista tietolähteistä`;
  descriptionOptions = [this.aiGeneratedDescription, this.descriptionFromOtherDataSources];

  editDescriptionLabel = $localize`:@@aitta_editDescription:Muokkaa kuvausta`;

  originalDescriptionLabel = $localize`:@@aitta_originalDescriptionLabel:Alkuperäinen kuvaus`;
  editDescriptionLabelEn = $localize`:@@aitta_editDescriptionEn:Muokkaa englanninkielistä kuvausta`;
  editDescriptionLabelSv = $localize`:@@aitta_editDescriptionSv:Muokkaa ruotsinkielistä kuvausta`;

  selectDescriptionLanguageTitle = $localize`:@@aitta_selectDescriptionLanguageTitle:Valitse kuvauksen kieli`;
  languageFi = $localize`:@@languageFi:Suomi`;
  languageSv = $localize`:@@languageSv:Ruotsi`;
  languageEn = $localize`:@@languageSv:Englanti`;

  generatingDescriptionInfoText = $localize`:@@aitta_generatingDescriptionInfoText:Luodaan kuvausta. Tämä voi viedä pari minuuttia`;
  generatingLanguageVersionsInfoText = $localize`:@@aitta_generatingLanguageVersionsInfoText:Luodaan kieliversioita. Tämä voi viedä pari minuuttia`;


  generateDescriptionButtonText = $localize`:@@aitta_generateDescriptionButtonText:Luo kuvaus`;
  generateNewDescriptionButtonText = $localize`:@@aitta_generateNewDescriptionButtonText:Luo uusi kuvaus`;
  generateAndCreateLocalizationsButtonText = $localize`:@@aitta_generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`;
  reviewAndCreateLanguageVersionsButtonText = $localize`:@@aitta_reviewAndCreateLanguageVersionsButtonText:Tarkista ja luo kieliversiot`;
  selectLanguageVersionsText = $localize`:@@aitta_selectLanguageVersionsText:Valitse kieliversiot`;
  useLocalizationButtonText = $localize`:@@aitta_useDescriptionButtonText:Käytä kuvausta`;
  closeToBackgroundButtonText = $localize`:@@aitta_closeToBackgroundButtonText:Sulje taustalle`;

  notAllLanguageVersionsSelectedTitle = $localize`:@@aitta_notAllLanguageVersionsSelectedTitle:Kaikkia kieliversioita ei ole valittu näytettäväksi`;
  researchDescriptionGenerationDone = $localize`:@@aitta_researchDescriptionGenerationDone:Tutkimustoiminnan kuvauksen luonti valmistui`;
  languageVersionsGenerationDone = $localize`:@@aitta_languageVersionsGenerationDone:Kieliversioiden luonti valmistui`;

  languageVersionsInstructionBoxText = $localize`:@@aitta_languageVersionsInstructionBoxText:Tutkimustoiminnan kuvaus kannattaa kirjoittaa englanniksi, suomeksi ja ruotsiksi, jotta se saavuttaa mahdollisimman laajan yleisön.`;

  researchDescriptionSavedToDraft = $localize`:@@aitta_researchDescriptionSavedToDraft:Tutkimustoiminnan kuvaus on tallennettu profiililuonnokseesi.`;


  cancelButtonText = $localize`:@@cancel:Peruuta`;

  keywordsText = $localize`:@@keywords:Avainsanat`;

  aiGeneratedTextMayContainErrors = $localize`:@@aitta_aiGeneratedTextMayContainErrors:Tekoälyn luoma teksti voi sisältää asiavirheitä. Muistathan tarkastaa tekstin.`;
  languageVersionInfo = $localize`:@@aitta_languageVersionInfo:Kieliversiot kielillä Ruotsi ja Englanti voidaan luoda automaaattisesti tarkastamasi suomenkielisen kuvauksen pohjalta.`;

  importLanguageVersionsToProfile = $localize`:@@aitta_importLanguageVersionsToProfile:Tuo kieliversiot profiiliisi`;

  descriptionLanguages = [this.languageFi, this.languageSv, this.languageEn];


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
      label: $localize`:@@aitta_generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`,
      primary: true,
      method: 'saveAndGenerateLanguageVersions',
    }
  ];

  dialogActionsCreateNewDescriptionAiNotFinished = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancelGenerateBiography' },
    {
      label: $localize`:@@aitta_generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`,
      primary: true,
      method: 'saveAndGenerateLanguageVersions',
      disabled: true
    }
  ];

  aiBioFromBackendObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  dialogActionsAddDescriptionNotAi = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@aitta_useDescriptionButtonText:Käytä kuvausta`,
      primary: true,
      method: 'addNotAiBiographiesToPayload',
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
      label: $localize`:@@aitta_generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`,
      primary: true,
      method: 'saveAndGenerateLanguageVersions',
    }
  ];

  languageVersionEnChecked = false;
  languageVersionSvChecked = false;

  dialogActionsSelectLanguageVersions = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@saveSelections:Tallenna valinnat`,
      primary: true,
      method: 'saveLanguageVersions',
    }
  ];

  dialogActions = [];

  descriptionSource = 0;
  selectedLanguageTabModal = 0;
  selectedLanguageTab = 0;

  testStr = 'Ylen saaman aineiston mukaan Black Friday -alennusmyynneissä on useita tuotteita, ' +
    'joiden hintaa on tietoisesti nostettu siten, että alennukset saadaan näyttämään erityisen houkuttelevilta. ' +
    'Hintavertailupalvelu Hintaopas vertaili tuotteiden hintoja ennen Black Friday -alennuksia ja huomasi keinotekoista ' +
    'hintakikkailua, eräänlaisia feikkialennuksia. Alla olevasta grafiikasta selviää, että osa kaupoista on nostanut tuotteiden ' +
    'hintaa yli 30 päivää ennen Black Fridayta voidakseen markkinoida isoja alennuksia. Esimerkiksi JBL:n kaiuttimen hintaa on hilattu ylöspäin, mutta Black Friday -kampanjassa hinta on palannut entiselleen. Kuluttaja saa vaikutelman, että alennusprosentti on yli 60.';


  keywordsSelected = false;
  keywordsSelectedInDraft = false;

  useMockData = true;
  selectedKeywordsStr = '';
  selectedKeywordsValues = [];
  selectedKeywordsShowItemMetas = [];
  selectedKeywordsHideItemMetas = [];

  useMockDataLabel = 'Käytä demodataa';

  selectedNotAiBiographyIndex = -1;

  private currentBiography: Promise<Object>;

  languageCodes = ['fi', 'en', 'sv'];

  notAiBiographies = [];

  aiBiographiesFromBackend = { fi: '', en: '', sv: '', itemMeta: undefined };

  currentlyVisibleBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  isBiographyAiGeneratedObs$ = new BehaviorSubject(false);

  finishedGeneratingAiBiographyObs$ = new BehaviorSubject(false);

  userEditedBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  biographyGenerationOngoing$ = this.biographyService.biographyGenerationOngoing;
  generateBiographyRequested$ = new BehaviorSubject(false);
  translationsRequested$ = this.biographyService.translationsRequested;
  enTranslationOngoing$ = this.biographyService.enTranslationOngoing;
  svTranslationOngoing$ = this.biographyService.svTranslationOngoing;

  langVersionEnUsed$ = new BehaviorSubject(false);
  langVersionSvUsed$ = new BehaviorSubject(false);

  private biographyGenerationOngoingSub: Subscription;
  private clearDataSub: Subscription;

  constructor(
    public biographyService: BiographyService,
    private patchService: PatchService,
    private snackbarService: SnackbarService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit(): void {
    this.dialogActions = [...this.dialogActionsCreateNewDescriptionAiNotFinished];
    this.initBiographies();

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
  }

  clearData(){
    this.contentCreationStep = 1;
    this.languageVersionEnChecked = false;
    this.languageVersionSvChecked = false;
    this.aiBiographiesFromBackend = { fi: '', en: '', sv: '', itemMeta: undefined };
    this.currentlyVisibleBiographiesObs$.next({ fi: '', en: '', sv: '', itemMeta: undefined });
    this.userEditedBiographiesObs$.next({ fi: '', en: '', sv: '', itemMeta: undefined });
  }

  ngOnDestroy(): void {
    this.biographyGenerationOngoingSub ? this.biographyGenerationOngoingSub.unsubscribe() : undefined;
  }

  openDialog(dialogName: string) {
    if (dialogName === 'selectLanguageVersions') {
      this.dialogActions = [...this.dialogActionsSelectLanguageVersions];
      this.contentCreationStep = 4;
    } else {
      //event.stopPropagation();
      //this.openDialogCall.emit(index);
      if (!this.biographyService.isBiographyGenerationOngoing()) {
        this.initBiographies();
      }
    }
    this.showDialog$.next(true);
  }


  initBiographies() {
    this.selectedKeywordsValues = [];
    this.selectedKeywordsShowItemMetas = [];
    this.selectedKeywordsHideItemMetas = [];
    //this.selectedKeywordsStr = '';
    this.notAiBiographies = [];
    this.translationsRequested$.next(false);
    if (this.data && this.data.id === 'researchDescription') {
      this.data?.keywordItems?.items.forEach(item => {

        // One keywords is selected so show all, since they are shown as group like all or none
        if (item.itemMeta.show = true) {
          this.keywordsSelected = true;
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
      this.data?.items.forEach(item => {
        // Ai generated biography exists
        if (item.dataSources[0].registeredDataSource === 'Tiedejatutkimus.fi') {
          //this.aiGeneratedBiographyExists = true;

          this.aiBiographiesFromBackend['fi'] = item?.researchDescriptionFi;
          this.aiBiographiesFromBackend['en'] = item?.researchDescriptionEn;
          this.aiBiographiesFromBackend['sv'] = item?.researchDescriptionSv;
          this.aiBiographiesFromBackend['itemMeta'] = item?.itemMeta;
          this.aiBioFromBackendObs$.next(this.aiBiographiesFromBackend);
          if (item.itemMeta.show === true) {
            this.isBiographyAiGeneratedObs$.next(true);
          } else {
            this.isBiographyAiGeneratedObs$.next(false);
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
        }
        if (item.itemMeta.show === true) {
          let currentlyVisibleBiography = { fi: '', en: '', sv: '', itemMeta: undefined };
          currentlyVisibleBiography['fi'] = item?.researchDescriptionFi;
          currentlyVisibleBiography['en'] = item?.researchDescriptionEn;
          currentlyVisibleBiography['sv'] = item?.researchDescriptionSv;
          currentlyVisibleBiography['itemMeta'] = item.itemMeta;
          this.currentlyVisibleBiographiesObs$.next(currentlyVisibleBiography);
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
  };

  generateAndPatchBiographyPayload() {
    this.notAiBiographies = [];
    this.translationsRequested$.next(false);
    // Take biography from old api

    // Fetch latest saved values from backend
    const newProfileData = this.profileService.fetchProfileDataFromBackend().then(
      (value) => {
        if (value) {
          // Update profile for draft preview
          value.profileData[1].fields[1].items = value.profileData[1].fields[1].items.map(item => {
            if (item.dataSources[0].registeredDataSource === 'Tiedejatutkimus.fi') {
              let patchItem = cloneDeep(item);
              // Show or hide ai generated
              patchItem.itemMeta.show = this.isBiographyAiGeneratedObs$.getValue();
              this.patchService.addToPayload(patchItem.itemMeta);
              item.researchDescriptionFi = this.userEditedBiographiesObs$.getValue().fi;
              if (this.languageVersionEnChecked) {
                item.researchDescriptionEn = this.userEditedBiographiesObs$.getValue().en;
              } else {
                item.researchDescriptionEn = '';
              }
              if (this.languageVersionSvChecked) {
                item.researchDescriptionSv = this.userEditedBiographiesObs$.getValue().sv;
              } else {
                item.researchDescriptionSv = '';
              }

            } else {
              let patchItem = cloneDeep(item);
              // Show or hide not ai generated
              patchItem.itemMeta.show = !this.isBiographyAiGeneratedObs$.getValue();
              this.patchService.addToPayload(patchItem.itemMeta);
            }
            return item;
          });

          sessionStorage.setItem(Constants.draftProfile, JSON.stringify(value.profileData));

          // Patch keywords
          if (this.keywordsSelected || this.keywordsSelectedInDraft) {
            this.patchService.addToPayload(this.selectedKeywordsShowItemMetas);
          } else {
            this.patchService.addToPayload(this.selectedKeywordsHideItemMetas);
          }
          this.patchService.confirmPayload();
        }
      });
    this.showDraftSaveSuccessNotification();
  }

  showDraftSaveSuccessNotification(): void {
    this.snackbarService.show(
      $localize`:@@draftUpdated:Luonnos päivitetty`,
      'success'
    );
  }

  saveAiBioAndCreateLangVersions() {
    this.generateBiographyRequested$.next(false);
    // Clear old language versions after generated new bio in Finnish
    let patchBiographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
    patchBiographyStub.itemMeta = this.aiBioFromBackendObs$.getValue().itemMeta;
    patchBiographyStub.fi = this.aiBioFromBackendObs$.getValue().fi;

    this.biographyService.updateBiography(patchBiographyStub).then();
    this.aiBioFromBackendObs$.next(patchBiographyStub);
    this.currentlyVisibleBiographiesObs$.next(patchBiographyStub);

    // Add to draft payload

    this.generateTranslations(this.aiBioFromBackendObs$.getValue().fi);

    return this.biographyService.artificialDelayResolve(3000, '').then(() => {
      this.generateAndPatchBiographyPayload();
      this.showDialog$.next(false);
      this.showDraftSaveSuccessNotification();
    });
  }

  saveLanguageVersions() {
    let patchBiographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };

    patchBiographyStub.fi = this.userEditedBiographiesObs$.getValue().fi;
    if (this.languageVersionEnChecked) {
      this.langVersionEnUsed$.next(true);
      patchBiographyStub.en = this.userEditedBiographiesObs$.getValue().en;
      patchBiographyStub.itemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;
    }
    if (this.languageVersionSvChecked) {
      this.langVersionSvUsed$.next(true);
      patchBiographyStub.sv = this.userEditedBiographiesObs$.getValue().sv;
      patchBiographyStub.itemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;
    }

    // Update biography texts
    this.biographyService.updateBiography(patchBiographyStub).then();
    //this.aiGeneratedBiographiesObs$.next(patchBiographyStub);
    this.currentlyVisibleBiographiesObs$.next(patchBiographyStub);

    // Add to payload
    this.generateAndPatchBiographyPayload();
  }

  selectDescriptionSource(input: any) {
    this.descriptionSource = input;
    if (this.descriptionSource === 1) {
      this.dialogActions = [...this.dialogActionsAddDescriptionNotAi];
    } else {
      if (this.biographyService.isBiographyGenerationOngoing()) {
        this.dialogActions = [...this.dialogActionsCreateDescription];
        this.contentCreationStep = 2;
      } else {
        this.dialogActions = [...this.dialogActionsCreateNewDescriptionAiFinished];
        this.contentCreationStep = 3;
      }
    }
  }

  selectDescriptionLanguage(input: any) {

  }

  setSelectLanguageTab(input, isModalTab: boolean) {
    if (isModalTab) {
      this.selectedLanguageTabModal = input;
    } else {
      this.selectedLanguageTab = input;
    }
  }

  biographyFieldTextChange(event, languageNumber, isFirstModal: boolean) {

    // Content from AI generated version (first modal, always fin)
    if (isFirstModal) {
      let biographyStub = { fi: event.target.value.toString(), en: '', sv: '', itemMeta: undefined };
      biographyStub.itemMeta = this.aiBiographiesFromBackend.itemMeta;
      this.aiBiographiesFromBackend = biographyStub;
      this.aiBioFromBackendObs$.next(biographyStub);
      // Set finnish version for second modal and empty translations
      this.userEditedBiographiesObs$.next(biographyStub);
    }
    // Content from edit language versions
    else {
      let biographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
      biographyStub.fi = this.userEditedBiographiesObs$.getValue().fi;
      biographyStub.sv = this.userEditedBiographiesObs$.getValue().sv;
      biographyStub.en = this.userEditedBiographiesObs$.getValue().en;
      biographyStub.itemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;

      if (languageNumber === 0) {
        biographyStub.fi = event.target.value.toString();
      }
      if (languageNumber === 1) {
        biographyStub.en = event.target.value.toString();
      }
      if (languageNumber === 2) {
        biographyStub.sv = event.target.value.toString();
      }

      this.userEditedBiographiesObs$.next(biographyStub);
    }
  }

  generateTranslations(textToTranslate: string) {
    this.translationsRequested$.next(true);

    this.biographyService.generateTranslationEn(textToTranslate, this.useMockData).then(val => {
        let prevBiography = this.userEditedBiographiesObs$.getValue();
        prevBiography.en = this.biographyService.enTranslation.getValue();
        this.userEditedBiographiesObs$.next(prevBiography);
      }
    );
    this.biographyService.generateTranslationSv(textToTranslate, this.useMockData).then(val => {
        let prevBiography = this.userEditedBiographiesObs$.getValue();
        prevBiography.sv = this.biographyService.svTranslation.getValue();
        this.userEditedBiographiesObs$.next(prevBiography);
      }
    );
    this.biographyService.enTranslationOngoing.subscribe(val => {
      if (val === false) {
        let biographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
        biographyStub.fi = this.userEditedBiographiesObs$.getValue().fi;
        biographyStub.sv = this.userEditedBiographiesObs$.getValue().sv;
        biographyStub.en = this.biographyService.enTranslation.getValue();
        biographyStub.itemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;
        this.userEditedBiographiesObs$.next(biographyStub);

        // Add to payload
        let valueToShow = this.aiBioFromBackendObs$.getValue().itemMeta;
        valueToShow.show = true;
        //sessionStorage.setItem(Constants.draftProfile, JSON.stringify(this.fullProfiledata));
        this.patchService.addToPayload(valueToShow);
        this.patchService.confirmPayload();
      }
    });
    this.biographyService.svTranslationOngoing.subscribe(val => {
      if (val === false) {
        let biographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
        biographyStub.fi = this.userEditedBiographiesObs$.getValue().fi;
        biographyStub.en = this.userEditedBiographiesObs$.getValue().en;
        biographyStub.sv = this.biographyService.svTranslation.getValue();
        biographyStub.itemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;
        this.userEditedBiographiesObs$.next(biographyStub);

        // Add to payload
        let valueToShow = this.aiBioFromBackendObs$.getValue().itemMeta;
        valueToShow.show = true;
        //sessionStorage.setItem(Constants.draftProfile, JSON.stringify(this.fullProfiledata));
        this.patchService.addToPayload(valueToShow);
        this.patchService.confirmPayload();
      }
    });
  }

  async generateBiography() {
    this.generateBiographyRequested$.next(true);
    this.contentCreationStep = 2;
    this.dialogActions = [...this.dialogActionsCreateDescription];
    this.biographyService.generateBiography(this.useMockData).then();

    this.biographyGenerationOngoingSub = this.biographyService.biographyGenerationOngoing.subscribe(onGoing => {
      if (onGoing === false) {
        const generatedBiographyFi = this.biographyService.generatedBiographyData.getValue();
        this.userEditedBiographiesObs$.next({ fi: generatedBiographyFi, en: '', sv: '', itemMeta: this.aiBioFromBackendObs$.getValue().itemMeta });
        this.aiBioFromBackendObs$.next({ fi: generatedBiographyFi, en: '', sv: '', itemMeta: this.aiBioFromBackendObs$.getValue().itemMeta });
        this.contentCreationStep = 3;
        this.finishedGeneratingAiBiographyObs$.next(true);
      }
    });
  }

  generateNewBiography() {
    this.biographyService.generateBiography(this.useMockData).then(response => {

    });

    this.dialogActions = [...this.dialogActions1];
    this.contentCreationStep = 1;
  }

  setSelectedBiographyIndex(index: number) {
    if (this.descriptionSource === 1) {
      //this.descriptionIsSelected = false;
    }
    this.selectedNotAiBiographyIndex = index;
  }

  toggleKeywordsSelected() {
    this.keywordsSelected = !this.keywordsSelected;
  }

  toggleUseMockData() {
    this.useMockData = !this.useMockData;
  }

  async doDialogAction(action: string) {
    switch (action) {
      case 'addNotAiBiographiesToPayload': {
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        this.selectDescriptionSource(1);

        // Hide old
        if (this.currentlyVisibleBiographiesObs$.getValue().itemMeta) {
          let valueToHide = this.currentlyVisibleBiographiesObs$.getValue().itemMeta;
          valueToHide.show = false;
          this.patchService.addToPayload(valueToHide);
        }

        // Add new, if something selected
        if (this.selectedNotAiBiographyIndex > -1) {
          // TODO: hide ai bios

          let patchValue = this.notAiBiographies[this.selectedNotAiBiographyIndex].itemMeta;
          patchValue.show = true;
          this.patchService.addToPayload(patchValue);
          this.currentlyVisibleBiographiesObs$.next(this.notAiBiographies[this.selectedNotAiBiographyIndex]);
          this.isBiographyAiGeneratedObs$.next(false);
        } else {
          this.currentlyVisibleBiographiesObs$.next({ fi: '', en: '', sv: '', itemMeta: undefined });
        }
        this.patchService.confirmPayload();
      }

      case 'closeToBackgroundButtonText': {
        this.showDialog$.next(false);
        this.keywordsSelectedInDraft = this.keywordsSelected;
        break;
      }
      case 'generateNewBiography': {
        this.generateNewBiography();
        this.keywordsSelectedInDraft = this.keywordsSelected;
        break;
      }
      case 'reviewAndCreateLanguageVersions': {
        this.contentCreationStep = 3;
        break;
      }
      case 'saveAndGenerateLanguageVersions': {
        this.saveAiBioAndCreateLangVersions();
        this.isBiographyAiGeneratedObs$.next(true);
        this.keywordsSelectedInDraft = this.keywordsSelected;
        break;
      }

      case 'saveLanguageVersions': {
        this.saveLanguageVersions();
        this.isBiographyAiGeneratedObs$.next(true);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        //TODO: reload data and patched items
        break;
      }

      case 'cancelGenerateBiography': {
        this.biographyService.biographyGenerationOngoing.next(false);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        break;
      }

      case 'cancel': {
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        break;
      }

      default: {
        //TODO: need to check modal corner close
        //this.biographyService.biographyGenerationOngoing.next(false);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        break;
      }
    }
  }
}

