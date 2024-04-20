// ******************** //
// Interfaces for the updateConnectionGithub event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface UpdateConnectionGithubParams {}

export interface UpdateConnectionGithubServerParams
    extends EventArguments,
        UpdateConnectionGithubParams {
    name: string;
    url: string;
    secret: string;
}

export interface UpdateConnectionGithubResult {}

export interface UpdateConnectionGithubTestResult
    extends FronvoError,
        UpdateConnectionGithubResult {}
