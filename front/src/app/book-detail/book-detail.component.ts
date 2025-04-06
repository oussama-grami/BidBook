import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  category: string;
  description: string;
  rating: number; // Added rating property
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    RatingModule,
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css',
})
export class BookDetailComponent implements OnInit {
readBook() {
throw new Error('Method not implemented.');
}
  book: Book | null = null;
  relatedBooks: Book[] = [];
  isFavorite: boolean = false;

  // This would typically come from a service
  books: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverImage: 'https://covers.openlibrary.org/b/id/8759597-L.jpg',
      category: 'Fiction',
      description:
        "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
      rating: 4.5,
    },
    {
      id: 2,
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      coverImage: 'https://covers.openlibrary.org/b/id/9278726-L.jpg',
      category: 'Non-Fiction',
      description:
        'Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011 based on a series of lectures Harari taught at The Hebrew University of Jerusalem, and in English in 2014. The book surveys the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.',
      rating: 4.7,
    },
    {
      id: 3,
      title: 'Brief Answers to the Big Questions',
      author: 'Stephen Hawking',
      coverImage: 'https://covers.openlibrary.org/b/id/10753662-L.jpg',
      category: 'Science',
      description:
        "Brief Answers to the Big Questions is a popular science book written by physicist Stephen Hawking, and published by Hodder & Stoughton and Bantam Books on 16 October 2018. The book examines some of the universe's greatest mysteries, and promotes the view that science is very important in helping to solve problems on planet Earth.",
      rating: 4.6,
    },
    {
      id: 4,
      title: 'The Innovators',
      author: 'Walter Isaacson',
      coverImage: 'https://covers.openlibrary.org/b/id/8231876-L.jpg',
      category: 'Technology',
      description:
        'The Innovators: How a Group of Hackers, Geniuses, and Geeks Created the Digital Revolution is a 2014 non-fiction book written by Walter Isaacson. The book summarizes the contributions of several innovators who have made pivotal breakthroughs in computer technology and its applications.',
      rating: 4.4,
    },
    {
      id: 5,
      title: "A People's History of the United States",
      author: 'Howard Zinn',
      coverImage: 'https://covers.openlibrary.org/b/id/8430444-L.jpg',
      category: 'History',
      description:
        'A People\'s History of the United States is a 1980 nonfiction book by American historian and political scientist Howard Zinn. The book presents what the author considers to be a different side of history from the more traditional "fundamental nationalist glorification of country."',
      rating: 4.3,
    },
    {
      id: 6,
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      coverImage: 'https://covers.openlibrary.org/b/id/8231523-L.jpg',
      category: 'Fiction',
      description:
        'The Catcher in the Rye is a novel by J. D. Salinger, partially published in serial form in 1945–1946 and as a novel in 1951. It was originally intended for adults but is often read by adolescents for its themes of angst, alienation, and as a critique of superficiality in society.',
      rating: 4.2,
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      this.book = this.books.find((book) => book.id === id) || null;

      if (this.book) {
        // Get related books from the same category
        this.relatedBooks = this.books
          .filter(
            (book) =>
              book.category === this.book?.category && book.id !== this.book?.id
          )
          .slice(0, 4);
      }
    });
  }

  toggleFavorite() {
    if (this.book) {
      this.isFavorite = !this.isFavorite;
    }
  }

  downloadBook() {
    if (this.book) {
      console.log('Downloading book:', this.book.title);
      // Implementation for downloading would go here
    }
  }

  goBack() {
    window.history.back();
  }

  viewBook(bookId: number) {
    console.log('Navigating to book with ID:', bookId);
    // Implementation for navigation would go here
  }
}
