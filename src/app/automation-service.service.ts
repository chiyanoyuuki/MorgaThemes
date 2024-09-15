import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutomationServiceService {

  private apiUrl = 'https://20c492cb6c03c47c8392f2c9f36ea8d9.serveo.net';

  constructor(private http: HttpClient) { }

  downloadFile(values:any,isDevMode:any): Observable<string> {
    let params:any = {
      prenom : values[0],
      jour : values[1]<10?"0"+values[1]:""+values[1],
      mois : values[2],
      annee : values[3],
      heures : values[4]<10?"0"+values[4]:""+values[4],
      minutes : values[5]<10?"0"+values[5]:""+values[5],
      lieu : values[6],
      isDevMode:isDevMode
    }
    return this.http.get(this.apiUrl + '/api/download-file', { params: params, responseType: 'text' });
  }

  getFiles(isDevMode:any) : Observable<string> {
    let params:any = {
      isDevMode:isDevMode
    }
    return this.http.get(this.apiUrl + '/api/get-files', { params: params, responseType: 'text' });
  }
}