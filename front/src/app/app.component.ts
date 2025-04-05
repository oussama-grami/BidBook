import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LoginComponent} from './login/login.component';
import {RouterOutlet} from '@angular/router';
import {ThemeSwitcherComponent} from './theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    FormsModule,
    LoginComponent,
    RouterOutlet,
    ThemeSwitcherComponent
  ]
})
export class AppComponent {

}
