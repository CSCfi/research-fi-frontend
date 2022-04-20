import { Component, OnInit } from '@angular/core';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-close-button',
  templateUrl: './close-button.component.html',
  styleUrls: ['../buttons-shared.scss'],
})
export class CloseButtonComponent implements OnInit {
  faWindowClose = faWindowClose;

  constructor() {}

  ngOnInit(): void {}
}
