//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ServiceDeploymentComponent } from './components/service-deployment/service-deployment.component';
import { CancelDeploymentComponent } from './components/service-deployment/cancel-deployment/cancel-deployment.component';
import { RedirectComponent } from './components/redirect/redirect.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DataSourcesComponent } from './components/profile/data-sources/data-sources.component';
import { AuthGuard } from './services/auth-guard.service';
import { PageResolverService } from '@shared/resolvers/page-resolver.service';
import { OrcidProfileResolverService } from './resolvers/orcid-profile-resolver.service';
import { MyDataProfileResolverService } from './resolvers/mydata-profile-resolver.service';
import { MyDataTerms } from './components/mydata-terms/mydata-terms.component';
import { AccountSettingsComponent } from '@mydata/components/account-settings/account-settings.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'service-deployment',
    pathMatch: 'full',
    component: ServiceDeploymentComponent,
    canActivate: [AuthGuard],
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'cancel-deployment',
    pathMatch: 'full',
    component: CancelDeploymentComponent,
  },
  {
    path: 'profile',
    pathMatch: 'full',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    resolve: {
      pages: PageResolverService,
      orcidProfile: OrcidProfileResolverService,
      myDataProfile: MyDataProfileResolverService,
    },
  },
  {
    path: 'data-sources',
    pathMatch: 'full',
    component: DataSourcesComponent,
    canActivate: [AuthGuard],
    resolve: {
      orcidProfile: OrcidProfileResolverService,
      myDataProfile: MyDataProfileResolverService,
    },
  },
  {
    path: 'account-settings',
    pathMatch: 'full',
    component: AccountSettingsComponent,
    canActivate: [AuthGuard],
    resolve: {
      orcidProfile: OrcidProfileResolverService,
      myDataProfile: MyDataProfileResolverService,
    },
  },
  {
    path: 'privacy',
    pathMatch: 'full',
    component: MyDataTerms,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'terms',
    pathMatch: 'full',
    component: MyDataTerms,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'redirect',
    pathMatch: 'full',
    component: RedirectComponent,
  },
  {
    path: '**',
    redirectTo: 'mydata',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyDataRoutingModule {}
