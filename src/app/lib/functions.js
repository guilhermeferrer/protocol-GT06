import crc16 from 'node-crc-itu';

export function toBuffer(hex){
    return Buffer.from(hex, 'hex');
}

export function bufferToHexString(buffer) {
    return buffer.toString('hex');
}

export function hexToUtf8(hex) {
    return Buffer.from(hex, 'hex').toString('utf-8');
}

export function utf8ToHex(uft8) {
    return Buffer.from(uft8, 'utf-8').toString('hex');
}

export function decimalToHex(decimal) {
    return decimal.toString(16);
}

export function hexToDecimal(hex) {
    return parseInt(hex, 16);
}

export function hexToBinary(hex){
    return hex.toString(2).padStart(8, '0');
}

export function crc(hex) {
    return Buffer.from(crc16(hex), 'hex');
}