import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Langtranslate } from '../interfaces/langtranslate';
import { Menu } from '../interfaces/menu';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ConnectionService } from '../services/contract-connection/connection.service';


@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnDestroy, OnInit {

  public message = 'Connect to Wallet';

  // Link to pages
  linkToPages: Menu[] = [
    { link: 'home', text: 'Bamboo Home', image: 'home.png' },
    { link: 'information', text: 'Information', image: 'information.png' },
    { link: 'wallet', text: 'Wallet', image: 'wallet.png' },
    { link: 'pools', text: 'Liquidity Pools', image: 'pools.png' },
    { link: 'raindrop', text: 'Raindrop', image: 'raindrops.png' },
    { link: 'bamboofield', text: 'Bamboo Field', image: 'bamboos.png' },
    { link: 'tokens', text: 'Tokens', image: 'tokens.png' },
    // { link: 'pairs', text: 'Pairs', image: 'pairs.png' },
    { link: 'lending', text: 'Lending', image: 'lend.png' },
    { link: 'governance', text: 'Governance', image: 'governance.png' },
    { link: 'bamboovault', text: 'Bamboo Vault', image: 'vault.png' },
    { link: 'about', text: 'About', image: 'about.png' },
    { link: 'docs', text: 'Docs', image: 'docs.png' }
  ];

  // Image Link para icono del menú
  imageLink: string;
  assetsLink = '../../assets/';
  titlePage = 'Bamboo Home';

  // Language selector
  languages = new FormControl();
  languagesList: Langtranslate[] = [
    { languageSet: 'en', languageName: 'English' },
    { languageSet: 'es', languageName: 'Español' },
    { languageSet: 'ko', languageName: '한국어' },
    { languageSet: 'tl', languageName: 'Tagalo' },
    { languageSet: 'vi', languageName: 'tiếng Việt' },
    { languageSet: 'jp', languageName: '日本語' },
    { languageSet: 'ar', languageName: 'اَلْعَرَبِيَّةُ' }
  ];

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    public disclaimer: MatDialog,
    private router: Router,
    private location: Location,
    public connectionService: ConnectionService,
  ) {
    this.imageLink = 'governance.png';
    localStorage.setItem('language', 'en');
    const sliptolerance = String(1);
    const transDeadLine = String(60);
    localStorage.setItem('slippage', sliptolerance);
    localStorage.setItem('transDeadLine', transDeadLine);
  }

  ngOnDestroy(): void {
  }



  ngOnInit(): void {
    this.subscribeConnection();
  }

  // Select image an page title
  setImage(img, tex): any {
    this.imageLink = img;
    this.titlePage = tex;
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

  // Open Metamask or  TrustWallet
  openDialog(): any {
    this.connectionService.connectAccount();
  }
  // Verify Connection with your wallet
  subscribeConnection(): void {
    this.connectionService.accountStatus$.subscribe(res => {
      if (res) {
        this.message = 'Connected';
        const local = this.location.path();
        this.router.navigateByUrl('/pages', { skipLocationChange: true }).then(() => {
          this.router.navigate([local]);
          localStorage.setItem('connected', 'connected');
        });
        this.router.navigateByUrl('/pages/Home', { skipLocationChange: true }).then(() => {
          this.router.navigate([local]);
          localStorage.setItem('connected', 'connected');
        });
      }
    });
    window['ethereum'].on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.message = 'Connect to Wallet';
        localStorage.setItem('connected', 'disconnected');
      }
    });
  }

  // Open dialog disclaimer
  openDisclaimer(): void {
    const dialogRef = this.disclaimer.open(DialogContent);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}

// Dialog component for Metamask o TrustWallet
@Component({
  selector: 'app-addwallet',
  templateUrl: './addWallet.html',
  styleUrls: ['./pages.component.scss']
})
export class DialogAddWalletComponent {

  constructor(
    private connectionService: ConnectionService
  ) { }

  // Connect with MetaMask account
  async connectMetamask(): Promise<void> {
    await this.connectionService.connectAccount();
  }

  // Connect with Wallet
  connectWalletConnect(): void {
    window.alert('Connection is under construction');
  }

  // Connect with TrustWallet
  connectTrustWallet(): void {
    window.alert('Connection is under construction');
  }
}


// Disclaimer component
@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.html',
})
export class DialogContent { }

