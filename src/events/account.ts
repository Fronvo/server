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
import fetchHomePosts from 'events/account/fetchHomePosts';
import createCommunity from 'events/account/createCommunity';
import joinCommunity from 'events/account/joinCommunity';
import fetchCommunityData from 'events/account/fetchCommunityData';
import updateCommunityData from 'events/account/updateCommunityData';
import leaveCommunity from 'events/account/leaveCommunity';
import sendCommunityMessage from 'events/account/sendCommunityMessage';
import fetchCommunityMessages from 'events/account/fetchCommunityMessages';
import deleteCommunityMessage from 'events/account/deleteCommunityMessage';
import updateChatRequest from 'events/account/updateChatRequest';
import kickMember from 'events/account/kickMember';
import banMember from 'events/account/banMember';
import showBannedMembers from 'events/account/showBannedMembers';
import unbanMember from 'events/account/unbanMember';

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
    fetchHomePosts,
    createCommunity,
    joinCommunity,
    fetchCommunityData,
    updateCommunityData,
    leaveCommunity,
    sendCommunityMessage,
    fetchCommunityMessages,
    deleteCommunityMessage,
    updateChatRequest,
    kickMember,
    banMember,
    showBannedMembers,
    unbanMember,
};

export default accountTemplate;
