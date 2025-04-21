import { Injectable } from '@angular/core';
import { Configuration } from './configuration';
import { environment } from '../../../environments/environment.development'; 

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  public getConfiguration(): Configuration {
    return new Configuration({
      basePath: environment.apiUrl,
      withCredentials: true, // This is critical for sending cookies in CORS requests
    });
  }
}
