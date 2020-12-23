import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  lang = 'fi';
  currentRoute = '/';
  navItems = [
    { label: 'Kirjaudu sisään', link: '/login'}
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
