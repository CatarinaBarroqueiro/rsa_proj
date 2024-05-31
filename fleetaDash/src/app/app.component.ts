import { ApplicationConfig, Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone:true,
  imports:[CommonModule,RouterOutlet],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showMenu: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log(event.url);
        this.showMenu = event.url !== '/';
      }
    });
  }

  ngOnInit() {}

  changeRoute(route: string) {
    this.router.navigate([route]);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

