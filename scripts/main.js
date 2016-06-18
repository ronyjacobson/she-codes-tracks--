'use strict';

// Initializes SheCodesTracks.
function SheCodesTracks() {
    this.checkSetup();
    this.user;

    // Shortcuts to DOM Elements.
    this.noUserPic = document.getElementById('no-user-pic');
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signOutButton = document.getElementById('sign-out');
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInSnackbar = document.getElementById('must-signin-snackbar');
    this.authContainer= document.getElementById('firebaseui-auth-container');

    this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
SheCodesTracks.prototype.initFirebase = function () {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

    // FirebaseUI config.
    this.uiConfig = {
        'signInSuccessUrl': 'index.html',
        'signInOptions': [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        'tosUrl': '<your-tos-url>',
        'callbacks': {
            'signInSuccess': function (currentUser, credential, redirectUrl) {
                return false;
            }
        }
    };
    this.ui = new firebaseui.auth.AuthUI(this.auth);
    this.ui.start('#firebaseui-auth-container', this.uiConfig);
};

// Signs-out of SheCodes; Tracks.
SheCodesTracks.prototype.signOut = function () {
    // Sign out of Firebase.
    this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
SheCodesTracks.prototype.onAuthStateChanged = function (user) {
    if (user) { // User is signed in!
        this.user = user;
        // Get profile pic and user's name from the Firebase user object.
        var profilePicUrl = user.photoURL;
        var userName = user.displayName;
        var email = user.email;
        var uid = user.uid;
        var providerData = user.providerData;

        // Set the user's profile pic and name.
        this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
        this.userName.textContent = userName;

        // Show user's profile and sign-out button.
        this.userName.removeAttribute('hidden');
        this.userPic.removeAttribute('hidden');
        this.signOutButton.removeAttribute('hidden');

        // Hide sign-in button.
        this.noUserPic.setAttribute('hidden', 'true');
        this.authContainer.setAttribute('hidden', 'true');


        user.getToken().then(function (accessToken) {
            document.getElementById('sign-in-status').textContent = 'Signed in';
        });

    } else { // User is signed out!
        // Hide user's profile and sign-out button.
        this.userPic.setAttribute('hidden', 'true');
        this.userName.setAttribute('hidden', 'true');
        this.signOutButton.setAttribute('hidden', 'true');
        this.authContainer.removeAttribute('hidden');
        this.noUserPic.removeAttribute('hidden');
        this.accessToken = null;

        // User is signed out.
        document.getElementById('sign-in-status').textContent = 'Signed out';

    }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
SheCodesTracks.prototype.checkSignedInWithMessage = function () {
    // Return true if the user is signed in Firebase
    if (this.auth.currentUser) {
        return true;
    }

    // Display a message to the user using a Toast.
    var data = {
        message: 'You must sign-in first',
        timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return false;
};

// Checks that the Firebase SDK has been correctly setup and configured.
SheCodesTracks.prototype.checkSetup = function () {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
        window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
            'actually a Firebase bug that occurs rarely.' +
            'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
            'and make sure the storageBucket attribute is not empty.');
    }
};

window.onload = function () {
    window.SheCodesTracks = new SheCodesTracks();
};
