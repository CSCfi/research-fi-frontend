import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { PatchService } from '@mydata/services/patch.service';
import { unsignedDecimalNumber } from 'docx';
import { Constants } from '@mydata/constants';
import { SnackbarService } from '@mydata/services/snackbar.service';

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
export class GenerateDescriptionComponent implements OnInit {
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

  aitta_modalIntroText = 'Voit luoda itsellesi tutkimustoiminnan kuvauksen tekoälyn avulla. Kuvauksen luomiseen käytetään vain Tiedejatutkimus.fi:ssä julkaistun profiilisi tietoja. ';

  selectInformationToDisplayInProfile = $localize`:@@selectInformationToDisplayInProfile:Valitse profiilissasi näytettävät tiedot`;
  noPublicDataText = $localize`:@@youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;
  languageVersionsTitle = $localize`:@@languageVersionsTitle:Kieliversiot`;

  selectDescriptionSourceTitle = $localize`:@@selectDescriptionSourceTitle:Valitse kuvauksen tietolähde`;
  aiGeneratedDescription = $localize`:@@aiGeneratedDescription:Tekoälyn luoma kuvaus`;
  descriptionFromOtherDataSources = $localize`:@@descriptionFromOtherDataSources:Kuvaus muista tietolähteistä`;
  descriptionOptions = [this.aiGeneratedDescription, this.descriptionFromOtherDataSources];

  editDescriptionLabel = $localize`:@@aitta_editDescription:Muokkaa kuvausta`;

  originalDescriptionLabel = $localize`:@@originalDescriptionLabel:Alkuperäinen kuvaus`;
  editDescriptionLabelEn = $localize`:@@aitta_editDescriptionEn:Muokkaa enlganninkielistä kuvausta`;
  editDescriptionLabelSv = $localize`:@@aitta_editDescriptionSv:Muokkaa ruotsinkielistä kuvausta`;

  selectDescriptionLanguageTitle = $localize`:@@selectDescriptionLanguageTitle:Valitse kuvauksen kieli`;
  languageFi = $localize`:@@languageFI:Suomi`;
  languageSv = $localize`:@@languageSv:Ruotsi`;
  languageEn = $localize`:@@languageSv:Englanti`;

  generatingDescriptionInfoText = $localize`:@@generatingDescriptionInfoText:Luodaan kuvausta. Tämä voi viedä pari minuuttia`;
  generatingLanguageVersionsInfoText = $localize`:@@generatingLanguageVersionsInfoText:Luodaan kieliversioita. Tämä voi viedä pari minuuttia`;


  generateDescriptionButtonText = $localize`:@@generateDescriptionButton:Luo kuvaus`;
  generateNewDescriptionButtonText = $localize`:@@generateNewDescriptionButtonText:Luo uusi kuvaus`;
  generateAndCreateLocalizationsButtonText = $localize`:@@generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`;
  reviewAndCreateLanguageVersionsButtonText = $localize`:@@reviewAndCreateLanguageVersionsButtonText:Tarkista ja luo kieliversiot`;
  selectLanguageVersionsText = $localize`:@@selectLanguageVersionsText:Valitse kieliversiot`;
  useLocalizationButtonText = $localize`:@@useLocalizationButtonText:Käytä kuvausta`;
  closeToBackgroundButtonText = $localize`:@@closeToBackgroundButtonText:Sulje taustalle`;

  notAllLanguageVersionsSelectedTitle = $localize`:@@notAllLanguageVersionsSelectedTitle:Kaikkia kieliversioita ei ole valittu näytettäväksi`;
  researchDescriptionGenerationDone = $localize`:@@researchDescriptionGenerationDone:Tutkimustoiminnan kuvauksen luonti valmistui`;
  languageVersionsGenerationDone = $localize`:@@languageVersionsGenerationDone:Kieliversioiden luonti valmistui`;

  languageVersionsInstructionBoxText = $localize`:@@languageVersionsInstructionBoxText:Tutkimustoiminnan kuvaus kannattaa kirjoittaa englanniksi, suomeksi ja ruotsiksi, jotta se saavuttaa mahdollisimman laajan yleisön.`;

  researchDescriptionSavedToDraft = $localize`:@@researchDescriptionSavedToDraft:Tutkimustoiminnan kuvaus on tallennettu profiililuonnokseesi.`;


  cancelButtonText = $localize`:@@cancel:Peruuta`;

  keywordsText = $localize`:@@keywords:Avainsanat`;

  aiGeneratedTextMayContainErrors = $localize`:@@aiGeneratedTextMayContainErrors:Tekoälyn luoma teksti voi sisältää asiavirheitä. Muistathan tarkastaa tekstin.`;
  languageVersionInfo = $localize`:@@languageVersionInfo:Kieliversiot kielillä Ruotsi ja Englanti voidaan luoda automaaattisesti tarkastamasi suomenkielisen kuvauksen pohjalta.`;

  importLanguageVersionsToProfile = $localize`:@@importLanguageVersionsToProfile:Tuo kieliversiot profiiliisi`;

  descriptionLanguages = [this.languageFi, this.languageSv, this.languageEn];


  dialogActions1 = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@useLocalizationButtonText:Käytä kuvausta`, primary: true, method: 'save' }
  ];

  dialogActionsCreateDescription = [
    {
      label: $localize`:@@cancel:Peruuta`,
      primary: false,
      method: 'cancel',
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

  dialogActionsCreateNewDescriptionAi = [
    {
      label: $localize`:@@generateNewDescriptionButtonText:Luo uusi kuvaus`,
      tertiary: true,
      method: 'generateNewBiography'
    },
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`,
      primary: true,
      method: 'saveAndGenerateLanguageVersions'
    }
  ];

  dialogActionsAddDescriptionNotAi = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@useLocalizationButtonText:Käytä kuvausta`,
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
      label: $localize`:@@generateAndCreateLocalizationsButtonText:Käytä ja luo kieliversiot`,
      primary: true,
      method: 'saveAndGenerateLanguageVersions',
      disabled: 'true'
    }
  ];

  useLanguageVerionEn = false;
  useLanguageVersionSv = false;

  dialogActionsSelectLanguageVersions = [
    { label: $localize`:@@cancel:Peruuta`, tertiary: true, method: 'cancel' },
    {
      label: $localize`:@@addLanguageVersions:Lisää kieliversiot`,
      primary: true,
      method: 'saveLanguageVersions',
      disabled: !this.useLanguageVerionEn && !this.useLanguageVersionSv
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

  useMockDataLabel = 'Use demo data';

  selectedNotAiBiographyIndex = -1;

  private currentBiography: Promise<Object>;

  languageCodes = ['fi', 'en', 'sv'];

  notAiBiographies = [];

  aiGeneratedBiographies = { fi: '', en: '', sv: '', itemMeta: undefined };

  currentlyVisibleBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  aiGeneratedBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });
  isBiographyAiGeneratedObs$ = new BehaviorSubject(false);

  userEditedBiographiesObs$ = new BehaviorSubject({ fi: '', en: '', sv: '', itemMeta: undefined });

  biographyGenerationOngoing$ = this.biographyService.biographyGenerationOngoing;
  translationsRequested$ = this.biographyService.translationsRequested;
  enTranslationOngoing$ = this.biographyService.enTranslationOngoing;
  svTranslationOngoing$ = this.biographyService.svTranslationOngoing;

  langVersionEnUsed$ = new BehaviorSubject(false);
  langVersionSvUsed$ = new BehaviorSubject(false);

  languageVersionEnChecked = false;
  languageVersionSvChecked = false;

  constructor(
    public biographyService: BiographyService,
    private patchService: PatchService,
    private snackbarService: SnackbarService
  ) {
  }

  ngOnInit(): void {
    this.dialogActions = [...this.dialogActions1];
    this.initBiographies();

    // Biography generation finished
    this.biographyGenerationOngoing$.subscribe(response => {
      if (response === false) {
        this.dialogActions = [...this.dialogActionsCreateNewDescriptionAi];
        this.contentCreationStep = 3;
      }
    });
  }


  openDialog(dialogName: string) {
    if (dialogName === 'selectLanguageVersions') {
      this.dialogActions = [...this.dialogActionsSelectLanguageVersions];
      this.contentCreationStep = 4;
      this.userEditedBiographiesObs$.next(this.aiGeneratedBiographies);
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
        if (item.dataSources[0].registeredDataSource === 'Tiedejatutkimus.fi') {
          this.aiGeneratedBiographies['fi'] = item?.researchDescriptionFi;
          this.aiGeneratedBiographies['en'] = item?.researchDescriptionEn;
          this.aiGeneratedBiographies['sv'] = item?.researchDescriptionSv;
          this.aiGeneratedBiographies['itemMeta'] = item?.itemMeta;
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
          this.dialogActions = [...this.dialogActionsCreateNewDescriptionAi];
          this.contentCreationStep = 3;
        }
      });
    }
  };

  generateAndPatchBiographyPayload() {
    this.notAiBiographies = [];
    this.translationsRequested$.next(false);
    // Take biography from old api
    if (this.data && this.data.id === 'researchDescription') {
      this.data?.items.forEach(item => {
        if (item.dataSources[0].registeredDataSource === 'Tiedejatutkimus.fi') {
          let patchItem = cloneDeep(item);
          // Show or hide ai generated
          patchItem.itemMeta.show = this.isBiographyAiGeneratedObs$.getValue();
          this.patchService.addToPayload(patchItem.itemMeta);
        } else {
          let patchItem = cloneDeep(item);
          // Show or hide not ai generated
          patchItem.itemMeta.show = !this.isBiographyAiGeneratedObs$.getValue();
          this.patchService.addToPayload(patchItem.itemMeta);
        }
      });

      // Patch keywords
      if (this.keywordsSelected || this.keywordsSelectedInDraft) {
        this.patchService.addToPayload(this.selectedKeywordsShowItemMetas);
      } else {
        this.patchService.addToPayload(this.selectedKeywordsHideItemMetas);
      }
      this.patchService.confirmPayload();
    }
    this.showDraftSaveSuccessNotification();
  }

  showDraftSaveSuccessNotification(): void {
    this.snackbarService.show(
      $localize`:@@draftUpdated:Luonnos päivitetty`,
      'success'
    );
  }

  saveLanguageVersions() {
    let patchBiographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
    let patchItemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;
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
    this.aiGeneratedBiographiesObs$.next(patchBiographyStub);
    this.currentlyVisibleBiographiesObs$.next(patchBiographyStub);

    // Add to payload
    this.generateAndPatchBiographyPayload();
    this.showDraftSaveSuccessNotification();
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
        this.dialogActions = [...this.dialogActionsCreateNewDescriptionAi];
        this.contentCreationStep = 3;
      }
    }
  }

  selectDescriptionLanguage(input: any) {
    console.log('selectDescriptionLanguage', input);
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
      biographyStub.itemMeta = this.aiGeneratedBiographies.itemMeta;
      this.aiGeneratedBiographies = biographyStub;
      this.aiGeneratedBiographiesObs$.next(biographyStub);
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

  saveAiGeneratedBiography() {
    this.biographyService.updateBiography(this.aiGeneratedBiographies);
    this.aiGeneratedBiographiesObs$.next(this.aiGeneratedBiographies);
    this.generateAndPatchBiographyPayload();
    this.currentlyVisibleBiographiesObs$.next(this.aiGeneratedBiographies);
    this.showDialog$.next(false);
    this.showDraftSaveSuccessNotification();
    //this.initBiographies();
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
        let valueToShow = this.aiGeneratedBiographiesObs$.getValue().itemMeta;
        valueToShow.show = true;
        sessionStorage.setItem(Constants.draftProfile, JSON.stringify(this.fullProfiledata));
        this.patchService.addToPayload(valueToShow);
        this.patchService.clearPayload();
      }
    });
    this.biographyService.svTranslationOngoing.subscribe(val => {
      if (val === false) {
        let biographyStub = { fi: '', en: '', sv: '', itemMeta: undefined };
        biographyStub.fi = this.userEditedBiographiesObs$.getValue().fi;
        biographyStub.en = this.userEditedBiographiesObs$.getValue().en;
        biographyStub.sv = this.biographyService.svTranslation.getValue();
        biographyStub.itemMeta = this.userEditedBiographiesObs$.getValue().itemMeta;
        this.aiGeneratedBiographiesObs$.next(biographyStub);

        // Add to payload
        let valueToShow = this.aiGeneratedBiographiesObs$.getValue().itemMeta;
        valueToShow.show = true;
        sessionStorage.setItem(Constants.draftProfile, JSON.stringify(this.fullProfiledata));
        this.patchService.addToPayload(valueToShow);
        this.patchService.clearPayload();
      }
    });
  }

  generateBiography() {
    this.contentCreationStep = 2;
    this.dialogActions = [...this.dialogActionsCreateDescription];
    this.biographyService.generateBiography(this.useMockData).then();
    this.biographyService.biographyGenerationOngoing.subscribe(biography => {
      const generatedBiographyFi = this.biographyService.generatedBiographyData.getValue();
      this.aiGeneratedBiographiesObs$.next({ fi: generatedBiographyFi, en: '', sv: '', itemMeta: undefined });
      this.contentCreationStep = 3;
    });
  }

  generateNewBiography() {
    this.biographyService.generateBiography(true).then(response => {

    });

    //this.dialogActions = [...this.dialogActions1];
    //is.contentCreationStep = 1;
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
        this.saveAiGeneratedBiography();
        this.generateTranslations(this.aiGeneratedBiographiesObs$.getValue().fi);
        this.isBiographyAiGeneratedObs$.next(true);
        this.keywordsSelectedInDraft = this.keywordsSelected;
        this.showDialog$.next(false);
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

      case 'cancel': {
        this.biographyService.biographyGenerationOngoing.next(false);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        break;
      }
      default: {
        this.biographyService.biographyGenerationOngoing.next(false);
        this.showDialog$.next(false);
        this.contentCreationStep = 1;
        break;
      }
    }
  }
}

