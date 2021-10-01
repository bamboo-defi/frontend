import { trigger, state, style, transition, animate } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PairTransaction } from 'src/app/interfaces/pair-transaction';
import { ContractService } from '../../services/contracts/contract.service';
import { environment } from 'src/environments/environment';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';

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

  link = environment.linkNetwork;
  logoNetwork = environment.tokenNetwork;
  dataSource: MatTableDataSource<PairTransaction>;
  dataWallet: MatTableDataSource<PairTransaction>;
  selection;
  displayedColumns: string[] = [
    'name',
    // 'totalValue',
    'tokenAmmount1',
    'sign',
    'tokenAmmount2',
    'account',
    'timeStamp',
  ];

  displayedWalletColumns: string[] = [
    'name',
    // 'totalValue',
    'tokenAmmount1',
    'sign',
    'tokenAmmount2',
    'timeStamp',
    'account'
  ];

  buys: number;
  sells: number;
  totalBuys: number;
  totalSells: number;

  @Input() pairId;
  @Input() pairAddress;
  @Input() token1;
  @Input() token2;
  @Input() tokenLogo1;
  @Input() tokenLogo2;

  private sort: MatSort;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) set matSort(mp: MatSort){
    this.sort = mp;
    this.dataSource.sort = this.sort;
  }
  pairTransaction: PairTransaction[];
  expandedClient: PairTransaction | null;
  constructor(private contractService: ContractService,
    ) {
  }

  ngOnInit(): void {
    this.sort = new MatSort();
    this.dataSource = new MatTableDataSource<PairTransaction>();
    this.dataWallet = new MatTableDataSource<PairTransaction>();
    this.initData();
  }

  /**
   * Initializes data
   */
  async initData(): Promise<void> {
    this.pairTransaction = await this.contractService.getPairTxAddressDBList(this.pairAddress);
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

  getFromInformation(wallet, token1, tokenName1, type): void{
    this.sells = 0;
    this.buys = 0;
    this.totalSells = 0;
    this.totalBuys = 0;

    console.log('wallet', wallet);

    this.pairTransaction.forEach(element => {
      if (element.from === wallet && element.type === 'SWAP' && element.tokenName1 === token1){
        console.log('elementsell', element.tokenAmmount1, '/', element.type);
        this.sells++;
        this.totalSells += element.tokenAmmount1;
      }
      if (element.from === wallet && element.type === 'SWAP' && element.tokenName1 !== token1){
        console.log('elementbuy', element.tokenAmmount2);
        this.buys++;
        this.totalBuys += element.tokenAmmount2;
      }
    });
    console.log(this.buys + '-' + this.totalBuys + '/' + this.sells + '-' + this.totalSells);

    // Nueva tabla transacciones
    this.dataWallet = new MatTableDataSource<PairTransaction>(this.pairTransaction);
    const filterWallet = wallet;
    this.dataWallet.filter = filterWallet.trim().toLowerCase();
    console.log('datawallet', this.dataWallet);
  }

}
