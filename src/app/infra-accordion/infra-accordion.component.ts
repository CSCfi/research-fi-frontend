import { Component, Input } from '@angular/core';
import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { ShareComponent } from '@portal/components/single/share/share.component';
import { JsonPipe } from '@angular/common';

export interface InfraContact {
  contactLabel?: string;
  email?: string[];
  telephone?: string;
  address?: string;
}

export interface InfraLink {
  name: string;
  url: string;
}

export interface InfraDate {
  year?: number | undefined;
  month?: number | undefined;
  day?: number | undefined;
}

export interface InfraService {
  serviceName?: string;
  serviceDescription?: string;
  serviceType?: string;
  servicePid?: string;
  startDate?: InfraDate;
  endDate?: InfraDate;
  targetSegment?: string[];
  targetAudience?: string[];
  homepage?: string;
  infraLinks?: InfraLink[];
  privacyPolicy?: string;
  termsOfUse?: string;
  instructionsOfUse?: string;
  serviceObtain?:string
  contacts?: InfraContact[];
  isDiscontinued?: boolean;
}

@Component({
  selector: 'app-infra-accordion',
  imports: [
    AccordionContent,
    AccordionGroup,
    AccordionPanel,
    AccordionTrigger,
    SvgSpritesComponent,
    ShareComponent,
    JsonPipe
  ],
  templateUrl: './infra-accordion.component.html',
  styleUrl: './infra-accordion.component.scss',
})
export class InfraAccordionComponent {
  private _infraData: InfraService[];

  @Input({ required: false })
  set infraData(value: InfraService[]) {
    this._infraData = value;
    this.markDiscontinuedServices();
  }
  get infraData(): InfraService[] {
    return this._infraData;
  }

  /** Called whenever infraData input receives a value. */
  markDiscontinuedServices(): void {
    this._infraData.map((infraService: InfraService) => {
      if (this.isServiceDiscontinued(infraService)) {
        console.log('marked discontinued');
        infraService.isDiscontinued = true;
      }
    })
  }

  serviceDescriptionLocalization = $localize`:@@serviceDescription:Palvelun kuvaus`;
  pidIdentifierLocalization = $localize`:@@infra-service-identifier-pid:Tunniste (PID)`;
  serviceLocalization = $localize`:@@infra-service-action:Toiminta`;
  hasStartedLocalization = $localize`:@@has-started:Alkanut`;
  hasEndedLocalization = $localize`:@@has-ended:Päättynyt`;
  endsOnLocalization = $localize`:@@ends-on:Päätttyy`;
  linksLocalization = $localize`:@@links:Linkit`;
  dataProtectionLocalization = $localize`:@@privacyHeader:Tietosuoja`;
  termsOfUseLocalization = $localize`:@@termsForTool:Käyttöehdot`;
  instructionsOfUseLocalization = $localize`:@@instructionsOfUse:Käyttöohje`;
  webPageLocalization = $localize`:@@webPage:Verkkosivu`;
  targetSegmentLocalization = $localize`:@@infra-target-segment:Kohderyhmä`;
  targetAudienceLocalization = $localize`:@@infra-service-users:Käyttäjät`;
  serviceObtainLocalization = $localize`:@@infra-service-obtain-description:Kuvaus käyttöönotosta`;
  serviceContactInfoLocalization = $localize`:@@infra-service-contact-info:Yhteyshenkilö ja -tiedot`;
  serviceIsDiscontinuedHeading = $localize`:@@serviceIsDiscontinuedHeading:Palvelun toiminta on päättynyt.`;
  serviceIsDiscontinuedInfoText = $localize`:@@serviceIsDiscontinuedInfoText:Sisältöä ei enää päivitetä. Tiedot voivat olla vanhentuneita.`;

  currentDay = 0;
  currentMonth = 0;
  currentYear = 0;

  constructor() {
    this.infraData = [{serviceName: 'Infra1'}, {serviceName: 'Infra2'}];

    const currentDate = new Date();
    this.currentDay = currentDate.getDate();
    this.currentMonth = currentDate.getMonth() + 1;
    this.currentYear = currentDate.getFullYear();
  }

  /**
   * Returns true if the given date is before the current date.
   * Missing month or day is treated as the whole period, so the date counts
   * as past only when that year / month has fully passed.
   */
  isDateBeforePresent(date: InfraDate): boolean {
    if (!date?.year) {
      return false;
    }
    if (date.year !== this.currentYear) {
      return date.year < this.currentYear;
    }
    if (!date.month) {
      return false;
    }
    if (date.month !== this.currentMonth) {
      return date.month < this.currentMonth;
    }
    if (!date.day) {
      return false;
    }
    return date.day < this.currentDay;
  }

  isServiceDiscontinued(service: InfraService) {
    if (service.endDate) {
      return this.isDateBeforePresent(service.endDate);
    }
  }
}