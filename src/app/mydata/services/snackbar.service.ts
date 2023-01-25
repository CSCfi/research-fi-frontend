import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Just add the new required types here and TypeScript will require the public consumer to pass a valid type
export type SnackBarType = 'error' | 'success' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackbar: MatSnackBar, private zone: NgZone) {}

  show(message: string, type: SnackBarType): void {
    this.zone.run(() => {
      this.snackbar.open(message, $localize`:@@close:Sulje`, {
        panelClass: ['snackbar-container', type],
      });
    });
  }

  showPatchMessage(type: 'success' | 'error') {
    if (type === 'success') {
      this.show(
        $localize`:@@profilePublishedToast:Profiili julkaistu. Tiedot näkyvät muutaman minuutin kuluttua tiedejatutkimus.fi -palvelussa.`,
        'success'
      );
    } else {
      this.show(
        $localize`:@@dataSavingError:Virhe tiedon tallennuksessa`,
        'error'
      );
    }
  }

  showHideProfileMessage(type: 'success' | 'error') {
    if (type === 'success') {
      this.show(
        $localize`:@@profileHiddenToast:Profiilin piilottaminen onnistui. Profiilisi piilotetaan Tiedejatutkimus.fi -palvelusta muutaman minuutin kuluttua.`,
        'success'
      );
    } else {
      this.show(
        $localize`:@@dataSavingError:Virhe tiedon tallennuksessa`,
        'error'
      );
    }
  }
}
