declare module 'mime-sniffer' {
    export default class MimeSniffer {
        static lookup(data: Buffer, callback: (...args: any) => any): void;
    }
}
