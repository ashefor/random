export interface Notification {
    tag?: string;
    title: string;
    message: string;
    exclude: string;
    include: string;
    commit: string;
    send_sms_too: string;
}
