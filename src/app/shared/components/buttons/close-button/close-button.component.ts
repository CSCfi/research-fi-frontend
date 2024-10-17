import { Component, OnInit } from '@angular/core';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-close-button',
    templateUrl: './close-button.component.html',
    styleUrls: ['../buttons-shared.scss'],
    standalone: true,
    imports: [FontAwesomeModule],
})
export class CloseButtonComponent implements OnInit {
  faWindowClose = faWindowClose;

  constructor() {}

  ngOnInit(): void {}
}
