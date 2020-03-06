// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppConfigService } from '../../services/app-config-service.service';
import { faTwitter, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  buildInfo = '';
  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;

  constructor(private appConfigService: AppConfigService) {
    this.buildInfo = this.appConfigService.buildInfo;
  }

  ngOnInit() {
  }

}
