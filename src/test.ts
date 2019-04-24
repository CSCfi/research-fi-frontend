// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

///////

<div class="col" *ngFor="let publication of responseData">
<!-- {{publication?.hits?.hits | json}} -->
<div *ngFor="let x of publication?.hits?.hits">
    <!-- <li>{{x._source | json}}</li> -->
    <div *ngFor="let y of x._source | keyvalue">
        <!-- <li>{{y | json}}</li> -->
        <li>{{y.key}}:{{y.value | json}}</li>
    </div>
</div>

<!-- <div class="card" style="margin:5px;">
    <div class="card-body">
        <h5 class="card-title">{{ publication.publicationName }}</h5>
        <p class="card-text">Tunnus: {{ publication.publicationId }}</p>
    </div>
</div> -->
</div>