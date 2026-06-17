import { Component, Input } from '@angular/core';
import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

export interface InfraContact {
  name: string;
  email: string;
  telephone: string;
  address: string;
}

export interface InfraLink {
  name: string;
  url: string;
}

export interface InfraService {
  serviceName?: string;
  serviceDescription?: string;
  servicePid?: string;
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
  contacts?: InfraContact[];
  infraLinks?: InfraLink[];
}

@Component({
  selector: 'app-infra-accordion',
  imports: [
    AccordionContent,
    AccordionGroup,
    AccordionPanel,
    AccordionTrigger,
    SvgSpritesComponent
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


