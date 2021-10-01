import {Component, OnInit, ViewChild} from '@angular/core';
import {Bamboo} from 'src/app/interfaces/bamboo';
import {Pool} from 'src/app/interfaces/pool';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {MatTableDataSource} from '@angular/material/table';
import {ServiceService} from 'src/app/services/service.service';
import {MatDialog} from '@angular/material/dialog';
import {OwnWallet} from 'src/app/interfaces/own-wallet';
import {TokenData} from 'src/app/interfaces/contracts';

export interface Telegram {
  name: string;
  link: string;
}

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({
          height: '0px',
          minHeight: '0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class InformationComponent implements OnInit {
  pool: Pool;
  pools: Pool[];
  bamboo: Bamboo;
  ownWallet: OwnWallet;

  bambooData: TokenData;

  dataSource;
  displayedColumns: string[] = [
    'title',
    'stake',
    'underlying',
    'value',
    'yield',
    'roi'
  ];

  @ViewChild(MatPaginator, {
    static: true,
  })
  paginator: MatPaginator;
  @ViewChild(MatSort, {
    static: true,
  })
  sort: MatSort;

  feeds: JSON;

  linkTwitter: string;
  twits;

  faqNumber = 16;
  faqs = [];

  message = 'Connect to Wallet';

  // Telegram List
  telegram: Telegram [] = [
    {name: 'Official', link: 'https://t.me/BambooDeFi'},
    {name: 'Africa', link: 'https://t.me/BambooDeFiAFRICA'},
    // {name: 'Arabic', link: 'https://t.me/BamboodefiAr'},
    {name: 'Azerbaijan', link: 'https://t.me/BambooDeFi_Azerbaijan'},
    // {name: 'Bangladesh', link: 'https://t.me/BambooDeFi_bd'},
    // {name: 'Brazil', link: 'https://t.me/BambooDefiBRAZIL'},
   // {name: 'China', link: 'https://t.me/BambooDeFi_China'},
    {name: 'Dutch', link: 'https://t.me/BambooDeFiDutch'},
    {name: 'France', link: 'https://t.me/BambooDeFiFrance'},
    {name: 'Georgia', link: 'https://t.me/BambooDeFi_Georgia'},
    {name: 'Germany', link: 'https://t.me/BambooDeFiGermany'},
    // {name: 'Iceland', link: 'https://t.me/BambooDefiicel'},
    // {name: 'India', link: 'https://t.me/BambooDefi_India'},
    {name: 'Indonesia', link: 'https://t.me/BambooDeFi_indonesia'},
    {name: 'Iran', link: 'https://t.me/BambooPersian'},
    // {name: 'Italy', link: 'https://t.me/BambooDeFiItaly'},
    // {name: 'Japan', link: 'https://t.me/BambooDefiJp'},
    // {name: 'Korea', link: 'https://t.me/bambookorea'},
    {name: 'Latino America', link: 'https://t.me/BambooDeFiLATAM'},
    {name: 'Norway', link: 'https://t.me/BambooDeFi_Norway'},
    {name: 'Pakistan', link: 'https://t.me/bamboodefipakistan'},
    // {name: 'Philippines', link: 'https://t.me/bamboodefiphilippines'},
    // {name: 'Polish', link: 'https://t.me/BambooDeFi_Polish'},
     {name: 'Romanian', link: 'https://t.me/BambooDefi_Romanian'},
    // {name: 'Russia', link: 'https://t.me/bamboodefirussian'},
    // {name: 'Sweden', link: 'https://t.me/bamboodefisweden'},
    // {name: 'Thailand', link: 'https://t.me/BambooDeFi_Thailand'},
    // {name: 'Turkish', link: 'https://t.me/bamboodefiturkish'},
    {name: 'Ukraine', link: 'https://t.me/BambooDeFi_Ukraine'},
    {name: 'Vietnam', link: 'https://t.me/BambooDeFiVN'},
  ];

  constructor(
    private service: ServiceService,
    public dialog: MatDialog,
  ) {
    this.linkTwitter = 'https://twitter.com/FiBamboo?ref_src=twsrc%5Etfw';
  }


  ngOnInit(): void {
    this.bamboo = {
      valor: 0.00,
      porcentaje: 0.00,
      liquidity: 0o0,
      porcentajeLiquidity: 0.00,
      fees: 0o0,
    };

    this.pools = [];

    this.ownWallet = {
      unstaked: 0,
      staked: 0,
      toHarvest: 0,
      bambooField: 0,
      totalBamboo: 0
    };

    for (let index = 1; index < this.faqNumber; index++) {
      const element = {title: 'faq' + index, response: 'faqr' + index};
      this.faqs.push(element);
    }
    this.getMediumFeed();
  }

  /**
   * Datos de tabla Pool
   */
  getPoolData(data): any {
    this.dataSource = new MatTableDataSource<Pool>(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Filtro tabla pools
   */
  applyFilter(event: Event): any {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Medium feed by service
   */
  getMediumFeed(): void {
    this.service.getMediumFeed()
      .subscribe(arg => {
        this.feeds = arg.items;
      });
  }
}
