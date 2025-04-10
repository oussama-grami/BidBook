import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  imports: [],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  article = {
    title: 'The Timeless Appeal of Fiction Books',
    date: '04.04.2025',
    content: 'Fiction books have the power to transport readers to new worlds, introduce them to unforgettable characters, and evoke deep emotions. Whether through epic adventures, heartfelt dramas, or mind-bending mysteries, fiction allows us to experience stories beyond our own reality. From classic novels to modern bestsellers, these books continue to captivate and inspire generations of readers.',
    tag: 'Fiction',
    author: 'Hiba Chabbouh',
    creationDate: '01.03.2025'  // Date de création du blog
  };

}
