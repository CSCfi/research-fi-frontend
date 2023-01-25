//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

type Tag = 'doi' | 'open-access' | 'peer-reviewed';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TagComponent implements OnInit {
  @Input() tag: Tag;

  constructor() {}

  ngOnInit(): void {}
}
