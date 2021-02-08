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
import { PandaspinnerComponent } from './pandaspinner/pandaspinner.component';

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
        path: 'Home',
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
        path: 'pools',
        component: PoolComponent
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
        path: 'pair/:id',
        component: PairComponent
      },
      {
        path: 'lending',
        component: LendingComponent
      }
    ]
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
