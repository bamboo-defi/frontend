import { Component, OnInit } from '@angular/core';
import { Vault } from 'src/app/interfaces/vault';
import {ServiceService} from '../../services/service.service';
import { environment } from 'src/environments/environment';

const SHOW_DECIMALS = 4;

@Component({
  selector: 'app-bamboovault',
  templateUrl: './bamboovault.component.html',
  styleUrls: ['./bamboovault.component.scss']
})
export class BamboovaultComponent implements OnInit {
  isWait = false;

  charityLink = 'http://www.pandahome.org/e/ensearch/index.php?keyboard=bamboodefi';
  vault: Vault;

  bambooVaultWallet = environment.bambooVaultWallet;

  constructor(
    private serviceService: ServiceService
  ) {
  }

  ngOnInit(): void {
    this.vaultData();
  }

  /**
   * Get Vault data
   */
  async vaultData(): Promise<void> {
    this.serviceService.getBambooVault().subscribe(
      async (res) => {
        this.vault = res.vault;
      }
    );
  }

}
