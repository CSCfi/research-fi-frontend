import { Injectable } from '@angular/core';

export class Publication {
  constructor(
    public julkaisunTunnus: string,
    public julkaisunNimi: string,
    public tekijat: string,
    public julkaisuvuosi: string
  ) {}
}

@Injectable({
    providedIn: 'root'
})
export class PublicationAdapter{

  adapt(item: any): Publication {
    return new Publication(
      item.julkaisunTunnus,
      item.julkaisunNimi,
      item.tekijat,
      item.julkaisuvuosi,
    );
  }
}
