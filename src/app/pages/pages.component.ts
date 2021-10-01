import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Menu } from '../interfaces/menu';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ConnectionService } from '../services/contract-connection/connection.service';
import { environment } from 'src/environments/environment';
declare let window: any;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnDestroy, OnInit {

  public message = 'Connect to Wallet';

  // Network mainnet
  network = environment.net;
  net = environment.net;
  locationPage: string;

  // Link to pages
  linkToPages: Menu[] = [
    { link: 'home', text: 'Bamboo Home', image: 'home.png' },
    { link: 'information', text: 'Information', image: 'information.png' },
    { link: 'wallet', text: 'Wallet', image: 'wallet.png' },
    { link: 'bridge', text: 'Bridge', image: 'bridge.png' },
    { link: 'farms', text: 'Farms', image: 'pandalogofarming.png' },
    { link: 'pools', text: 'Pools', image: 'pools.png' },
    { link: 'raindrop', text: 'Raindrop', image: 'raindrops.png' },
    { link: 'bamboofield', text: 'Bamboo Field', image: 'bamboos.png' },
    { link: 'tokens', text: 'Tokens', image: 'tokens.png' },
    // { link: 'pairs', text: 'Pairs', image: 'pairs.png' },
    { link: 'lending', text: 'Lending', image: 'lend.png' },
    // { link: 'pair-create', text: 'Create Pair', image: 'pairs.png' },
    { link: 'governance', text: 'Governance', image: 'governance.png' },
    // { link: 'wrapped', text: 'Wrapped Coins', image: 'wrapped.png' },
    { link: 'bamboovault', text: 'Bamboo Vault', image: 'vault.png' },
    { link: 'about', text: 'About', image: 'about.png' },
    { link: 'docs', text: 'Docs', image: 'docs.png' },
    // { link: 'branding', text: 'Branding', image: 'branding.png' }
  ];

  // Image Link para icono del menú
  imageLink: string;
  assetsLink = '../../assets/';
  titlePage = 'Bamboo Home';

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
    const sliptolerance = String(2);
    const transDeadLine = String(60);
    localStorage.setItem('slippage', sliptolerance);
    localStorage.setItem('transDeadLine', transDeadLine);
    this.locationPage = this.location.path();
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.subscribeConnection();
  }

  // Select image an page title
  setImage(img: string, tex: string, link: string): any {
    this.imageLink = img;
    this.titlePage = tex;
    this.locationPage = link;
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
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          if (local === '/pages/home') {
            this.router.navigate(['/pages']);
          } else {
            this.router.navigate([local]);
          }
          localStorage.setItem('connected', 'connected');
        });
      }
    });
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.message = 'Connect to Wallet';
        localStorage.setItem('connected', 'disconnected');
      }
    });
    window.ethereum.on('chainChanged', async (chain) => {
      const rpc = this.connectionService.getRPCByHexChainId(chain);
      if (!await this.connectionService.checkRPC(rpc.chainId)) {
        window.location.reload();
      }
    });
  }

  // Open dialog disclaimer
  openDisclaimer(): void {
    const dialogRef = this.disclaimer.open(DialogContent);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  setBamboo(): any {
    console.log('metamask');
    this.connectionService.setBambooMetamask();
  }

  goToTokpie(url): void{
    window.open(url, '_blank');
  }

}

// Disclaimer component
@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.html',
})
export class DialogContent { }
