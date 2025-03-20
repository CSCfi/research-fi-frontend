import { Component, Input, OnInit } from '@angular/core';
import { TrimLinkPrefixPipe } from '../../../pipes/trim-link-prefix.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-tag-doi',
    templateUrl: './tag-doi.component.html',
    styleUrls: ['./tag-doi.component.scss'],
    standalone: true,
  imports: [FontAwesomeModule, TrimLinkPrefixPipe, MatIcon, NgIf]
})
export class TagDoiComponent implements OnInit {
  @Input() linkDoi: string;
  @Input() linkUrn: string;

  constructor() {}

  ngOnInit(): void {}
}
