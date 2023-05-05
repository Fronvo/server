// ******************** //
// The account-only function tests for the Fronvo server.
// ******************** //

import fetchProfileId from 'test/account/fetchProfileId.test';
import fetchProfileData from 'test/account/fetchProfileData.test';
import updateProfileData from 'test/account/updateProfileData.test';
import createPost from 'test/account/createPost.test';
import fetchProfilePosts from 'test/account/fetchProfilePosts.test';
import deletePost from 'test/account/deletePost.test';
import followProfile from 'test/account/followProfile.test';
import unfollowProfile from 'test/account/unfollowProfile.test';
import fetchHomePosts from 'test/account/fetchHomePosts.test';
import createCommunity from 'test/account/createCommunity.test';
import fetchCommunityData from 'test/account/fetchCommunityData.test';
import updateCommunityData from 'test/account/updateCommunityData.test';
import joinCommunity from 'test/account/joinCommunity.test';
import sendCommunityMessage from 'test/account/sendCommunityMessage.test';
import fetchCommunityMessages from 'test/account/fetchCommunityMessages.test';
import deleteCommunityMessage from 'test/account/deleteCommunityMessage.test';
import kickMember from 'test/account/kickMember.test';
import banMember from 'test/account/banMember.test';
import showBannedMembers from 'test/account/showBannedMembers.test';
import unbanMember from 'test/account/unbanMember.test';
import leaveCommunity from 'test/account/leaveCommunity.test';
import logout from 'test/account/logout.test';

export default {
    fetchProfileId,
    fetchProfileData,
    updateProfileData,
    createPost,
    fetchProfilePosts,
    deletePost,
    followProfile,
    unfollowProfile,
    fetchHomePosts,
    createCommunity,
    fetchCommunityData,
    updateCommunityData,
    joinCommunity,
    sendCommunityMessage,
    fetchCommunityMessages,
    deleteCommunityMessage,
    kickMember,
    banMember,
    showBannedMembers,
    unbanMember,
    leaveCommunity,
    logout,
};
