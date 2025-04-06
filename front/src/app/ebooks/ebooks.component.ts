import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { EbookCardComponent } from '../components/ebook-card/ebook-card.component';

export interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  reviews: number;
  rating: number;
  description?: string;
  price?: string;
  coverImage: string;
}

@Component({
  selector: 'app-ebooks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    SidebarModule,
    MenuModule,
    EbookCardComponent,
  ],
  templateUrl: './ebooks.component.html',
  styleUrls: ['./ebooks.component.css'],
})
export class EbooksComponent {

}
