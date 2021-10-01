import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import { DAY_SECONDS, HOUR_SECONDS, MINUTE_SECONDS } from 'src/app/constants/time.constants';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss']
})
export class CountdownTimerComponent implements OnInit {

  @Input('time') time: number;

  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  constructor(private utilService: UtilService) { }

  ngOnInit(): void {
    setInterval(() => {
      let data = this.splitDate(this.time);
      this.days = data[0];
      this.hours = data[1];
      this.minutes = data[2];
      this.seconds = data[3];
    }, 1000);
  }

  /**
   *
   * @param countDownDate This functions receives a timestamp and returns and array with the time
   * splitted on days, hours, minutes and seconds
   * @returns
   */
   splitDate(timestamp: number): number[] {
    let date = Math.round(new Date().getTime() / 1000);
    let difference = timestamp - date;
    if(difference <= 0){
      return [0, 0, 0, 0];
    }
    let days = Math.floor(difference / DAY_SECONDS);
    let hours = Math.floor((difference % DAY_SECONDS) / HOUR_SECONDS);
    let minutes = Math.floor((difference % HOUR_SECONDS) / MINUTE_SECONDS);
    let seconds = Math.floor((difference % MINUTE_SECONDS));
    return [days, hours, minutes, seconds];
  }



}
