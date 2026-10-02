import { Component, Input, OnInit } from '@angular/core';
import { TrimLinkPrefixPipe } from '../../../pipes/trim-link-prefix.pipe';
import { MatIcon } from '@angular/material/icon';

import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-tag-weblink',
  templateUrl: './tag-weblink.component.html',
  imports: [
    SvgSpritesComponent,
    TrimLinkPrefixPipe
  ],
  styleUrls: ['./tag-weblink.component.scss']
})
export class TagWeblinkComponent implements OnInit {
  @Input() linkUrn: string;
  @Input() linkText: string;

  constructor() {}

  ngOnInit(): void {}

}
