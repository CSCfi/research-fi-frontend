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


  public generatedBiographyData = new BehaviorSubject<any>('');
  public generatedBiographyDataSv = new BehaviorSubject<any>('');
  public generatedBiographyDataEn = new BehaviorSubject<any>('');

  public biographyGenerationOngoing = new BehaviorSubject<boolean | undefined>(undefined);
  public translationsRequested = new BehaviorSubject<boolean>(false);
  public clearDataRequested = new BehaviorSubject<boolean>(false);
  public updateDataRequested = new BehaviorSubject<boolean>(false);

  public biographyGenerationError = new BehaviorSubject<any>(undefined);


  public visibleDraftBiographies$ = new BehaviorSubject<any>({ fi: '', en: '', sv: '', itemMeta: undefined });
  public generateBiographyRequested$ = new BehaviorSubject<boolean>(false);
  public biographyReadyDismissed$ = new BehaviorSubject(false);
  public dropdownLanguageSelection = 0;

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

  public updateData(){
    this.updateDataRequested.next(true);
  }

  public clearData(){
    this.clearDataRequested.next(true);
    this.translationsRequested.next(false);
    this.biographyGenerationOngoing.next(false);
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
