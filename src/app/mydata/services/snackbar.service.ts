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
      this.snackbar.open(message, 'sulje', {
        panelClass: ['snackbar-container', type],
      });
    });
  }
}
