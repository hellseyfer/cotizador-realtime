import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
  timer,
} from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { StopWatch } from '../interfaces/stop-watch.interface';
import { CurrencyPricesService } from './currency-prices.service';

@Injectable()
export class TimerService {
  private readonly initialTime = 0;

  private timer$: BehaviorSubject<number> = new BehaviorSubject(
    this.initialTime
  );
  private running$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  private lastStopedTime: number = this.initialTime;
  private timerSubscription: Subscription = new Subscription();
  private timerSeconds$: Observable<number>;
  readonly endProcessMillis: number;
  readonly callMillis: number;
  private isRunning: boolean;
  private endTimer$: Observable<number>;

  constructor(private _currencyService: CurrencyPricesService) {
    this.endProcessMillis = 60000; //3600000;
    this.callMillis = 10000;
  }

  public get stopWatch$(): Observable<StopWatch> {
    return this.timer$.pipe(
      //map((seconds: number): StopWatch => this.secondsToStopWatch(seconds))
      map(
        (seconds: number): StopWatch =>
          this.secondsToStopWatchReverse(seconds, this.endProcessMillis)
      )
    );
  }

  public get isRunning$(): Observable<boolean> {
    return this.running$.pipe(map((val: boolean) => (this.isRunning = val)));
  }

  startCount(currency: string, compareTo: string): void {
    if (this.isRunning) {
      return;
    }
    this.timerSeconds$ = timer(0, 1000);
    const endMillis2 = this.endProcessMillis - this.lastStopedTime * 1000;
    this.endTimer$ = timer(endMillis2).pipe(tap(() => this.resetTimer()));

    this.timerSubscription = this.timerSeconds$
      .pipe(
        map((timer: number) => {
          if (timer % (this.callMillis / 1000) == 0) {
            this._currencyService.latestPrice(
              currency.toUpperCase(),
              compareTo.toUpperCase()
            );
          }
          return timer + this.lastStopedTime;
        })
      )
      .pipe(takeUntil(this.endTimer$))
      .subscribe(this.timer$);

    this.running$.next(true);
  }

  stopTimer(): void {
    this.lastStopedTime = this.timer$.value; // save the current time (in seconds)
    this.timerSubscription.unsubscribe();
    this.running$.next(false);
  }

  resetTimer(): void {
    this.timerSubscription.unsubscribe();
    this.lastStopedTime = this.initialTime;
    this.timer$.next(this.initialTime);
    this.running$.next(false);
  }

   private secondsToStopWatch(seconds: number): StopWatch {
    let rest = seconds;
    const hours = Math.floor(seconds / 3600);
    rest = seconds % 3600;
    const minutes = Math.floor(rest / 60);
    rest = seconds % 60;

    return {
      hours: this.convertToNumberString(hours),
      minutes: this.convertToNumberString(minutes),
      seconds: this.convertToNumberString(seconds),
    };
  }

  private convertToNumberString(value: number): string {
    return `${value < 10 ? '0' + value : value}`;
  }

  private secondsToStopWatchReverse(
    seconds: number,
    endTimeMillis: number
  ): StopWatch {
    let rest = endTimeMillis / 1000 - seconds;
    const hours = Math.floor(rest / 3600);
    rest = rest % 3600;
    const minutes = Math.floor(rest / 60);
    rest = rest % 60;

    return {
      hours: this.convertToNumberString(hours),
      minutes: this.convertToNumberString(minutes),
      seconds: this.convertToNumberString(rest),
    };
  }

  timeLeftString(time: StopWatch) {
    if (!this.isRunning) {
      const timeleft = this.secondsToStopWatchReverse(0, this.endProcessMillis);
      return timeleft.hours + ':' + timeleft.minutes + ':' + timeleft.seconds;
    }
    if (time.hours == '00' && time.minutes == '00' && time.seconds == '00') {
      return 'Time is up!';
    }
    return time.hours + ':' + time.minutes + ':' + time.seconds;
  }
}
