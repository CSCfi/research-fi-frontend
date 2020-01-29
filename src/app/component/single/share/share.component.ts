import { Component, OnInit } from '@angular/core';
import { faTwitter, faFacebook, faLinkedin, faMendeley } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faLinkedin = faLinkedin;
  faMendeley = faMendeley;

  constructor() { }

  ngOnInit() {
  }

}
