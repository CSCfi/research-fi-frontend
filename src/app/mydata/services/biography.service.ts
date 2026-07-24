import { Injectable, OnDestroy } from '@angular/core';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ProfileAdapter } from '@mydata/models/profile.model';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BiographyService implements OnDestroy {
  apiUrl: string;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService
  ) {
    this.apiUrl = this.appConfigService.profileApiUrl;
    this.updateToken();
  }

  private unsubscribe = new Subject<void>();


  public generatedBiographyData = new BehaviorSubject<any>(undefined);
  public generatedBiographyDataSv = new BehaviorSubject<any>(undefined);
  public generatedBiographyDataEn = new BehaviorSubject<any>(undefined);

  public biographyGenerationOngoing = new BehaviorSubject<boolean | undefined>(undefined);
  public translationsRequested = new BehaviorSubject<boolean>(false);
  public biographyGenerationOngoingEn = new BehaviorSubject<boolean | undefined>(undefined);
  public biographyGenerationOngoingSv = new BehaviorSubject<boolean | undefined>(undefined);
  public clearDataRequested = new BehaviorSubject<boolean>(false);

  public biographyGenerationError = new BehaviorSubject<any>(undefined);


  /*  setErrorMessage(errorMessage: string) {
      this.errorHandlerService.updateError({
        message: errorMessage,
      });
    }*/

  async updateToken(): Promise<any> {
    await firstValueFrom(this.oidcSecurityService.getAccessToken()).then((token) => {
      if (!token) {
        /*        return this.setErrorMessage(
                  'Autentikointiavain ei saatavilla. Pyyntö estetty.'
                );*/
      }
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        })
      };
    });
  }

  tokenToHttpOptions(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    };
  }

  public deleteBiography() {
    return new Promise((resolve, reject) => {
      this.deleteBiographyHttp()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: (result) => {
            resolve(true);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }

  public clearData(){
    this.clearDataRequested.next(true);
    this.translationsRequested.next(false);
    this.biographyGenerationOngoing.next(false);
    this.biographyGenerationOngoingEn.next(false);
    this.biographyGenerationOngoingSv.next(false);
    this.generatedBiographyData.next('');
    this.generatedBiographyDataEn.next('')
    this.generatedBiographyDataSv.next('');
  }

  public artificialDelayResolve(time, val) {
    return new Promise(resolve => setTimeout(resolve, time, val));
  }

  public async generateBiography(isMock: boolean, langLowerCase: string): Promise<any> {
    const mockBiography = 'Tämä on demotarkoituksiin luotu tutkimustoiminnan kuvaus, joka sisältää tietoja affiliaatioista, tuotoksista, saavutuksista ja aktiviteeteista. Se kuvaa asiantuntijan uraa ja motivaatioita.';
    if (isMock) {
      this.biographyGenerationOngoing.next(true);
      return this.artificialDelayResolve(3000, mockBiography).then(() => {
        this.generatedBiographyData.next(mockBiography);
        this.biographyGenerationOngoing.next(false);
      });
    } else {
      await this.updateToken();
      if (langLowerCase === 'fi') {
        this.biographyGenerationOngoing.next(true);
      } else if (langLowerCase === 'en') {
        this.biographyGenerationOngoing.next(true);
      } else if (langLowerCase === 'sv') {
        this.biographyGenerationOngoing.next(true);
      }

      try {
        await lastValueFrom(this.http.get(this.apiUrl + '/biography/generate/' + langLowerCase, this.httpOptions)).then(async (result: any) => {
          if (langLowerCase === 'fi') {
            this.generatedBiographyData.next(result?.contentText);
            this.biographyGenerationOngoing.next(false);
          } else if (langLowerCase === 'en') {
            this.generatedBiographyDataEn.next(result?.contentText);
            this.biographyGenerationOngoing.next(false);
          } else if (langLowerCase === 'sv') {
            this.generatedBiographyDataSv.next(result?.contentText);
            this.biographyGenerationOngoing.next(false);
          }
        });

      } catch (err) {
        this.biographyGenerationError.next(err);
        this.biographyGenerationError.next(undefined);
      }
    }
  }

  public async generateTranslationEn(textToTranslate: string, isMock: boolean): Promise<any> {
    const enTranslationMock = 'This is a demo-generated description of research activities that includes information about affiliations, outputs, achievements, and activities. It describes the career and motivations of an expert.';

    if (isMock) {
      this.biographyGenerationOngoingEn.next(true);
      return this.artificialDelayResolve(3000, enTranslationMock).then(() => {
        this.generatedBiographyDataEn.next(enTranslationMock);
        this.biographyGenerationOngoingEn.next(false);
      });

    }
    else {
      await this.updateToken();
      this.biographyGenerationOngoingEn.next(true);

      const body = { textToTranslate: textToTranslate, targetLanguage: 'en' };

      return lastValueFrom(this.http.post(this.apiUrl + '/biography/translate/', body, this.httpOptions)).then(result => {
        this.generatedBiographyDataEn.next(result + '');
        this.biographyGenerationOngoingEn.next(false);
      });
    }
  }

  public async generateTranslationSv(textToTranslate: string, isMock: boolean): Promise<any> {
    const svTranslationMock = 'Detta är en beskrivning av forskningsverksamhet skapad för demoändamål som innehåller information om affiliationer, resultat, prestationer och aktiviteter. Den beskriver expertens karriär och motivatio';

    if (isMock) {
      this.biographyGenerationOngoingSv.next(true);
      return this.artificialDelayResolve(3000, svTranslationMock).then(() => {
        this.generatedBiographyDataSv.next(svTranslationMock);
        this.biographyGenerationOngoingSv.next(false);
      });
    } else {
      await this.updateToken();
      this.biographyGenerationOngoingSv.next(true);

      const body = { textToTranslate: textToTranslate, targetLanguage: 'sv' };

      return lastValueFrom(this.http.post(this.apiUrl + '/biography/translate/', body, this.httpOptions)).then(result => {
        this.generatedBiographyDataSv.next(result + '');
        this.biographyGenerationOngoingSv.next(false);
      });
    }
  }

  public async getBiographyHttp(): Promise<any> {
    await this.updateToken();
    return lastValueFrom(this.http.get(this.apiUrl + '/biography/', this.httpOptions)).then(result => {
    });
  }

  public isBiographyGenerationOngoing(): boolean {
    return this.biographyGenerationOngoing.getValue();
  }

  public async updateBiography(biographyData: any) {
    await this.updateToken();
    const body = biographyData;
    return await firstValueFrom(this.http.post(this.apiUrl + '/biography/', body, this.httpOptions));
  }

  public deleteBiographyHttp() {
    return this.oidcSecurityService.getAccessToken().pipe(map(this.tokenToHttpOptions), switchMap((options) => {
      return this.http.delete(this.apiUrl + '/biography/');
    }));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
