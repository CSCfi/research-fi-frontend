import { Component, input, OnInit, output } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-simple-pagination',
  imports: [
    NgClass,
    SvgSpritesComponent
  ],
  templateUrl: './simple-pagination.component.html',
  styleUrl: './simple-pagination.component.scss'
})
export class SimplePaginationComponent implements OnInit {
  public elementCount = input.required<number>({ alias: 'elementCount' });
  public pageSize = input.required<number>({ alias: 'pageSize' });

  public allPageNumbers = [];
  public visiblePageNumbers = [];
  public selectedPage = 1;

  selectedPageIndexEmit = output<number>();

  ngOnInit(): void {
    this.initContent();
  }

  initContent(){
    const numberOfPages = Math.ceil(this.elementCount() / this.pageSize());
    for (let i = 1; i < numberOfPages + 1; i++) {
      this.allPageNumbers.push(i);
    }

    //TODO: page numbers can go over 100
    this.visiblePageNumbers = [...this.allPageNumbers];
  }

  goToPage(num: number): void {
    this.selectedPage = num + 1;
    this.selectedPageIndexEmit.emit(this.selectedPage);
  }

  goToNextPage(): void {
    if (this.selectedPage < this.pageSize() - 1) {
      this.selectedPage += 1;
      this.selectedPageIndexEmit.emit(this.selectedPage);
    }
  }

  goToPrevPage(): void {
    if (this.selectedPage > 1) {
     this.selectedPage -= 1;
     this.selectedPageIndexEmit.emit(this.selectedPage);
    }
  }
}
