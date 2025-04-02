import { Component, OnInit } from '@angular/core';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-close-button',
    templateUrl: './close-button.component.html',
    styleUrls: ['../buttons-shared.scss'],
    standalone: true,
  imports: [FontAwesomeModule, MatIcon, SvgSpritesComponent]
})
export class CloseButtonComponent implements OnInit {
  faWindowClose = faWindowClose;

  constructor() {}

  ngOnInit(): void {}
}
