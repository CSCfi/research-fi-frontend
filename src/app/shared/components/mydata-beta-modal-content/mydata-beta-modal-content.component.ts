//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mydata-beta-modal-content',
  templateUrl: './mydata-beta-modal-content.component.html',
})
export class MydataBetaModalContentComponent implements OnInit {
  constructor() {}

  myDataBetaTexts = [
    $localize`:@@personsResultsBetaText_1:Tutkijat-näkymä on beta-vaiheessa. Sekä profiilien sisältöä että hakumahdollisuuksia kehitetään jatkuvasti.`,
    $localize`:@@personsResultsBetaText_2:Suomessa toimiva tutkija tai asiantuntija voi luoda oman profiilin Tiedejatutkimus.fi-palveluun ORCID-tunnuksen avulla, minkä jälkeen profiili näkyy ja on haettavissa Tiedejatutkimus.fi-palvelun Tutkijat-osiossa.`,
    $localize`:@@personsResultsBetaText_3:Profiiliin liitetään kotiorganisaatioista ja ORCID-palvelusta siirrettyä tietoa sekä Tiedejatutkimus.fi:hin jo aiemmin siirrettyä tietoa.`,
    $localize`:@@personsResultsBetaText_4:Beta-vaiheessa kotiorganisaatioista siirrettyjen tietojen lisääminen omaan profiiliin on mahdollista vain muutaman organisaation tapauksessa.`,
    $localize`:@@personsResultsBetaText_5:Työkalun ja Tutkijat-näkymän ominaisuudet ja käytettävissä oleva tietosisältö täydentyvät vuoden 2023 aikana.`,
  ];

  ngOnInit(): void {}
}
