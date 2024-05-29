import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MapComponent } from './map/map.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fleetaDash';
  currentRoute: string;

  constructor(private router: Router) {
    console.log("ROUTER " + this.router.url)
    this.currentRoute = this.router.url;
  }

  changeRoute(route: string) {
    this.router.navigateByUrl(route);
  }
}
