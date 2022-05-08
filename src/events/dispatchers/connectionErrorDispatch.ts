// ******************** //
// The connection error dispatcher file which handles socket connection errors.
// ******************** //

import { SocketIOConnectionError } from 'interfaces/all';

export default function connectionErrorDispatch(
    err: SocketIOConnectionError
): void {
    console.log(
        'Connection abnormally closed:  [' + err.code + ']' + err.message
    );
}
