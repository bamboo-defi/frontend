import { trigger, state, style, transition, animate } from '@angular/animations';
// import {SelectionModel} from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Pool } from 'src/app/interfaces/pool';
import { ConfirmComponent } from '../confirm/confirm.component';
import { DepositComponent } from '../deposit/deposit.component';
import { WithdrawComponent } from '../withdraw/withdraw.component';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { RouterService } from 'src/app/services/contracts/router/router.service';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import BigNumber from 'bignumber.js';
import { PairService } from 'src/app/services/contracts/pair/pair.service';
import { KeeperService } from 'src/app/services/contracts/keeper/keeper.service';
import { ContractService } from 'src/app/services/contracts/contract.service';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import { ServiceService } from 'src/app/services/service.service';
import { Router } from '@angular/router';
import { AlertService } from '../../_alert';
import { MatPaginator } from '@angular/material/paginator';
import { PandaSpinnerService } from '../pandaspinner/pandaspinner.service';
import { ConnectionService } from '../../services/contract-connection/connection.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { ApyComponent } from '../apy/apy.component';

const SHOW_DECIMALS = 5;

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.scss'],
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
export class PoolComponent implements OnInit {

  addresses;

  pool: Pool;
  pools: Pool[] = [];
  isWait = false;
  isActive = false;
  observer: Observable<any>;
  dataSource = new MatTableDataSource<Pool>();
  // selection;
  displayedColumns: string[] = [
    'title',
    'yield',
    // 'bamboovalue',
    'roi',
    'underlying',
    'balance',
    'earnings',
    'select'
  ];
  private paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public dialog: MatDialog,
    private keeperService: KeeperService,
    private tokenService: TokenService,
    private routerService: RouterService,
    private utilsService: UtilService,
    private pairService: PairService,
    private contractService: ContractService,
    private service: ServiceService,
    private router: Router,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    public connService: ConnectionService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    this.isWait = true;

    this.getPoolData();
    setInterval(async () => {
      if (this.connService.provider !== undefined) {
        this.pools.forEach(async pool => {
          pool.reward = Number((await this.keeperService.getPendingBAMBOO(pool.id)).toFixed(SHOW_DECIMALS));
        });
      }
    }, 30000);
  }

  /**
   * Pool table data
   */
  async getPoolData(): Promise<any> {
    this.pools = await this.contractService.getPoolList();
    console.log(this.pools);
    this.dataSource = new MatTableDataSource<Pool>(this.pools);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.selection = new SelectionModel<Pool>(false, []);
    this.isWait = false;
    if (this.connService.provider !== undefined) {
      this.pools = await this.contractService.getWeb3PoolList(this.pools);
      this.displayedColumns = [
        'title',
        'yield',
        // 'bamboovalue',
        'roi',
        'underlying',
        'balance',
        'earnings',
        'select'
      ];
    } else {
      this.displayedColumns = [
        'title',
        'yield',
        // 'bamboovalue',
        'roi',
        'underlying'
      ];
    }
  }

  /**
   * Refresh the token List chain info
   */
  async setPoolData(data: Pool, index: number): Promise<void> {
    try {
      // Get the pool data
      const poolData = await this.contractService.getPairDataFromAddr(data.address);
      this.pools[index].underlyingTokenFirstValue = Number(poolData.reserve0.toFixed(SHOW_DECIMALS));
      this.pools[index].underlyingTokenSecondValue = Number(poolData.reserve1.toFixed(SHOW_DECIMALS));
      // Get balance data
      const tokenData = await this.tokenService.getTokenData(data.address);
      this.pools[index].available = Number(tokenData.balance.toFixed(SHOW_DECIMALS));
      // Staked, earnings
      this.pools[index].staked = Number((await this.keeperService.getStakedLP(data.id, tokenData)).toFixed(SHOW_DECIMALS));
      this.pools[index].reward = Number((await this.keeperService.getPendingBAMBOO(data.id)).toFixed(SHOW_DECIMALS));
    } catch (error) {
    }
  }

  /**
   * Pool table filter
   */
  applyFilter(event: Event): any {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Approve Staking
   */
  async approvePool(row?: Pool): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      const tokenData = await this.tokenService.getTokenData(row.address);
      await this.contractService.validateAllowance(tokenData, this.addresses.zooKeeper_address, new BigNumber(0));
      row.isActive = true;
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  /**
   * If pool is active add slp
   */
  depositPool(row?: Pool): void {
    const dialogRef = this.dialog.open(DepositComponent, {
      width: '450px',
      data: {
        row
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.pandaSpinnerService.open();
        try {
          const receipt = await this.keeperService.depositLP(row.id, result.amount, result.tokenData);
          this.alertService.success('Success');
          await this.setPoolData(row, Number(row.id));
        } catch (error) {
          this.alertService.error('Error: ' + error.message);
        } finally {
          this.pandaSpinnerService.close();
          this.getPoolData();
        }
      }
    },
      error => {
        this.alertService.error('Error: ' + error.message);
      });
  }

  /**
   * Claim pool rewards
   */
  claimReward(row?: Pool): void {
    const name = 'claim';
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '450px',
      data: {
        row,
        name
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.claimBambooReward(row);
        this.getPoolData();
      }
    });
  }

  /**
   * If pool is active withdraw slp
   */
  withdrawPool(row?: Pool): void {
    const dialogRef = this.dialog.open(WithdrawComponent, {
      width: '450px',
      data: {
        row
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.pandaSpinnerService.open();
        try {
          const receipt = await this.keeperService.withdrawLP(row.id, result.amount, result.tokenData);
          this.alertService.success('Success');
          await this.setPoolData(row, Number(row.id));
        // await this.setPoolData(row, Number(row.id));
        // this.getPoolData();
        } catch (error) {
          this.alertService.error('Error: ' + error.message);
        } finally {
          this.pandaSpinnerService.close();
          this.getPoolData();
        }
      }
    });
  }

  /**
   * On confirm, claim bamboo reward on that pool
   */
  async claimBambooReward(row: Pool): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      const tokenData = await this.tokenService.getTokenData(row.address);
      const receipt = await this.keeperService.depositLP(row.id, new BigNumber(0), tokenData);
      await this.setPoolData(row, Number(row.id));
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  refreshPools(): void {
    this.dataSource = new MatTableDataSource<Pool>();
    this.getPoolData();
  }

  setPoolToPairPage(row: Pool): void {
    this.service.setPair(row);
    this.router.navigateByUrl('pages/pair/' + row.address + '/' + row.addressTokenFirst + '/' + row.addressTokenSecond);
  }

  /**
   * Set the filter active to pool.isActive true
   */
  isActiveRow(filterValue: string): any {
    if (!this.isActive){
      const poolActive = [];
      this.dataSource.data.forEach(pool => {
        if (pool.staked !== 0){
          poolActive.push(pool);
        }
      });
      console.log(poolActive);
      this.dataSource = new MatTableDataSource<Pool>(poolActive);
      return;
      /* In case that filter equals isActive*/
      // this.dataSource.filterPredicate = (data: Pool, filter: string) => {
      //   return data.isActive.toString() === filter;
       } else {
    this.dataSource = new MatTableDataSource<Pool>(this.pools);
    return;
    }
  }

  /**
   * Get dialog to show ROI
   */
   apydialog(poolApy): void{
    console.log('apy');
    const apyData = poolApy;
    const dialogRef = this.dialog.open(ApyComponent, {
      data: apyData,
      width: '320px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('exit');
    });
  }
}
