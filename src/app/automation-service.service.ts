import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutomationServiceService {

  private apiUrl = 'https://db9cd3866b344f8faecff3e321b7309b.serveo.net';

  constructor(private http: HttpClient) { }

  downloadFile(values:any,isDevMode:any): Observable<string> {
    let params:any = {
      nom : values[0],
      prenom : values[1],
      jour : values[2]<10?"0"+values[2]:""+values[2],
      mois : values[3],
      annee : values[4],
      heures : values[5]<10?"0"+values[5]:""+values[5],
      minutes : values[6]<10?"0"+values[6]:""+values[6],
      lieu : values[7],
      isDevMode:isDevMode
    }
    return this.http.get(this.apiUrl + '/api/download-file', { params: params, responseType: 'text' });
  }

  getFiles(isDevMode:any, mdp:string, show:boolean) : Observable<string> {
    let params:any = {
      isDevMode:isDevMode,
      mdp:mdp,
      show:show
    }
    return this.http.get(this.apiUrl + '/api/get-files', { params: params, responseType: 'text' });
  }
}