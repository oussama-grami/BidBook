import { gql } from 'apollo-angular';

export const VIEW_BOOKS_QUERY = gql`
  query ViewBooks($limit: Int, $offset: Int) {
    viewBooks(limit: $limit, offset: $offset) {
      id
      title
      picture
      ratings {
        rate
      }
      favorites {
        id
      }
      bids {
        id
      }
      category
      createdAt
      comments {
        id
      }

    }
  }
`;

export const GET_BOOK_DETAILS_WITH_FAVORITE_CHECK_QUERY = gql`
  query BookDetailsQuery($id: Int!) {
    bookDetails(id: $id) {
      id
      title
      author
      picture
      price
      totalPages
      damagedPages
      age
      edition
      language
      editor
      category
      createdAt
      owner {
        firstName
        lastName
      }
      bids {
        amount
      }
      ratings {
        rate
        user {
           id
        }
      }
      comments {
        id
        content
        createdAt
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
      favorites {
        id
        user {
           id
        }
      }
    }
  }
`;

export const MY_BIDS_QUERY = gql`
  query myBids($limit: Int, $offset: Int) {
    myBids(limit: $limit, offset: $offset) {
      id
      amount
      bidStatus
      createdAt
      book {
        id
        title
        picture
      }
      bidder {
        id
        firstName
        lastName
        imageUrl
      }
    }
  }
`;
