import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Pair } from 'src/app/interfaces/pair';
import { PairTransaction } from 'src/app/interfaces/pair-transaction';
import { Pool } from 'src/app/interfaces/pool';
import { Volumes } from 'src/app/interfaces/volumes';
import { ContractService } from 'src/app/services/contracts/contract.service';
import { TransactionService } from 'src/app/services/front-services/pairs/transaction.service';
import { ServiceService } from 'src/app/services/service.service';
import { PairTransactionsComponent } from '../pair-transactions/pair-transactions.component';

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
  pairs: Pair[] = [];
  pairTransaction: PairTransaction[];
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

  pools: Pool[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


  constructor(
    private contractService: ContractService,
    private service: ServiceService,
    private router: Router,
    private transactionService: TransactionService
  ) {
  }

  ngOnInit(): void {
    this.isWait = true;
    this.getPairData();
  }

  /**
   * Datos de tabla Pool
   */
  async getPairData(): Promise<any> {
    //this.pairs = await this.contractService.getPairList();
    this.service.getPairList().subscribe(async(res) => {
      await this.setDataVolumes(this.pairs);
      this.dataSource = new MatTableDataSource<Pair>(res.pairs);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isWait = false;
    });
  }

  /**
   * Filtro tabla pools
   */
  applyFilter(event: Event): any {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setPoolToPairPage(row: Pool): void {
    this.service.setPair(row);
    console.log(row.id);
    this.router.navigateByUrl('pages/pair/' + row.id);
  }

  async setDataVolumes(pairs: Pair[]): Promise<void> {
    const data: string[] = [];
    this.pairs.forEach(p => { data.push(p.pairAddress); });
    const volumes: Volumes[] = await this.transactionService.getVolumes(data);
    pairs.forEach(pair => {
      for (const volume of volumes) {
        if (volume.id.toLowerCase() === pair.pairAddress.toLowerCase()) {
          pair.volume24 = volume.volume24h;
          pair.volume24Percentaje = (volume.volume24h / volume.volumeTotal) * 100;
          pair.fees24 = pair.volume24 * 0.003;
          pair.volume7 = volume.volume7days;
        }
      }
    });
  }

}
