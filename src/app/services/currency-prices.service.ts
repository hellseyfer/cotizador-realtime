import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { RatesResult } from '../interfaces/rates-result';

@Injectable()
export class CurrencyPricesService {
  private endpoint = 'https://api.apilayer.com/exchangerates_data/convert';
  private prices$ = new Subject<RatesResult>();
  private asd = 'Nlqc7PMMquoWWL9PHU6FtUgu2XUEbH8X';

  constructor(private _http: HttpClient) {}

  public get latestPrices$(): Observable<RatesResult> {
    return this.prices$.asObservable();
  }

  latestPrice(currency: string, compareTo: string) {
    const headers = {
      apikey: this.asd,
    };
    const params = {
      from: currency,
      to: compareTo,
      amount: 1,
    };

    const options = {
      headers,
      params,
    };

    return this._http
      .get<RatesResult>(this.endpoint, options)
      .pipe(tap((val) => console.log(val)))
      .subscribe((res) => {
        this.prices$.next(res);
      });
  }
}
