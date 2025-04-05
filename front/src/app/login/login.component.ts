import {Component} from '@angular/core';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-login',
  imports: [
    Button
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    // Ajoutez votre logique de connexion ici
  }
}
