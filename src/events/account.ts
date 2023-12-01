// ******************** //
// Events which are only usable while logged in.
// ******************** //

import fetchProfileId from 'events/account/fetchProfileId';
import fetchProfileData from 'events/account/fetchProfileData';
import logout from 'events/account/logout';
import updateProfileData from 'events/account/updateProfileData';
import createRoom from 'events/account/createRoom';
import updateRoomData from 'events/account/updateRoomData';
import leaveRoom from 'events/account/leaveRoom';
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
import addRoomMember from 'events/account/addRoomMember';
import removeRoomMember from 'events/account/removeRoomMember';
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
import fetchThemes from 'events/account/fetchThemes';
import applyTheme from 'events/account/applyTheme';
import createTheme from 'events/account/createTheme';
import applyPro from 'events/account/applyPro';
import refundPro from 'events/account/refundPro';
import fetchPROCH from 'events/account/fetchPROCH';
import fetchLatestVersion from 'events/account/fetchLatestVersion';
import removeFCM from 'events/account/removeFCM';
import canPost from 'events/account/canPost';
import createServer from 'events/account/createServer';
import deleteServer from 'events/account/deleteServer';

import { EventExportTemplate } from 'interfaces/all';

const accountTemplate: EventExportTemplate = {
    fetchProfileId,
    fetchProfileData,
    logout,
    updateProfileData,
    createRoom,
    updateRoomData,
    leaveRoom,
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
    addRoomMember,
    removeRoomMember,
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
    fetchThemes,
    applyTheme,
    createTheme,
    applyPro,
    refundPro,
    fetchPROCH,
    fetchLatestVersion,
    removeFCM,
    canPost,
    createServer,
    deleteServer,
};

export default accountTemplate;
