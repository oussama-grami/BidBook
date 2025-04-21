
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Category {
    FICTION = "FICTION",
    NON_FICTION = "NON_FICTION",
    SCIENCE = "SCIENCE",
    HISTORY = "HISTORY",
    BIOGRAPHY = "BIOGRAPHY",
    ROMANCE = "ROMANCE",
    OTHER = "OTHER",
    ADVENTURE = "ADVENTURE",
    FANTASY = "FANTASY",
    POETRY = "POETRY",
    ART = "ART",
    NOVEL = "NOVEL",
    THRILLER = "THRILLER",
    PHILOSOPHY = "PHILOSOPHY",
    RELIGION = "RELIGION",
    TECHNOLOGY = "TECHNOLOGY"
}

export enum Language {
    ENGLISH = "ENGLISH",
    GERMAN = "GERMAN",
    FRENCH = "FRENCH",
    ITALIAN = "ITALIAN",
    SPANISH = "SPANISH",
    OTHER = "OTHER"
}

export enum BidStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export class User {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl: string;
}

export class Comment {
    id: number;
    content: string;
    user?: Nullable<User>;
    createdAt: DateTime;
    book: Book;
}

export class Bid {
    id: number;
    amount: number;
    bidder: User;
    createdAt: DateTime;
    book: Book;
    bidStatus: BidStatus;
}

export class Book {
    id: number;
    title: string;
    author: string;
    picture: string;
    owner: User;
    comments?: Nullable<Comment[]>;
    favorites?: Nullable<Favorite[]>;
    bids?: Nullable<Bid[]>;
    price?: Nullable<number>;
    totalPages?: Nullable<number>;
    damagedPages?: Nullable<number>;
    age?: Nullable<number>;
    edition?: Nullable<number>;
    language?: Nullable<Language>;
    editor?: Nullable<string>;
    category?: Nullable<Category>;
    rating?: Nullable<UserRating[]>;
}

export class Favorite {
    id: number;
    user: User;
    book: Book;
}

export class UserRating {
    id: number;
    user: User;
    book: Book;
    rate: number;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export abstract class IQuery {
    abstract viewBooks(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;

    abstract bookDetails(id: number): Nullable<Book> | Promise<Nullable<Book>>;

    abstract myBids(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;

    abstract highestBidForBook(bookId: number): Nullable<Bid> | Promise<Nullable<Bid>>;

    abstract userBookRating(userId: number, bookId: number): Nullable<UserRating> | Promise<Nullable<UserRating>>;
}

export abstract class IMutation {
    abstract addFavorite(userId: number, bookId: number): Favorite | Promise<Favorite>;

    abstract removeFavorite(userId: number, bookId: number): boolean | Promise<boolean>;

    abstract addCommentToBook(bookId: number, userId: number, content: string): Nullable<Comment> | Promise<Nullable<Comment>>;

    abstract removeComment(commentId: number): boolean | Promise<boolean>;

    abstract createBid(userId: number, bookId: number, amount: number): Bid | Promise<Bid>;

    abstract updateBid(bookId: number, userId: number, amount: number): Bid | Promise<Bid>;

    abstract addRate(userId: number, bookId: number, rate: number): UserRating | Promise<UserRating>;

    abstract updateRate(userId: number, bookId: number, rate: number): UserRating | Promise<UserRating>;
}

export type DateTime = any;
type Nullable<T> = T | null;
