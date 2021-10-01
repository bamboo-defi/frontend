import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Langtranslate } from 'src/app/interfaces/langtranslate';
import { Telegram } from '../information/information.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-menulinks',
  templateUrl: './menulinks.component.html',
  styleUrls: ['./menulinks.component.scss']
})
export class MenulinksComponent implements OnInit {

  @ViewChild(MatMenuTrigger) telemenu: MatMenuTrigger;
  locationPage: string;

    // Language selector
    languages = new FormControl();
    languagesList: Langtranslate[] = [
      { languageSet: 'en', languageName: 'English' },
      { languageSet: 'es', languageName: 'Español' },
      { languageSet: 'ko', languageName: '한국어' },
      { languageSet: 'zh', languageName: '漢語' },
      { languageSet: 'tl', languageName: 'Tagalo' },
      { languageSet: 'vi', languageName: 'tiếng Việt' },
      { languageSet: 'jp', languageName: '日本語' },
      { languageSet: 'ar', languageName: 'اَلْعَرَبِيَّةُ' }
    ];

  // Telegram List
  telegram: Telegram [] = [
    {name: 'Official', link: 'https://t.me/BambooDeFi'},
    {name: 'Africa', link: 'https://t.me/BambooDeFiAFRICA'},
    {name: 'Azerbaijan', link: 'https://t.me/BambooDeFi_Azerbaijan'},
    {name: 'Dutch', link: 'https://t.me/BambooDeFiDutch'},
    {name: 'France', link: 'https://t.me/BambooDeFiFrance'},
    {name: 'Georgia', link: 'https://t.me/BambooDeFi_Georgia'},
    {name: 'Germany', link: 'https://t.me/BambooDeFiGermany'},
    {name: 'Indonesia', link: 'https://t.me/BambooDeFi_indonesia'},
    {name: 'Iran', link: 'https://t.me/BambooPersian'},
    {name: 'Latino America', link: 'https://t.me/BambooDeFiLATAM'},
    {name: 'Norway', link: 'https://t.me/BambooDeFi_Norway'},
    {name: 'Pakistan', link: 'https://t.me/bamboodefipakistan'},
     {name: 'Romanian', link: 'https://t.me/BambooDefi_Romanian'},
    {name: 'Ukraine', link: 'https://t.me/BambooDeFi_Ukraine'},
    {name: 'Vietnam', link: 'https://t.me/BambooDeFiVN'},
  ];

  constructor(
    private translate: TranslateService,
    private location: Location,
    private router: Router,

  ) {
    this.locationPage = this.location.path();

   }

  ngOnInit(): void {
  }

    // Change language by click
    useLanguage(language: string): any {
      const local = this.location.path();
      this.translate.use(language);
      localStorage.setItem('language', language);
      this.router.navigateByUrl('/pages', { skipLocationChange: true }).then(() => {
        this.router.navigate([local]);
      });
    }


    // Open telegram list
    openTelegram(): void{
      this.telemenu.openMenu();
    }

    // Close telegram menu
    closeTelemenu(): void{
      this.telemenu.closeMenu();
    }


}
