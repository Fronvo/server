// ******************** //
// Interfaces for the removeConnectionGithub event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface RemoveConnectionGithubParams {}

export interface RemoveConnectionGithubServerParams
    extends EventArguments,
        RemoveConnectionGithubParams {}

export interface RemoveConnectionGithubResult {}

export interface RemoveConnectionGithubTestResult
    extends FronvoError,
        RemoveConnectionGithubResult {}
