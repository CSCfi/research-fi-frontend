//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from "@angular/core";

@Component({
  selector: "app-divider.",
  templateUrl: "./divider.component.html",
  styleUrls: ["./divider.component.scss"],
})
export class DividerComponent {
  @Input() headingText: string;

  constructor() {}
}
