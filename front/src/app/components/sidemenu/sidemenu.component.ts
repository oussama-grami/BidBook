import { Component, HostListener } from '@angular/core';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  imports: [Menubar],
  styleUrls: ['./sidemenu.component.css'],
})
export class SidemenuComponent {
  topMenuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      badge: '2',
    },
    { label: 'Books', icon: 'pi pi-book', badge: '2' },
    { label: 'Categories', icon: 'pi pi-tags', badge: '2' },
    { label: 'Recent', icon: 'pi pi-clock', badge: '2' },
  ];

  bottomMenuItems = [
    { label: 'Messages', icon: 'pi pi-comments', badge: '2' },
    { label: 'Notifications', icon: 'pi pi-bell', badge: '2' },
    { label: 'Logout', icon: 'pi pi-sign-out' },
  ];

  isSmallScreen: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.isSmallScreen = window.innerWidth <= 768;
  }
}
