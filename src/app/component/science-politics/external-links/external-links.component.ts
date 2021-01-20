//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  LOCALE_ID,
  AfterViewInit,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TabChangeService } from "./../../../services/tab-change.service";

@Component({
  selector: "app-external-links",
  templateUrl: "./external-links.component.html",
  styleUrls: ["./external-links.component.scss"],
})
export class ExternalLinksComponent implements OnInit, AfterViewInit {
  @ViewChild("mainFocus") mainFocus: ElementRef;
  data = [
    {
      heading: "Tiedettä ja tutkimusta tukevia tai ohjaavia tahoja suomessa",
      items: [
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa. Testilinkin testisisältö, johon tulee jonkin verran tavaraa. Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa. Testilinkin testisisältö, johon tulee jonkin verran tavaraa. Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
      ],
    },
    {
      heading: "Tieteen ja tutkimuksen kansainvälisiä toimijoita",
      items: [
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
      ],
    },
    {
      heading: "AAAA",
      items: [
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa, Testilinkin testisisältö, johon tulee jonkin verran tavaraa, Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
        {
          label: "Testilinkki",
          content:
            "Testilinkin testisisältö, johon tulee jonkin verran tavaraa",
          url: "https://google.fi",
        },
      ],
    },
  ];

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private titleService: Title,
    private tabChangeService: TabChangeService
  ) {}

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
    // Set title
    switch (this.localeId) {
      case "fi": {
        this.setTitle(
          "Tieteestä ja tutkimuksesta muualla - Tiedejatutkimus.fi"
        );
        break;
      }
      case "en": {
        this.setTitle("Tieteestä ja tutkimuksesta muualla - Research.fi");
        break;
      }
      case "sv": {
        this.setTitle("Tieteestä ja tutkimuksesta muualla - Forskning.fi");
        break;
      }
    }

    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === "main-link") {
          console.log(this.mainFocus);
          this.mainFocus.nativeElement.focus();
        }
      }
    );
  }
}
