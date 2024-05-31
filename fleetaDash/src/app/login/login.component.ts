import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone:true,
  imports:[CommonModule, FormsModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = 'user@ua.pt'; // Default email
  password: string = 'user'; // Default password

  constructor(private router: Router) {} // Inject Router in the constructor

  login() {
    // Here you can add your login logic, such as sending the credentials to an authentication service
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Simulating successful login for the given user
    if (this.email === 'user@ua.pt' && this.password === 'user') {
      // Redirect the user to the home page
      this.router.navigate(['/main']);
    } else {
      // Handle invalid credentials or other login errors
      console.log('Invalid credentials. Please try again.');
    }
  }
}
