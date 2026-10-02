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
  @Input({ required: false }) infraData: InfraService[];

  constructor() {
    this.infraData = [{serviceName: 'Infra1'}, {serviceName: 'Infra2'}];
  }
}


