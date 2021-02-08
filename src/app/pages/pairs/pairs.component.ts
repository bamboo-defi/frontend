import {trigger, state, style, transition, animate} from '@angular/animations';
import {SelectionModel} from '@angular/cdk/collections';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Pair} from 'src/app/interfaces/pair';

@Component({
  selector: 'app-pairs',
  templateUrl: './pairs.component.html',
  styleUrls: ['./pairs.component.scss'],
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
export class PairsComponent implements OnInit {
  isWait = false;

  pair: Pair;
  pairs = [{
    id: 'idPool2',
    logoTokenFirst: 'https://raw.githubusercontent.com/bamboo-defi/frontend/main/src/assets/bamboo-head.png',
    logoTokenSecond: 'https://raw.githubusercontent.com/grupokindynos/kindynos-branding/master/polis/polis-isotype-background-round.png',
    pairTokenNameFirst: 'TOK',
    pairTokenNameSecond: 'TOK2',
    addressTokenFirst: '0x86f725b1a47e6003c19d6675fea0156625d07d61',
    addressTokenSecond: '0x1377d26E4f427739c0498E748f747f8063Bd675b',
    pairAddress: '0xF10E6e664E5aE4b8b7d3FD81655d0bcAebB32fF4',
    liquidity: 0.0,
    liquidityPercentaje: 0.0,
    volume24: 0.0,
    volume24Percentaje: 0.0,
    volume7: 0.0,
    volume7Percentaje: 0.0,
    fees24: 0.0,
    fees24Percentaje: 0.0,
    feesYear: 0.0,
    feesYearPercentaje: 0.0,
    pairFirstEqualSecond: 0.0,
    pairSecondEqualFirst: 0.0,
    ammountFirst: 0.0,
    ammountSecond: 0.0,
  }, {
    id: 'idPool3',
    logoTokenFirst: 'https://raw.githubusercontent.com/bamboo-defi/frontend/main/src/assets/bamboo-head.png',
    logoTokenSecond: 'https://raw.githubusercontent.com/grupokindynos/kindynos-branding/master/polis/polis-isotype-background-round.png',
    pairTokenNameFirst: 'TOK2',
    pairTokenNameSecond: 'TOK3',
    addressTokenFirst: '0x1377d26E4f427739c0498E748f747f8063Bd675b',
    addressTokenSecond: '0x86c3be09eba0f1a674cdd5c7b4ca75ba7028325a',
    pairAddress: '0xe264945e0EB8e061fAf981d3C82765efd9073B1D',
    liquidity: 0.0,
    liquidityPercentaje: 0.0,
    volume24: 0.0,
    volume24Percentaje: 0.0,
    volume7: 0.0,
    volume7Percentaje: 0.0,
    fees24: 0.0,
    fees24Percentaje: 0.0,
    feesYear: 0.0,
    feesYearPercentaje: 0.0,
    pairFirstEqualSecond: 0.0,
    pairSecondEqualFirst: 0.0,
    ammountFirst: 0.0,
    ammountSecond: 0.0,
  }, {
    id: 'idPool3',
    logoTokenFirst: 'https://raw.githubusercontent.com/bamboo-defi/frontend/main/src/assets/bamboo-head.png',
    logoTokenSecond: 'https://raw.githubusercontent.com/grupokindynos/kindynos-branding/master/polis/polis-isotype-background-round.png',
    pairTokenNameFirst: 'TOK2',
    pairTokenNameSecond: 'WETH',
    addressTokenFirst: '0x1377d26E4f427739c0498E748f747f8063Bd675b',
    addressTokenSecond: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    pairAddress: '0x31a225127BaD9054cC9f353ab24a20B3B22F9f6B',
    liquidity: 0.0,
    liquidityPercentaje: 0.0,
    volume24: 0.0,
    volume24Percentaje: 0.0,
    volume7: 0.0,
    volume7Percentaje: 0.0,
    fees24: 0.0,
    fees24Percentaje: 0.0,
    feesYear: 0.0,
    feesYearPercentaje: 0.0,
    pairFirstEqualSecond: 0.0,
    pairSecondEqualFirst: 0.0,
    ammountFirst: 0.0,
    ammountSecond: 0.0,
  }];

  // Table colums
  dataSource;
  selection;
  displayedColumns: string[] = [
    'title',
    'liquidity',
    'volume24',
    'volume7',
    'fees24',
    'yearFees',
  ];

  @ViewChild(MatSort, {static: true})
  sort: MatSort;

  constructor() {
  }

  ngOnInit(): void {
    this.isWait = true;
    this.getPairData(this.pairs);
  }

  /**
   * Datos de tabla Pool
   */
  getPairData(data): any {
    this.dataSource = new MatTableDataSource<Pair>(data);
    this.dataSource.sort = this.sort;
    this.selection = new SelectionModel<Pair>(false, []);
    this.isWait = false;
  }

  /**
   * Filtro tabla pools
   */
  applyFilter(event: Event): any {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
