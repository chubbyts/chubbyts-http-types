import type { Duplex } from 'stream';

export type Query = { [key: string]: Query | Array<Query> | string };

export type Uri = {
  schema: string;
  userInfo: string;
  host: string;
  port: number | undefined;
  path: string;
  query: Query;
  fragment: string;
};

export type Message = {
  protocolVersion: string;
  headers: Record<string, Array<string>>;
  body: Duplex;
};

export type Method = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';

export type Request = {
  method: Method;
  uri: Uri;
} & Message;

export const statusMap = new Map([
  [100, 'Continue'],
  [101, 'Switching Protocols'],
  [102, 'Processing'],
  [103, 'Early Hints'],
  [110, 'Response is Stale'],
  [111, 'Revalidation Failed'],
  [112, 'Disconnected Operation'],
  [113, 'Heuristic Expiration'],
  [199, 'Miscellaneous Warning'],
  [200, 'OK'],
  [201, 'Created'],
  [202, 'Accepted'],
  [203, 'Non-Authoritative Information'],
  [204, 'No Content'],
  [205, 'Reset Content'],
  [206, 'Partial Content'],
  [207, 'Multi-Status'],
  [208, 'Already Reported'],
  [214, 'Transformation Applied'],
  [226, 'IM Used'],
  [299, 'Miscellaneous Persistent Warning'],
  [300, 'Multiple Choices'],
  [301, 'Moved Permanently'],
  [302, 'Found'],
  [303, 'See Other'],
  [304, 'Not Modified'],
  [305, 'Use Proxy'],
  [306, 'Switch Proxy'],
  [307, 'Temporary Redirect'],
  [308, 'Permanent Redirect'],
  [400, 'Bad Request'],
  [401, 'Unauthorized'],
  [402, 'Payment Required'],
  [403, 'Forbidden'],
  [404, 'Not Found'],
  [405, 'Method Not Allowed'],
  [406, 'Not Acceptable'],
  [407, 'Proxy Authentication Required'],
  [408, 'Request Timeout'],
  [409, 'Conflict'],
  [410, 'Gone'],
  [411, 'Length Required'],
  [412, 'Precondition Failed'],
  [413, 'Payload Too Large'],
  [414, 'URI Too Long'],
  [415, 'Unsupported Media Type'],
  [416, 'Range Not Satisfiable'],
  [417, 'Expectation Failed'],
  [418, "I'm a teapot"],
  [421, 'Misdirected Request'],
  [422, 'Unprocessable Entity'],
  [423, 'Locked'],
  [424, 'Failed Dependency'],
  [425, 'Too Early'],
  [426, 'Upgrade Required'],
  [428, 'Precondition Required'],
  [429, 'Too Many Requests'],
  [431, 'Request Header Fields Too Large'],
  [451, 'Unavailable For Legal Reasons'],
  [500, 'Internal Server Error'],
  [501, 'Not Implemented'],
  [502, 'Bad Gateway'],
  [503, 'Service Unavailable'],
  [504, 'Gateway Timeout'],
  [505, 'HTTP Version Not Supported'],
  [506, 'Variant Also Negotiates'],
  [507, 'Insufficient Storage'],
  [508, 'Loop Detected'],
  [510, 'Not Extended'],
  [511, 'Network Authentication Required'],
]);

export type Response = {
  status: number;
  reasonPhrase: string;
} & Message;

export type ServerRequest = Request & {
  attributes: Record<string, unknown>;
};
