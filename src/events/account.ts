// ******************** //
// Events which are only usable while logged in.
// ******************** //

import fetchProfileId from 'events/account/fetchProfileId';
import fetchProfileData from 'events/account/fetchProfileData';
import logout from 'events/account/logout';
import updateProfileData from 'events/account/updateProfileData';
import createPost from 'events/account/createPost';
import fetchProfilePosts from 'events/account/fetchProfilePosts';
import deletePost from 'events/account/deletePost';
import followProfile from 'events/account/followProfile';
import unfollowProfile from 'events/account/unfollowProfile';
import findProfiles from 'events/account/findProfiles';
import fetchHomePosts from 'events/account/fetchHomePosts';

import { EventExportTemplate } from 'interfaces/all';

const accountTemplate: EventExportTemplate = {
    fetchProfileId,
    fetchProfileData,
    logout,
    updateProfileData,
    createPost,
    fetchProfilePosts,
    deletePost,
    followProfile,
    unfollowProfile,
    findProfiles,
    fetchHomePosts,
};

export default accountTemplate;
