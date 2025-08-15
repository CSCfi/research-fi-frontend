import { Component, Input } from '@angular/core';
import {
  ProfileEditorCardHeaderComponent
} from '@mydata/components/profile/cards/profile-editor-card-header/profile-editor-card-header.component';

@Component({
  selector: 'app-data-sources-info-card',
  standalone: true,
  imports: [
    ProfileEditorCardHeaderComponent
  ],
  templateUrl: './data-sources-info-card.component.html',
  styleUrl: './data-sources-info-card.component.scss'
})

export class DataSourcesInfoCardComponent {
  @Input() dataSources: string;
  dataSourcesCaption = $localize`:@@dataSources:Lähteet`;
}
