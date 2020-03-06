export function SecureRandString (length: number = 10) {
    if (window.crypto) {
        const arr = new Uint32Array(length);
        window.crypto.getRandomValues(arr);
        return `${arr[0]}`;
    } else {
        let text = '';
        const possible = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
