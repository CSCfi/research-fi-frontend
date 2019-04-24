import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { TypeaheadModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import {
  MatIconModule, MatInputModule,
  MatAutocompleteModule, MatChipsModule,
  MatFormFieldModule
} from '@angular/material';

import { UiModule } from './ui/ui.module';
import { HomePageComponent } from './component/home-page/home-page.component';
import { SearchBarComponent } from './component/search-bar/search-bar.component';
import { ResultsComponent } from './component/results/results.component';
import { PublicationsComponent } from './component/publications/publications.component';

import { SearchService } from './services/search.service';
import { ResultsService } from './services/results.service';
import { ResultsHttpService } from './services/results-http.service';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestResultsComponent } from './component/test-results/test-results.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    SearchBarComponent,
    ResultsComponent,
    PublicationsComponent,
    TestResultsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    UiModule,
    TypeaheadModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule, MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatRadioModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  providers: [ SearchService, ResultsService, ResultsHttpService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
