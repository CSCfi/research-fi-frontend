import { AfterContentInit, Component, ContentChildren, HostListener, QueryList } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/focus-key-manager.d';

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
  @ContentChildren(ListItem) items: QueryList<ListItem>;

  // FocusKeyManager instance
  private keyManager: FocusKeyManager<ListItem>;

  ngAfterContentInit() {

    // 2. Instantiate FocusKeyManager
    this.keyManager = new FocusKeyManager(this.items)

      // 3. Enabling wrapping
      .withWrap();
  }
}