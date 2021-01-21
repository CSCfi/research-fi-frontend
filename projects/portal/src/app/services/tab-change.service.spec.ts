//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TabChangeService } from './tab-change.service';

describe('TabChangeService', () => {
  let tabChangeService: TabChangeService;
  const locale = 'fi';
  const mockTab = {
    data: '',
    label: '',
    link: 'publications',
    icon: '',
    singular: '',
  };

  beforeEach(() => {
    tabChangeService = new TabChangeService(locale);
  });

  it('should be created', () => {
    expect(tabChangeService).toBeTruthy();
  });

  it('tab should be updated', () => {
    // Initially undefined
    expect(tabChangeService.tab).toBe(undefined);
    tabChangeService.changeTab(mockTab);
    // Updated after changeTab()
    expect(tabChangeService.tab).toBe('publications');
  });

  it('#currentTab should be updated as observable', (done: DoneFn) => {
    // Initially empty
    const initialSub = tabChangeService.currentTab.subscribe((tab) => {
      expect(tab.link).toBe('');
    });
    initialSub.unsubscribe();
    tabChangeService.changeTab(mockTab);
    // Updated after changeTab()
    tabChangeService.currentTab.subscribe((tab) => {
      expect(tab.link).toBe('publications');
      done();
    });
  });
});
