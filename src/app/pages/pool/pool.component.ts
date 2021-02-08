import {trigger, state, style, transition, animate} from '@angular/animations';
import {SelectionModel} from '@angular/cdk/collections';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Pool} from 'src/app/interfaces/pool';
import {ConfirmComponent} from '../confirm/confirm.component';
import {DepositComponent} from '../deposit/deposit.component';
import {WithdrawComponent} from '../withdraw/withdraw.component';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {RouterService} from 'src/app/services/contracts/router/router.service';
import {UtilService} from 'src/app/services/contracts/utils/util.service';
import BigNumber from 'bignumber.js';
import {PairService} from 'src/app/services/contracts/pair/pair.service';
import {KeeperService} from 'src/app/services/contracts/keeper/keeper.service';
import {ContractService} from 'src/app/services/contracts/contract.service';
import {zooKeeper_address} from 'src/app/services/contract-connection/tools/addresses';
import {PandaspinnerComponent} from '../pandaspinner/pandaspinner.component';
import {ServiceService} from 'src/app/services/service.service';
import {Router} from '@angular/router';
import {AlertService} from '../../_alert';

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

  pool: Pool;
  pools: Pool[] = [];
  isWait = false;

  dataSource;
  selection;
  displayedColumns: string[] = [
    'title',
    'yield',
    'roi',
    'underlying',
    'balance',
    'earnings',
    'select'
  ];

  @ViewChild(MatSort, {static: true})
  sort: MatSort;

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
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.isWait = true;
    this.getPoolData();
  }

  /**
   * Pool table data
   */
  async getPoolData(): Promise<any> {
    this.isWait = true;
    this.pools = await this.contractService.getPoolList();
    this.dataSource = new MatTableDataSource<Pool>(this.pools);
    this.dataSource.sort = this.sort;
    this.selection = new SelectionModel<Pool>(false, []);
    this.isWait = false;
    const value = this.contractService.getBambooValueInUSDT();
  }

  /**
   * Refresh the token List chain info
   */
  async setPoolData(data: Pool, index: number): Promise<void> {
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
  }

  /**
   * Pool table filter
   */
  applyFilter(event: Event): any {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Approve Staking
   */
  async approvePool(row?: Pool): Promise<void> {
    const dialogPandaSpinner = this.getDialogPandaSpinner();
    try {
      const tokenData = await this.tokenService.getTokenData(row.address);
      await this.contractService.validateAllowance(tokenData, zooKeeper_address, new BigNumber(0));
      row.isActive = true;
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      dialogPandaSpinner.close();
      this.getPoolData();
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
        await this.setPoolData(row, Number(row.id));
      }
      this.getPoolData();
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
        await this.setPoolData(row, Number(row.id));
        this.getPoolData();
      }
    });
  }

  /**
   * On confirm, claim bamboo reward on that pool
   */
  async claimBambooReward(row: Pool): Promise<void> {
    const dialogPandaSpinner = this.getDialogPandaSpinner();
    try {
      const tokenData = await this.tokenService.getTokenData(row.address);
      const receipt = await this.keeperService.depositLP(row.id, new BigNumber(0), tokenData);
      await this.setPoolData(row, Number(row.id));
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      dialogPandaSpinner.close();
    }
  }

  refreshPools(): void {
    this.dataSource = null;
    this.getPoolData();
  }

  /**
   * PandaSpinner Dialog
   */
  private getDialogPandaSpinner(): any {
    return this.dialog.open(PandaspinnerComponent, {
      closeOnNavigation: false,
      disableClose: true,
      panelClass: 'panda-spinner'
    });
  }

  setPoolToPairPage(row: Pool): void {
    this.service.setPair(row);
    console.log(row.id);
    this.router.navigateByUrl('pages/pair/' + row.id);
  }

}
