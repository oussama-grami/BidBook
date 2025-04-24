export interface TransactionDetailsDto {
    transaction: {
        id: number;
        amount: number;
        book: {
            id: number;
            title: string;
            imageUrl: string;
        };
    };
}