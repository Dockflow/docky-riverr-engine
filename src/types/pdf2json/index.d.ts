declare module 'pdf2json' {
    export default class Pdf2Json {
        constructor(arg: any, arg2: any);
        getRawTextContent(): any;
        on(arg: string, callback: (...args: any) => any): any;
        parseBuffer(buffer: any): any;
    }
}
