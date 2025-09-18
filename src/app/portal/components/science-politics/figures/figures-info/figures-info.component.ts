import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { WINDOW } from 'src/app/shared/services/window.service';
import { NgIf, NgClass } from '@angular/common';
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-figures-info',
    templateUrl: './figures-info.component.html',
    styleUrls: ['./figures-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        ClickOutsideDirective,
        NgIf,
        NgClass,
        MatIcon,
        SvgSpritesComponent
    ]
})
export class FiguresInfoComponent implements OnInit, OnDestroy {
  @Input() labelText: string;
  @Input() content: any;
  @Input() position: string;
  showInfo = false;
  mobile = this.window.innerWidth < 992;
  height = this.window.innerHeight;
  width = this.window.innerWidth;
  resizeSub: any;

  constructor(
    @Inject(WINDOW) private window: Window,
    private resizeService: ResizeService
  ) {}

  ngOnInit(): void {
    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
  }

  onClickedOutside(event) {
    this.showInfo = false;
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (!this.position && this.width >= 992) {
      this.mobile = false;
    } else {
      this.mobile = true;
    }
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }
}
