//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

export class Counter {
  private value = 0;
  reset() {
    this.value = 0;
  }
  inc(): number {
    return this.value++;
  }
}
