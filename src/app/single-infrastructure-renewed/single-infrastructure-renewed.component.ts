import { Component } from '@angular/core';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-single-infrastructure-renewed',
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent, SvgSpritesComponent],
  templateUrl: './single-infrastructure-renewed.component.html',
  styleUrl: './single-infrastructure-renewed.component.scss',
})
export class SingleInfrastructureRenewedComponent {

}