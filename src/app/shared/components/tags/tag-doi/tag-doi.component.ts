import { Component, Input, OnInit } from '@angular/core';
import { TrimLinkPrefixPipe } from '../../../pipes/trim-link-prefix.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-tag-doi',
    templateUrl: './tag-doi.component.html',
    styleUrls: ['./tag-doi.component.scss'],
    standalone: true,
    imports: [FontAwesomeModule, TrimLinkPrefixPipe],
})
export class TagDoiComponent implements OnInit {
  @Input() link: string;

  constructor() {}

  ngOnInit(): void {}
}
