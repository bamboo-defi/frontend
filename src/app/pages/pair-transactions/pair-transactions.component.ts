import {trigger, state, style, transition, animate} from '@angular/animations';
import {SelectionModel} from '@angular/cdk/collections';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {PairTransaction} from 'src/app/interfaces/pair-transaction';
import {ContractService} from '../../services/contracts/contract.service';

@Component({
  selector: 'app-pair-transactions',
  templateUrl: './pair-transactions.component.html',
  styleUrls: ['./pair-transactions.component.scss'],
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
export class PairTransactionsComponent implements OnInit {

  // pairTransaction = [{
  //   id: 'Id transaction',
  //   name: 'BAMBOO-POLIS',
  //   type: 'REMOVE',
  //   totalValue: 0.0,
  //   tokenName1: 'BAMBOO',
  //   tokenAmmount1: 0,
  //   tokenName2: 'POLIS',
  //   tokenAmmount2: 0,
  //   account: 'Account Example',
  //   timeStamp: 'Time Stamp'
  // }];

  dataSource;
  selection;
  displayedColumns: string[] = [
    'name',
    'totalValue',
    'tokenAmmount1',
    'tokenAmmount2',
    'account',
    'timeStamp',
  ];

  @Input() pairId;
  @Input() pairAddress;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true})
  sort: MatSort;
  pairTransaction: PairTransaction[];

  constructor(private contractService: ContractService) {
  }

  ngOnInit(): void {

    this.initData();
    console.log(this.pairAddress);
  }

  /**
   * Initializes data
   */
  async initData(): Promise<void> {
    if (!this.contractService.isConnection()) {
      return;
    }
    this.pairTransaction = await this.contractService.getPairTxList(this.pairAddress);
    console.log('transacciones ' , this.pairTransaction);
    this.getTransactionsData(this.pairTransaction);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Datos de tabla Pool
   */
  getTransactionsData(data): any {
    this.dataSource = new MatTableDataSource<PairTransaction>(data);
    this.dataSource.sort = this.sort;
    this.selection = new SelectionModel<PairTransaction>(false, []);
  }

  /**
   * Filtro tabla pools
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTransactions(data): void {
    this.dataSource.filter = data;
  }
}
