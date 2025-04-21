import { gql } from 'apollo-angular';

export const VIEW_BOOKS_QUERY = gql`
  query ViewBooks($limit: Int, $offset: Int) {
    viewBooks(limit: $limit, offset: $offset) {
      id
      title
      picture
      rating {
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
