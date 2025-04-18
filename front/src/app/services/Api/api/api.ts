export * from './app.service';
import { AppService } from './app.service';
export * from './authentication.service';
import { AuthenticationService } from './authentication.service';
export const APIS = [AppService, AuthenticationService];
