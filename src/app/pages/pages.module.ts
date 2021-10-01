import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { AboutComponent } from './about/about.component';
import { DocsComponent } from './docs/docs.component';
import { GovernanceComponent } from './governance/governance.component';
import { HomeComponent } from './home/home.component';
import { InformationComponent } from './information/information.component';
import { PairsComponent } from './pairs/pairs.component';
import { PoolComponent } from './pool/pool.component';
import { RaindropComponent } from './raindrop/raindrop.component';
import { TokensComponent } from './tokens/tokens.component';
import { WalletComponent } from './wallet/wallet.component';
import { PagesRoutingModule } from './pages-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

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
import { MatSortModule } from '@angular/material/sort';
import {MatMenuModule} from '@angular/material/menu';
import {MatStepperModule} from '@angular/material/stepper';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


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
import { GuideComponent } from './guide/guide.component';
import { PandaSpinnerService } from './pandaspinner/pandaspinner.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { BrandingComponent } from './branding/branding.component';
import { WrappedComponent } from './wrapped/wrapped.component';
import { BridgeComponent } from './bridge/bridge.component';
import { PairCreateComponent } from './pair-create/pair-create.component';
import { SelectTokenComponent } from './pair-create/select-token/select-token.component';
import { CountdownTimerComponent } from '../util-components/countdown-timer/countdown-timer.component';
import { StakingComponent } from './staking/staking.component';
import { StakedComponent } from './staking/staked/staked.component';
import { ApyComponent } from './apy/apy.component';
import { MenulinksComponent } from './menulinks/menulinks.component';
import { ActiveFieldComponent } from './bamboofield/active-field/active-field.component';
import { SearchPairComponent } from './wallet/search-pair/search-pair.component';
import { MinusLiquidityPairComponent } from './wallet/minus-liquidity-pair/minus-liquidity-pair.component';

const materialModules = [
  MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatGridListModule,
  MatTabsModule,
  MatTableModule,
  MatSortModule,
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
  MatMenuModule,
  MatStepperModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule
];

// ATTENTION!!! required for AOT compilation
export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
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
    BamboovaultComponent,
    TokenvalueComponent,
    LiquidityMinusComponent,
    LiquidityPlusComponent,
    ToStakeComponent,
    ToTradeComponent,
    SelectToken,
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
    GlobalMarketComponent,
    GuideComponent,
    NotFoundComponent,
    BrandingComponent,
    WrappedComponent,
    BridgeComponent,
    PairCreateComponent,
    SelectTokenComponent,
    CountdownTimerComponent,
    StakingComponent,
    StakedComponent,
    ApyComponent,
    MenulinksComponent,
    ActiveFieldComponent,
    SearchPairComponent,
    MinusLiquidityPairComponent
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
    AlertModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule, materialModules],
  entryComponents: [
    SelectToken,
    AddSeedsComponent,
  ],
  providers: [PandaSpinnerService]
})
export class PagesModule { }
