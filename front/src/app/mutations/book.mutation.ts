
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