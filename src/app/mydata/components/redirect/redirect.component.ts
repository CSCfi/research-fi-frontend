//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-redirect',
    templateUrl: './redirect.component.html',
    standalone: true,
    imports: [MatProgressSpinner],
})
export class RedirectComponent {}
