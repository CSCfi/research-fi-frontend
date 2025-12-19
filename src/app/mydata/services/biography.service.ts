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
  httpOptions: any;

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
  public biographyGenerationOngoing = new BehaviorSubject<boolean | undefined>(undefined);
  public translationsRequested = new BehaviorSubject<boolean>(false);
  public enTranslationOngoing = new BehaviorSubject<boolean>(false);
  public svTranslationOngoing = new BehaviorSubject<boolean>(false);

  public enTranslation = new BehaviorSubject<string>('');
  public svTranslation = new BehaviorSubject<string>('');

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

  public async generateBiography(isMock: boolean): Promise<any> {
    const mockBiography = 'Tämä on demotarkoituksiin luotu tutkimustoiminnan kuvaus, joka sisältää tietoja affiliaatioista, tuotoksista, saavutuksista ja aktiviteeteista. Se kuvaa asiantuntijan uraa ja motivaatioita.';
    if (isMock) {
      this.biographyGenerationOngoing.next(true);
      setTimeout(() => {
        return new Promise((resolve, reject) => {
          this.biographyGenerationOngoing.next(false);
          this.generatedBiographyData.next(mockBiography);
          resolve(mockBiography);
        });
      }, 3000);
    } else {
      await this.updateToken();
      this.biographyGenerationOngoing.next(true);
      return lastValueFrom(this.http.get(this.apiUrl + '/biography/generate', this.httpOptions)).then(result => {
        this.biographyGenerationOngoing.next(false);
        this.generatedBiographyData.next(result);
      });
    }
  }

  public async generateTranslationEn(textToTranslate: string, isMock: boolean): Promise<any> {
    const enTranslationMock = 'This is a demo-generated description of research activities that includes information about affiliations, outputs, achievements, and activities. It describes the career and motivations of an expert.';

    if (isMock) {
      this.enTranslationOngoing.next(true);
      setTimeout(() => {
        return new Promise((resolve) => {
          this.enTranslation.next(enTranslationMock);
          this.enTranslationOngoing.next(false);
          resolve(enTranslationMock);
        });
      }, 3000);
    } else {
      await this.updateToken();
      this.enTranslationOngoing.next(true);

      const body = { textToTranslate: textToTranslate, targetLanguage: 'en' };

      return lastValueFrom(this.http.post(this.apiUrl + '/biography/translate/', body, this.httpOptions)).then(result => {
        this.enTranslation.next(result + '');
        this.enTranslationOngoing.next(false);
      });
    }
  }

  public async generateTranslationSv(textToTranslate: string, isMock: boolean): Promise<any> {
    const svTranslationMock = 'Detta är en beskrivning av forskningsverksamhet skapad för demoändamål som innehåller information om affiliationer, resultat, prestationer och aktiviteter. Den beskriver expertens karriär och motivatio';

    if (isMock) {
      this.svTranslationOngoing.next(true);
      setTimeout(() => {
        return new Promise((resolve) => {
          this.svTranslation.next(svTranslationMock);
          this.svTranslationOngoing.next(false);
          resolve(svTranslationMock);
        });
      }, 3500);
    } else {
      await this.updateToken();
      this.enTranslationOngoing.next(true);

      const body = { textToTranslate: textToTranslate, targetLanguage: 'sv' };

      return lastValueFrom(this.http.post(this.apiUrl + '/biography/translate/', body, this.httpOptions)).then(result => {
        this.svTranslation.next(result + '');
        this.svTranslationOngoing.next(false);
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
