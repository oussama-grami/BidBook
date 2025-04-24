
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
