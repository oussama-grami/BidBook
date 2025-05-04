import {Component} from '@angular/core';
import {ToggleSwitch} from "primeng/toggleswitch";
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-theme-switcher',
  imports: [
    ToggleSwitch,
    FormsModule
  ],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent {
  isDarkMode = false;
  darkThemeSwitchTokens = {
    width: '4.2rem',
    height: '2.3rem',
    checkedBackground: '#ccc',
    checkedHoverBackground: '#ddd',
    handle: {
      size: '2rem',
      background: 'transparent url("images/sun-emoji.png") 0 0 / 2rem no-repeat',
      hoverBackground: 'transparent url("images/sun-emoji.png") 0 0 / 2rem no-repeat',
      checkedBackground:
        'transparent url("images/moon-emoji.png") 0 0 / 2rem no-repeat',
      checkedHoverBackground:
        'transparent url("images/moon-emoji.png") 0 0 / 2rem no-repeat',
    },
  };

  toggleDarkMode() {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      htmlElement.classList.toggle('dark-theme');
      this.isDarkMode = !this.isDarkMode;
    }
  }
}
