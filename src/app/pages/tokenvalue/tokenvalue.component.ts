import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceService} from 'src/app/services/service.service';
import {WalletComponent} from '../wallet/wallet.component';
import { NetworkService } from 'src/app/services/contract-connection/network.service';

declare var TradingView: any;

@Component({
  selector: 'app-tokenvalue',
  templateUrl: './tokenvalue.component.html',
  styleUrls: ['./tokenvalue.component.scss']
})
export class TokenvalueComponent implements OnInit, AfterViewInit {

  token: string;
  tokenId: string;
  tokenValues = {
    symbol: '',
    market_data: {
      current_price: {
        usd: 0
      },
      high_24h: {
        usd: 0
      },
      low_24h: {
        usd: 0
      },
      market_cap_change_percentage_24h: 0,
      price_change_24h: 0
    },
    tickers: [
      {},
      {
        converted_volume: {
          usd: 0
        },
        volume: 0
      }
    ],
    image: {
      small: ''
    }
  };
  tradingView: any;
  redirect = 'pages/tokens';

  toTrade = WalletComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('id');
    this.tokenId = this.route.snapshot.paramMap.get('tokenid');
    // Get token data market from service
    this.service.getTokenMarket(this.tokenId).subscribe(res => {
      this.tokenValues = res;
    });
  }


  ngAfterViewInit(): void {
      // tslint:disable-next-line:no-unused-expression
      new TradingView.widget({
        container_id: 'technical-analysis',
        autosize: true,
        symbol: this.token + 'USDT',
        interval: '120',
        timezone: 'exchange',
        theme: 'Light',
        style: '1',
        toolbar_bg: '#f1f3f6',
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        hideideas: true,
        studies: [
          'MASimple@tv-basicstudies'],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650'
      });
  }

  // Open trade window to trade with selected token
  tradeWindow(token): void {
    const dialogRef = this.dialog.open(this.toTrade, {
      height: '750px',
      width: '520px',
      data: {
        token
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  // Function to go back the page
  goBack(): any {
    return this.router.navigateByUrl(this.redirect);
  }

}
