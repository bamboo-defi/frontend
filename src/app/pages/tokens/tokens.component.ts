import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Tokensupport } from 'src/app/interfaces/tokensupport';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.scss'],
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
export class TokensComponent implements OnInit {
  isWait = false;

  token: Tokensupport;
  tokens: JSON;
    // Table colums
    dataSource;
    displayedColumns: string[] = [
      'name',
      'symbol',
      'liquidity',
      'volume',
      'price',
      'pricechange'
    ];

    redirect: string;
    tokenUrl: '/tokenvalue';
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {
      static: true,
    })
    sort: MatSort;

  constructor(
    private service: ServiceService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isWait = true;

    // Get token list from service
    this.service.getTokensMarket().subscribe(
      res => {
        this.tokens = res;
        this.getPoolData(this.tokens);
      });
    this.isWait = false;
  }

  // Datos de tabla Tokens
  getPoolData(tokens): void {
    this.dataSource = new MatTableDataSource<Tokensupport>(tokens);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Filtro tabla tokens
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
    }
  }

}
