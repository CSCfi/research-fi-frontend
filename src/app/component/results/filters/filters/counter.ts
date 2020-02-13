export class Counter {
    private value = 0;
    reset() {
      this.value = 0;
    }
    inc(): number {
      return this.value++;
    }
  }
  