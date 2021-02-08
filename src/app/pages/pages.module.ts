import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { AboutComponent } from './about/about.component';
import { DocsComponent } from './docs/docs.component';
import { ApproveProposition, DenyProposition, GovernanceComponent, SetProposition } from './governance/governance.component';
import { HomeComponent } from './home/home.component';
import { InformationComponent } from './information/information.component';
import { PairsComponent } from './pairs/pairs.component';
import { PoolComponent } from './pool/pool.component';
import { RaindropComponent } from './raindrop/raindrop.component';
import { TokensComponent } from './tokens/tokens.component';
import { WalletComponent } from './wallet/wallet.component';
import { PagesRoutingModule } from './pages-routing.module';
import { DialogAddWalletComponent } from './pages.component';
import { FormsModule } from '@angular/forms';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { BamboovaultComponent } from './bamboovault/bamboovault.component';
import { TokenvalueComponent } from './tokenvalue/tokenvalue.component';
import { LiquidityMinusComponent } from './wallet/liquidity-minus/liquidity-minus.component';
import { LiquidityPlusComponent } from './wallet/liquidity-plus/liquidity-plus.component';
import { ToStakeComponent } from './wallet/to-stake/to-stake.component';
import { SelectToken, ToTradeComponent } from './wallet/to-trade/to-trade.component';
import { PairComponent } from './pair/pair.component';

// Charts
import { ChartsModule } from 'ng2-charts';

// Material components
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { PairTransactionsComponent } from './pair-transactions/pair-transactions.component';
import { BamboofieldComponent } from './bamboofield/bamboofield.component';
import { AddSeedsComponent } from './add-seeds/add-seeds.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { SettingsComponent } from './settings/settings.component';
import { HarvestComponent } from './harvest/harvest.component';
import { LendingComponent } from './lending/lending.component';
import { PandaspinnerComponent } from './pandaspinner/pandaspinner.component';
import { SumaryComponent } from './sumary/sumary.component';
import { BalanceComponent } from './balance/balance.component';
import {GlobalMarketComponent} from './global-market/global-market.component';
import {AlertModule} from '../_alert';

const materialModules = [
  MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatGridListModule,
  MatIconModule,
  MatTabsModule,
  MatTableModule,
  MatFormFieldModule,
  MatPaginatorModule,
  MatInputModule,
  MatButtonModule,
  MatDialogModule,
  MatSelectModule,
  MatSliderModule,
  MatChipsModule,
  MatExpansionModule,
  MatTooltipModule,
  MatProgressBarModule,
];

// ATTENTION!!! required for AOT compilation
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    PagesComponent,
    AboutComponent,
    DocsComponent,
    GovernanceComponent,
    HomeComponent,
    InformationComponent,
    PairsComponent,
    PoolComponent,
    RaindropComponent,
    TokensComponent,
    WalletComponent,
    DialogAddWalletComponent,
    BamboovaultComponent,
    TokenvalueComponent,
    LiquidityMinusComponent,
    LiquidityPlusComponent,
    ToStakeComponent,
    ToTradeComponent,
    SelectToken,
    SetProposition,
    ApproveProposition,
    DenyProposition,
    PairComponent,
    PairTransactionsComponent,
    BamboofieldComponent,
    AddSeedsComponent,
    ConfirmComponent,
    DepositComponent,
    WithdrawComponent,
    SettingsComponent,
    HarvestComponent,
    LendingComponent,
    PandaspinnerComponent,
    SumaryComponent,
    BalanceComponent,
    GlobalMarketComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,
    ChartsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    materialModules,
    AlertModule
  ],
  exports: [RouterModule, materialModules],
  entryComponents: [
    SelectToken,
    SetProposition,
    ApproveProposition,
    DenyProposition,
    AddSeedsComponent,
  ],
})
export class PagesModule { }
