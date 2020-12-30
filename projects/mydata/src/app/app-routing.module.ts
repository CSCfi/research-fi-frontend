import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'introduction',
    pathMatch: 'full',
    component: IntroductionComponent,
  },
  {
    path: 'welcome',
    pathMatch: 'full',
    component: WelcomeStepperComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
