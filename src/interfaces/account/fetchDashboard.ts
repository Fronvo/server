// ******************** //
// Interfaces for the fetchDashboard event file.
// ******************** //

import { Account } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';
import { FetchedFronvoPost } from './fetchProfilePosts';

export interface FetchDashboardParams {
    from: string;
    to: string;
}

export interface FetchDashboardServerParams
    extends EventArguments,
        FetchDashboardParams {}

export interface FetchDashboardResult {
    dashboard: { post: FetchedFronvoPost; profileData: Partial<Account> }[];
    totalPosts: number;
}

export interface FetchDashboardTestResult
    extends FronvoError,
        FetchDashboardResult {}
