import * as CryptoJS from 'crypto-js';

export const SECRET = import.meta.env.VITE_SECRET_KEY;

export function encrypt(txt) {
    return CryptoJS.AES.encrypt(txt, SECRET).toString();
}

export function decrypt(txtToDecrypt) {
    return CryptoJS.AES.decrypt(txtToDecrypt, SECRET).toString(CryptoJS.enc.Utf8);
}

export function manipulateLocalStorage() {
    const cryptKey = (key) => {
        try {
            return CryptoJS.MD5((key || '') + (SECRET || '')).toString();
        } catch (e) {
            return key;
        }
    }

    Storage.prototype.setEncryptedItem = (key, value) => {
        const k = cryptKey(key);
        localStorage.setItem(k, encrypt(value));
    };

    Storage.prototype.getDecryptedItem = (key) => {
        const k = cryptKey(key);
        let data = localStorage.getItem(k);
        return data ? decrypt(data): null;
    }

    Storage.prototype.removeEncryptedItem = (key) => {
        const k = cryptKey(key);
        localStorage.removeItem(k);
    }
}
