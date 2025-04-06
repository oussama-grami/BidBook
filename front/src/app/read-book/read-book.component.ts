import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  category: string;
  description: string;
  content?: string;
}

@Component({
  selector: 'app-read-book',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ToolbarModule,
    CardModule,
    PaginatorModule
  ],
  templateUrl: './read-book.component.html',
  styleUrl: './read-book.component.css'
})
export class ReadBookComponent implements OnInit {
  book: Book | null = null;
  bookId: number = 0;
  fontSize: number = 16;
  currentPage: number = 1;
  totalPages: number = 10; // This would typically be calculated based on book content

  // This would typically come from a service
  books: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverImage: 'https://covers.openlibrary.org/b/id/8759597-L.jpg',
      category: 'Fiction',
      description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
      content: 'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."'
    },
    {
      id: 2,
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      coverImage: 'https://covers.openlibrary.org/b/id/9278726-L.jpg',
      category: 'Non-Fiction',
      description: 'Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011 based on a series of lectures Harari taught at The Hebrew University of Jerusalem, and in English in 2014. The book surveys the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.',
      content: 'About 13.5 billion years ago, matter, energy, time and space came into being in what is known as the Big Bang. The story of these fundamental features of our universe is called physics.'
    },
    {
      id: 3,
      title: 'Brief Answers to the Big Questions',
      author: 'Stephen Hawking',
      coverImage: 'https://covers.openlibrary.org/b/id/10753662-L.jpg',
      category: 'Science',
      description: 'Brief Answers to the Big Questions is a popular science book written by physicist Stephen Hawking, and published by Hodder & Stoughton and Bantam Books on 16 October 2018. The book examines some of the universe\'s greatest mysteries, and promotes the view that science is very important in helping to solve problems on planet Earth.',
      content: 'People have always wanted answers to the big questions. Where did we come from? How did the universe begin? What is the meaning and design behind it all? Is there anyone out there?'
    },
    {
      id: 4,
      title: 'The Innovators',
      author: 'Walter Isaacson',
      coverImage: 'https://covers.openlibrary.org/b/id/8231876-L.jpg',
      category: 'Technology',
      description: 'The Innovators: How a Group of Hackers, Geniuses, and Geeks Created the Digital Revolution is a 2014 non-fiction book written by Walter Isaacson. The book summarizes the contributions of several innovators who have made pivotal breakthroughs in computer technology and its applications.',
      content: 'Ada Lovelace, whose father was the romantic poet Lord Byron, wrote the first computer algorithm in 1842.'
    },
    {
      id: 5,
      title: 'A People\'s History of the United States',
      author: 'Howard Zinn',
      coverImage: 'https://covers.openlibrary.org/b/id/8430444-L.jpg',
      category: 'History',
      description: 'A People\'s History of the United States is a 1980 nonfiction book by American historian and political scientist Howard Zinn. The book presents what the author considers to be a different side of history from the more traditional "fundamental nationalist glorification of country."',
      content: 'Arawak men and women, naked, tawny, and full of wonder, emerged from their villages onto the island\'s beaches and swam out to get a closer look at the strange big boat.'
    },
    {
      id: 6,
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      coverImage: 'https://covers.openlibrary.org/b/id/8231523-L.jpg',
      category: 'Fiction',
      description: 'The Catcher in the Rye is a novel by J. D. Salinger, partially published in serial form in 1945–1946 and as a novel in 1951. It was originally intended for adults but is often read by adolescents for its themes of angst, alienation, and as a critique of superficiality in society.',
      content: 'If you really want to hear about it, the first thing you\'ll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don\'t feel like going into it, if you want to know the truth.'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.bookId = +params['id'];
      this.book = this.books.find(book => book.id === this.bookId) || null;
      
      if (this.book) {
        // Additional initialization for reading experience
        this.currentPage = 1;
        // In a real app, you might calculate total pages based on content length
      }
    });
  }

  adjustFontSize(change: number) {
    const newSize = this.fontSize + change;
    if (newSize >= 12 && newSize <= 24) {
      this.fontSize = newSize;
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
