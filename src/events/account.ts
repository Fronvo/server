// ******************** //
// Events which are only usable while logged in.
// ******************** //

import fetchProfileId from 'events/account/fetchProfileId';
import fetchProfileData from 'events/account/fetchProfileData';
import logout from 'events/account/logout';
import updateProfileData from 'events/account/updateProfileData';
import sendMessage from 'events/account/sendMessage';
import fetchMessages from 'events/account/fetchMessages';
import deleteMessage from 'events/account/deleteMessage';
import updateProfileStatus from 'events/account/updateProfileStatus';
import fetchConvos from 'events/account/fetchConvos';
import startTyping from 'events/account/startTyping';
import finishTyping from 'events/account/finishTyping';
import addFriend from 'events/account/addFriend';
import removeFriend from 'events/account/removeFriend';
import acceptFriendRequest from 'events/account/acceptFriendRequest';
import rejectFriendRequest from 'events/account/rejectFriendRequest';
import createDM from 'events/account/createDM';
import sendImage from 'events/account/sendImage';
import fetchDashboard from 'events/account/fetchDashboard';
import fetchProfilePosts from 'events/account/fetchProfilePosts';
import closeDM from 'events/account/closeDM';
import likePost from 'events/account/likePost';
import requestData from 'events/account/requestData';
import deleteAccount from 'events/account/deleteAccount';
import sharePost from 'events/account/sharePost';
import deletePost from 'events/account/deletePost';
import fetchTenor from 'events/account/fetchTenor';
import applyTurbo from 'events/account/applyTurbo';
import refundTurbo from 'events/account/refundTurbo';
import fetchTurboCH from 'events/account/fetchTurboCH';
import fetchLatestVersion from 'events/account/fetchLatestVersion';
import removeFCM from 'events/account/removeFCM';
import createServer from 'events/account/createServer';
import deleteServer from 'events/account/deleteServer';
import fetchServers from 'events/account/fetchServers';
import createChannel from 'events/account/createChannel';
import deleteChannel from 'events/account/deleteChannel';
import fetchChannelMessages from 'events/account/fetchChannelMessages';
import sendChannelMessage from 'events/account/sendChannelMessage';
import sendChannelImage from 'events/account/sendChannelImage';
import joinServer from 'events/account/joinServer';
import toggleServerInvites from 'events/account/toggleServerInvites';
import regenerateServerInvite from 'events/account/regenerateServerInvite';
import deleteChannelMessage from 'events/account/deleteChannelMessage';
import renameChannel from 'events/account/renameChannel';
import sendPost from 'events/account/sendPost';
import fetchPost from 'events/account/fetchPost';
import leaveServer from 'events/account/leaveServer';
import kickMember from 'events/account/kickMember';
import banMember from 'events/account/banMember';
import unbanMember from 'events/account/unbanMember';
import updateConnectionSpotify from 'events/account/updateConnectionSpotify';
import removeConnectionSpotify from 'events/account/removeConnectionSpotify';
import removeConnectionGithub from 'events/account/removeConnectionGithub';
import updateConnectionGithub from 'events/account/updateConnectionGithub';

import { EventExportTemplate } from 'interfaces/all';

const accountTemplate: EventExportTemplate = {
    fetchProfileId,
    fetchProfileData,
    logout,
    updateProfileData,
    sendMessage,
    fetchMessages,
    deleteMessage,
    updateProfileStatus,
    fetchConvos,
    startTyping,
    finishTyping,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    createDM,
    sendImage,
    fetchDashboard,
    fetchProfilePosts,
    closeDM,
    likePost,
    requestData,
    deleteAccount,
    sharePost,
    deletePost,
    fetchTenor,
    applyTurbo,
    refundTurbo,
    fetchTurboCH,
    fetchLatestVersion,
    removeFCM,
    createServer,
    deleteServer,
    fetchServers,
    createChannel,
    deleteChannel,
    fetchChannelMessages,
    sendChannelMessage,
    sendChannelImage,
    joinServer,
    toggleServerInvites,
    regenerateServerInvite,
    deleteChannelMessage,
    renameChannel,
    sendPost,
    fetchPost,
    leaveServer,
    kickMember,
    banMember,
    unbanMember,
    updateConnectionSpotify,
    removeConnectionSpotify,
    removeConnectionGithub,
    updateConnectionGithub,
};

export default accountTemplate;
