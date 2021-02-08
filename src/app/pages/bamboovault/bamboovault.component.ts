import {Component, OnInit} from '@angular/core';
import {Vault} from 'src/app/interfaces/vault';
import { BbypService } from 'src/app/services/contracts/bbyp/bbyp.service';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {environment} from 'src/environments/environment';

const SHOW_DECIMALS = 4;

@Component({
  selector: 'app-bamboovault',
  templateUrl: './bamboovault.component.html',
  styleUrls: ['./bamboovault.component.scss']
})
export class BamboovaultComponent implements OnInit {
  isWait = false;

  charityLink = 'http://www.pandahome.org/e/ensearch/index.php?keyboard=bamboodefi';
  vault: Vault = {
    feesActual: 0,
    fees24: 0,
    charityActual: 0,
    charityTotal: 0,
    burnedTotal: 0,
    developersTotal: 0,
    balance: 0,
    totalBBYP: 0,
  };

  bambooVaultWallet = environment.bambooVaultWallet;

  constructor(private tokenService: TokenService, private bbypService: BbypService) {
  }

  ngOnInit(): void {
    this.vaultData();
  }

  /**
   * Get Vault data
   */
  async vaultData(): Promise<void> {
    const wallet = await this.tokenService.getBAMBOOData(this.bambooVaultWallet);
    this.vault.balance = Number(wallet.balance.toFixed(SHOW_DECIMALS));
    this.vault.developersTotal = Number((this.vault.balance * 0.85).toFixed(SHOW_DECIMALS));
    this.vault.charityTotal = Number((this.vault.balance * 0.05).toFixed(SHOW_DECIMALS));
    this.vault.totalBBYP = Number((await this.bbypService.getPrizePool()).toFixed(SHOW_DECIMALS));
  }

}
