import { Component} from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';

import { AppSettingsService} from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-searchbar-backdrop',
  standalone: true,
  imports: [
    NgStyle,
    NgIf
  ],
  templateUrl: './searchbar-backdrop.component.html',
  styleUrl: './searchbar-backdrop.component.scss'
})
export class SearchbarBackdropComponent {
  isOverlayVisible: boolean;
  overlayTopMargin: string;
  overlayBrowserHeight: number;

  backdropStateSub: Subscription;
  backdropHeight: Subscription;
  backdropTopMargin: Subscription;

  constructor(
    private appSettingsService: AppSettingsService,
  ) {
    console.log('backdrop init');
    this.backdropStateSub = this.appSettingsService.searchbarBackdropVisible.subscribe(
      (status) => {
        this.isOverlayVisible = status;
        console.log('backdropStateSub', this.isOverlayVisible);
      }
    );
    this.backdropHeight = this.appSettingsService.searchbarBackdropHeight.subscribe(
      (height) => {
        this.overlayBrowserHeight = height;
        console.log('backdropHeight', this.isOverlayVisible);
      }
    );
    this.backdropTopMargin = this.appSettingsService.searchbarBackdropTopMargin.subscribe(
      (margin) => {
        this.overlayTopMargin = margin.toString();
        console.log('backdropTopMargin', this.overlayTopMargin);
      }
    );
  }

  hideOverlay() {
    this.isOverlayVisible = false;
    console.log('click received');
  }

  ngOnDestroy() {
    if (this.backdropStateSub) {
      this.backdropStateSub.unsubscribe();
    }
  }
}
