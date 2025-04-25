
import { gql } from 'apollo-angular';

export const ADD_COMMENT_TO_BOOK_MUTATION = gql`
  mutation AddCommentToBook($bookId: Int!, $userId: Int!, $content: String!) {
    addCommentToBook(bookId: $bookId, userId: $userId, content: $content) {
      id
      content
      user {
        id
        firstName 
        lastName 
        imageUrl
      }
      createdAt
    }
  }
`;

export const ADD_FAVORITE_MUTATION = gql`
  mutation AddFavorite($userId: Int!, $bookId: Int!) {
    addFavorite(userId: $userId, bookId: $bookId) {
      id
      user {
        id
      }
      book {
        id
      }
    }
  }
`;
export const REMOVE_FAVORITE_MUTATION = gql`
mutation RemoveFavorite($userId: Int!, $bookId: Int!) {
  removeFavorite(userId: $userId, bookId: $bookId)
}
`;

export const ADD_RATE_MUTATION = gql`
  mutation AddBookRate($userId: Int!, $bookId: Int!, $rate: Float!) {
    addRate(userId: $userId, bookId: $bookId, rate: $rate) {
      id
      rate
      user {
        id
      }
      book {
        id
      }
     
    }
  }
`;
export const UPDATE_BOOK_RATE_MUTATION = gql`
  mutation UpdateBookRate($userId: Int!, $bookId: Int!, $rate: Float!) {
    updateRate(userId: $userId, bookId: $bookId, rate: $rate) {
      id
      user {
        id
      }
      book
      rate
      createdAt
      updatedAt
    }
  }
`;