import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit {

  language: string;
  languageAudit: string;

  constructor() {
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('language');

    if (this.language === 'en') {
      this.languageAudit = 'en';
    } else if (this.language === 'es') {
      this.languageAudit = 'es';
    } else {
      this.languageAudit = 'en';
    }
  }
}
