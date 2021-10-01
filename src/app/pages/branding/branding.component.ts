import { Component, OnInit } from '@angular/core';
import { Branding } from 'src/app/interfaces/branding';

@Component({
  selector: 'app-branding',
  templateUrl: './branding.component.html',
  styleUrls: ['./branding.component.scss']
})
export class BrandingComponent implements OnInit {

  logos: Branding[] = [
    {
      name: 'BambooDeFi Logo',
      link: 'bamboodefitoken.png',
      text: 'Token Logo'
    },
    {
      name: 'BambooDeFi Panda',
      link: 'bamboodefi.png',
      text: 'BambooDeFi Logo'
    },
    {
      name: 'BambooDeFi Information',
      link: 'bamboo_logo_information_final.png',
      text: 'Information'
    },
    {
      name: 'BambooDeFi Wallet',
      link: 'bamboo_logo_wallet_final.png',
      text: 'Wallet'
    },
    {
      name: 'BambooDeFi Pool',
      link: 'bamboo_logo_pool_final.png',
      text: 'Pools'
    },
    {
      name: 'BambooDeFi Raindrop',
      link: 'bamboo_logo_raindrops_final.png',
      text: 'Raindrop'
    },
    {
      name: 'BambooDeFi Tokens',
      link: 'bamboo_logo_tokens_final.png',
      text: 'Other Tokens'
    },
    {
      name: 'BambooDeFi Lending',
      link: 'lending.png',
      text: 'Lending'
    },
    {
      name: 'BambooDeFi Governance',
      link: 'bamboo_logo_governance_final.png',
      text: 'Governance'
    },
    {
      name: 'BambooDeFi Wrapped',
      link: 'bamboo_logo_wrapped.png',
      text: 'Wrapped'
    },
    {
      name: 'BambooDeFi Vault',
      link: 'bamboo_logo_vault_final.png',
      text: 'Bamboo Vault'
    },
    {
      name: 'BambooDeFi Docs',
      link: 'bamboo_logo_docs_final.png',
      text: 'Docs'
    },
    {
      name: 'BambooDeFi Zookeeper',
      link: 'bamboo_logo_zookeeper_final.png',
      text: 'Zookeeper'
    },
    {
      name: 'BambooDeFi Christmas',
      link: 'BambooChristmas.png',
      text: 'Christmas Panda'
    },
    {
      name: 'BambooDeFi 404',
      link: 'bamboo404.png',
      text: '404 Panda'
    },
  ];

  logoImages: Branding[] = [
    {
      name: 'Front',
      link: 'logofront.png',
      text: 'Front logo'
    },
    {
      name: 'Rear',
      link: 'logorear.png',
      text: 'Rear logo'
    },    {
      name: 'Rollup',
      link: 'rollup.png',
      text: 'Roll Up'
    },
  ];


  constructor() { }

  ngOnInit(): void { }

}
