// ******************** //
// Interfaces for the createRoom event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface CreateRoomParams {
    name: string;
    icon?: string;
}

export interface CreateRoomServerParams
    extends EventArguments,
        CreateRoomParams {}

export interface CreateRoomResult {}

export interface CreateRoomTestResult extends FronvoError, CreateRoomResult {}
