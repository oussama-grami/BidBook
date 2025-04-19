
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
    id: string;
    username: string;
}

export class Comment {
    id: string;
    text: string;
    user: User;
    createdAt: DateTime;
}

export class Bid {
    id: string;
    amount: number;
    bidder: User;
    createdAt: DateTime;
}

export class Book {
    id: string;
    title: string;
    author: string;
    picture: string;
    owner: User;
    commentsCount: number;
    description?: Nullable<string>;
    comments?: Nullable<Comment[]>;
    bids?: Nullable<Bid[]>;
    price?: Nullable<number>;
    numberOfPages?: Nullable<number>;
    damagedPages?: Nullable<number>;
    age?: Nullable<number>;
    edition?: Nullable<number>;
    rating?: Nullable<number>;
    votes?: Nullable<number>;
    language?: Nullable<Language>;
    editor?: Nullable<string>;
    category?: Nullable<Category>;
}

export abstract class IQuery {
    abstract viewBooks(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;

    abstract bookDetails(id: string): Nullable<Book> | Promise<Nullable<Book>>;

    abstract myBids(limit?: Nullable<number>, offset?: Nullable<number>): Book[] | Promise<Book[]>;
}

export type DateTime = any;
type Nullable<T> = T | null;
