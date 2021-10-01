import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {

  guideNumber = 10;
  guides: [{
    title: string;
    img: string;
    explain: string;
  }];

  constructor() { }

  ngOnInit(): void {
  }

}
