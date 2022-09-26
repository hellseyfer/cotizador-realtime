import { Component, VERSION } from '@angular/core';
import { Subscription } from 'rxjs';
import { RatesResult } from './interfaces/rates-result';
import { StopWatch } from './interfaces/stop-watch.interface';
import { CurrencyPricesService } from './services/currency-prices.service';
import { TimerService } from './services/timer.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TimerService, CurrencyPricesService]
})
export class AppComponent {
  name = 'StopWAtch By Juan Montilla - Angular ' + VERSION.major;
  private subscriptions: Subscription = new Subscription();
  timeleft: string;
  isRunning: boolean;
  ratesResult: RatesResult;
  to: string = 'USD';
  from: string = 'JPY';
  amout: number = 1;

  constructor(
    private _timerService: TimerService,
    private _currencyService: CurrencyPricesService
  ) {
    this.subscriptions.add(
      this._timerService.stopWatch$.subscribe((val: StopWatch) => {
        this.timeleft = this._timerService.timeLeftString(val);
      })
    );
    this.subscriptions.add(
      this._currencyService.latestPrices$.subscribe((val: RatesResult) => {
        this.ratesResult = val;
      })
    );

    this.subscriptions.add(
      this._timerService.isRunning$.subscribe((val: boolean) => {
        this.isRunning = val;
      })
    );
  }

  public startCount(): void {
    this._timerService.startCount(this.from, this.to);
  }

  public stopCount(): void {
    this._timerService.stopTimer();
  }

  public resetTimer(): void {
    this._timerService.resetTimer();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
