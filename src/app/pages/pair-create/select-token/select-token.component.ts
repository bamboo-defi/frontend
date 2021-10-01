import { trigger, state, style, transition, animate } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Token } from 'src/app/interfaces/token';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-select-token',
  templateUrl: './select-token.component.html',
  styleUrls: ['./select-token.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SelectTokenComponent implements OnInit {

  wallet = [
    { symbol: '', ammount: '' }];
  dataSource;
  displayedColumns: string[] = [
    'logo',
    // 'tokenName',
    // 'ammount',
    // 'detail',
  ];

  tokens;
  selection = new SelectionModel<Token>(true, []);

  list: JSON;
  listToken = [];
  tokenList: JSON[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private utilsService: UtilService,
    private service: ServiceService,
    public dialogRef: MatDialogRef<Token>,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this.getTokenList();
  }

  // Get list and order
  getTokenList(): void {
    this.service.getTokenListBamboo().subscribe((res, err) => {
      if (res){
        this.tokenList = this.utilsService.sortTokenListBySymbol(res.tokens);
        this.createTable();
      }else if (err){
        console.log(err);
      }
      });
  }

  // Table to select token
  createTable(): void {
    const data = this.tokenList;
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.sort = this.sort;
  }

  // Function for apply the filter in the table
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Get token by address
  async getTokenByAddress(address): Promise<void> {
    this.dialogRef.close(address);
  }

  // Exit dialog
  onNoClick(): void {
    this.dialogRef.close();
  }


}
