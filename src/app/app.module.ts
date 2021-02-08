import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DialogContent } from './pages/pages.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ConnectionService} from './services/contract-connection/connection.service';


@NgModule({
  declarations: [
    AppComponent,
    DialogContent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
     ],
   entryComponents: [
     DialogContent
   ],
  providers: [
    ConnectionService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
