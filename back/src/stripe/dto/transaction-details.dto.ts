export interface TransactionDetailsDto {
    transaction: {
        id: number;
        amount: number;
        bookid: number;
        title: string;
        imageUrl: string;
    };
}