// ******************** //
// The templates for each event of Fronvo to specify passed arguments.
// ******************** //

module.exports = {
    register: ['email', 'password'],
    login: ['email', 'password'],
    loginToken: ['token'],
    isLoggedIn: [],
    fetchProfileData: ['profileId'],
    fetchProfileId: [],
    logout: []
}
