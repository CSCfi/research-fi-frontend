import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-svg-sprites',
    imports: [],
    template: `
    <svg class="svg-icon {{cssClass}}" style="display:none">
      <use attr.xlink:href="assets/img/icons/SVG-icons.svg#{{iconName}}"></use>
    </svg>
  `,
    styleUrls: ['./svg-sprites.component.scss']
})
export class SvgSpritesComponent {
  @Input() iconName: string;
  @Input() cssClass: string;
}
// circle-plus-solid

