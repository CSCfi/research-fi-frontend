import { Component, OnInit } from '@angular/core';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-close-button',
    templateUrl: './close-button.component.html',
    styleUrls: ['../buttons-shared.scss'],
    imports: [SvgSpritesComponent]
})
export class CloseButtonComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
