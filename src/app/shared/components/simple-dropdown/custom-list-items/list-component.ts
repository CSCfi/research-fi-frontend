import { AfterContentInit, Component, ContentChildren, HostListener, QueryList } from '@angular/core';
import { ActiveDescendantKeyManager, FocusKeyManager } from '@angular/cdk/a11y';
import { ListItemComponent } from '@portal/components/search-bar/list-item/list-item.component';
import { ListKeyManager } from '@angular/cdk/a11y';

@Component({
  selector: 'my-list',
  host: { role: 'list' },
  template: '<ng-content></ng-content>',
})
export class ListComponent implements AfterContentInit {

  @HostListener('keydown', ['$event'])
  onKeydown(event) {
    this.keyManager.onKeydown(event);
  }

  // 1. Query all child elements
  @ContentChildren(ListItemComponent) items: QueryList<ListItemComponent>;

  // FocusKeyManager instance
  private keyManager: ActiveDescendantKeyManager<ListItemComponent>;

  ngAfterContentInit() {

    // 2. Instantiate FocusKeyManager
    this.keyManager = new FocusKeyManager(this.items)

      // 3. Enabling wrapping
      .withWrap();
  }
}