
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

export class User {
    id: number;
    firstName: string;
    lastName: string;
}

export class Comment {
    id: number;
    content: string;
    user: User;
    createdAt: DateTime;
}

export class Bid {
    id: number;
    amount: number;
    bidder: User;
    createdAt: DateTime;
}

export class Book {
    id: number;
    title: string;
    author: string;
    picture: string;
    owner: User;
    comments?: Nullable<Comment[]>;
    bids?: Nullable<Bid[]>;
    price?: Nullable<number>;
    totalPages?: Nullable<number>;
    damagedPages?: Nullable<number>;
    age?: Nullable<number>;
    edition?: Nullable<number>;
    rating?: Nullable<number>;
    language?: Nullable<Language>;
    editor?: Nullable<string>;
    category?: Nullable<Category>;
}

export abstract class IQuery {
    abstract viewBooks(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;

    abstract bookDetails(id: number): Nullable<Book> | Promise<Nullable<Book>>;

    abstract myBids(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;
}

export type DateTime = any;
type Nullable<T> = T | null;
