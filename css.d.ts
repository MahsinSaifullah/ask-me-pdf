import 'csstype';

declare module 'csstype' {
  interface Properties {
    '--value'?: string | number;
    '--size'?: string | number;
    '--thickness'?: string | number;
  }
}
