import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InformationComponent } from './information/information.component';
import { WalletComponent } from './wallet/wallet.component';
import { PoolComponent } from './pool/pool.component';
import { TokensComponent } from './tokens/tokens.component';
import { PairsComponent } from './pairs/pairs.component';
import { GovernanceComponent } from './governance/governance.component';
import { AboutComponent } from './about/about.component';
import { RaindropComponent } from './raindrop/raindrop.component';
import { DocsComponent } from './docs/docs.component';
import { PagesComponent } from './pages.component';
import { BamboovaultComponent } from './bamboovault/bamboovault.component';
import { TokenvalueComponent } from './tokenvalue/tokenvalue.component';
import { PairComponent } from './pair/pair.component';
import { BamboofieldComponent } from './bamboofield/bamboofield.component';
import { LendingComponent } from './lending/lending.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BrandingComponent } from './branding/branding.component';
import { WrappedComponent } from './wrapped/wrapped.component';
import { BridgeComponent } from './bridge/bridge.component';
import { PairCreateComponent } from './pair-create/pair-create.component';
import { StakingComponent } from './staking/staking.component';
import { LiquidityPlusComponent } from './wallet/liquidity-plus/liquidity-plus.component';
import { SearchPairComponent } from './wallet/search-pair/search-pair.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'information',
        component: InformationComponent
      },
      {
        path: 'wallet',
        component: WalletComponent
      },
      {
        path: 'wallet/:id1/:id2',
        component: WalletComponent
      },
      {
        path: 'wallet/:pool',
        component: WalletComponent
      },
      {
        path: 'bridge',
        component: BridgeComponent
      },
      {
        path: 'farms',
        component: PoolComponent
      },
      {
        path: 'pools',
        component: StakingComponent
      },
      {
        path: 'tokens',
        component: TokensComponent
      },
      // {
      //   path: 'pairs',
      //   component: PairsComponent
      // },
      {
        path: 'raindrop',
        component: RaindropComponent
      },
      {
        path: 'governance',
        component: GovernanceComponent
      },
      {
        path: 'docs',
        component: DocsComponent
      },
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'bamboovault',
        component: BamboovaultComponent
      },
      {
        path: 'bamboofield',
        component: BamboofieldComponent
      },
      {
        path: 'tokenvalue/:id/:tokenid',
        component: TokenvalueComponent
      },
      {
        path: 'pair/:address/:id1/:id2',
        component: PairComponent
      },
      {
        path: 'pair',
        redirectTo: 'pools'
      },
      {
        path: 'lending',
        component: LendingComponent
      },
      // {
      //   path: 'branding',
      //   component: BrandingComponent
      // },
      // {
      //   path: 'wrapped',
      //   component: WrappedComponent
      // },
      {
        path: 'bridge',
        component: BridgeComponent
      },
      {
        path: 'liquidityPlus',
        component: LiquidityPlusComponent
      },
      {
        path: 'searchPair',
        component: SearchPairComponent
      }
      // {
      //   path: 'pair-create',
      //   component: PairCreateComponent
      // }
    ]
  },

  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  // { path: '404', component: NotFoundComponent},
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
