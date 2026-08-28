//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

export const HttpErrors = {
  400: $localize`HTTP pyyntöä ei voitu käsitellä`,
  401: $localize`Pyyntö vaatii sen käsittelyyn oikeutetut tunnukset`,
  403: $localize`Ei oikeutta käsitellä pyyntöä`,
  404: $localize`Haluttua tietoa ei ole olemassa`,
  405: $localize`:@@forbiddenRequest:Pyyntömetodi ei ole sallittu`,
  500: $localize`Palvelinvirhe. Palvelimella tapahtui virhe pyyntöä käsitellessä`,
  504: $localize`Palvelinvirhe. Pyyntö aikakatkaistiin`,
  default: $localize`HTTP pyyntöä ei voitu käsitellä`,
};

export const CapitalizedLocales = ['Fi', 'Sv', 'En'];
