export interface Instruction {
    _id?: string;
    description: string;
    code: string;
    from_head: string;
    from_subhead: string;
    to_head: string;
    to_subhead: string;
    is_percentage: string;
    amount: number;
    index: number;
    status: string;
    billing_id: string;
}
