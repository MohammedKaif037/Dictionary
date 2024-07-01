// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDc5HPC-UrAkAXtzhhYBpx2e-aMt3dhCE",
  authDomain: "dictionary-d2dfd.firebaseapp.com",
  databaseURL: "https://dictionary-d2dfd-default-rtdb.firebaseio.com",
  projectId: "dictionary-d2dfd",
  storageBucket: "dictionary-d2dfd.appspot.com",
  messagingSenderId: "698068097802",
  appId: "1:698068097802:web:fcaf21c48a091741d8f8f3",
  measurementId: "G-J8XNK082N3"
};

firebase.initializeApp(firebaseConfig);

// Reference to the Firebase Realtime Database
const database = firebase.database();

// Check authentication state and update UI
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById('userEmail').style.display = 'block';
    document.getElementById('logoutItem').style.display = 'block';
    document.getElementById('loginItem').style.display = 'none';
    document.getElementById('registerItem').style.display = 'none';
    document.getElementById('userEmailLink').innerText = user.email;

    // Load user's favorites and search history
    loadFavorites(user.uid);
    loadSearchHistory(user.uid);
  } else {
    document.getElementById('userEmail').style.display = 'none';
    document.getElementById('logoutItem').style.display = 'none';
    document.getElementById('loginItem').style.display = 'block';
    document.getElementById('registerItem').style.display = 'block';
  }
});

document.getElementById('searchButton').addEventListener('click', searchWord);
document.getElementById('favoriteButton').addEventListener('click', addToFavorites);

let favorites = [];
let searchHistory = [];

function searchWord() {
  const word = document.getElementById('searchInput').value;
  if (word === '') return;

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(response => response.json())
    .then(data => displayWordDetails(data[0]))
    .catch(error => displayErrorMessage(word));

  addToSearchHistory(word);
}

function displayWordDetails(data) {
  document.getElementById('wordTitle').innerText = data.word;
  document.getElementById('wordPhonetic').innerText = data.phonetic;
  if (data.phonetics && data.phonetics[0] && data.phonetics[0].audio) {
    document.getElementById('wordAudio').src = data.phonetics[0].audio;
    document.getElementById('wordAudio').style.display = 'block';
  } else {
    document.getElementById('wordAudio').style.display = 'none';
  }
  document.getElementById('wordPartOfSpeech').innerText = data.meanings.map(meaning => meaning.partOfSpeech).join(', ');
  document.getElementById('wordDefinition').innerText = data.meanings.map(meaning => meaning.definitions.map(def => def.definition).join(', ')).join('; ');
  document.getElementById('wordExample').innerText = data.meanings.map(meaning => meaning.definitions.map(def => def.example || '').filter(ex => ex).join(', ')).join('; ');
  document.getElementById('favoriteButton').style.display = 'inline-block';
  document.getElementById('wordDetails').classList.remove('d-none');
}

function addToFavorites() {
  const word = document.getElementById('wordTitle').innerText;
  if (!favorites.includes(word)) {
    favorites.push(word);
    displayFavorites();
    storeFavorites(firebase.auth().currentUser.uid);
  }
}

function removeFromFavorites(word) {
  favorites = favorites.filter(fav => fav !== word);
  displayFavorites();
  storeFavorites(firebase.auth().currentUser.uid);
}

function displayFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = '';
  favorites.forEach(word => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerText = word;
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger btn-sm';
    removeButton.innerHTML = '<i class="fas fa-heart-broken"></i>';
    removeButton.onclick = () => removeFromFavorites(word);
    li.appendChild(removeButton);
    li.onclick = () => displayWordDetailsFromHistoryOrFavorites(word); // Add click event to display details
    favoritesList.appendChild(li);
  });
}

function addToSearchHistory(word) {
  if (!searchHistory.includes(word)) {
    searchHistory.push(word);
    displaySearchHistory();
    storeSearchHistory(firebase.auth().currentUser.uid);
  }
}

function displaySearchHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  searchHistory.forEach(word => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerText = word;
    li.onclick = () => displayWordDetailsFromHistoryOrFavorites(word); // Add click event to display details
    historyList.appendChild(li);
  });
}

function storeFavorites(userId) {
  database.ref('users/' + userId + '/favorites').set(favorites);
}

function storeSearchHistory(userId) {
  database.ref('users/' + userId + '/searchHistory').set(searchHistory);
}

function loadFavorites(userId) {
  database.ref('users/' + userId + '/favorites').once('value').then(snapshot => {
    if (snapshot.exists()) {
      favorites = snapshot.val();
      displayFavorites();
    }
  });
}

function loadSearchHistory(userId) {
  database.ref('users/' + userId + '/searchHistory').once('value').then(snapshot => {
    if (snapshot.exists()) {
      searchHistory = snapshot.val();
      displaySearchHistory();
    }
  });
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('passcode').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Logged in:', userCredential.user.email);
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Login error:', error);
      displayLoginErrorMessage();
    });
}

function displayLoginErrorMessage() {
  alert("Invalid credentials");
}

function register() {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPasscode').value;
  const errorContainer = document.getElementById('registerError');

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Registered:', userCredential.user.email);
      window.location.href = 'login.html'; // Redirect to login page after successful registration
    })
    .catch(error => {
      console.error('Registration error:', error);
      displayRegistrationErrorMessage(error, errorContainer);
    });
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('passcode').value;
  const errorContainer = document.getElementById('loginError');

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Logged in:', userCredential.user.email);
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Login error:', error);
      displayLoginErrorMessage(error, errorContainer);
    });
}

function displayRegistrationErrorMessage(error, errorContainer) {
  let errorMessage = 'Registration error. Please try again.';
  
  if (error.code === 'auth/email-already-in-use') {
    errorMessage = 'The email address is already in use by another account.';
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = 'The email address is not valid.';
  } else if (error.code === 'auth/weak-password') {
    errorMessage = 'The password is too weak.';
  }
  
  errorContainer.innerText = errorMessage;
  errorContainer.style.display = 'block';
}

function displayLoginErrorMessage(error, errorContainer) {
  let errorMessage = 'Login error. Please try again.';

  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    errorMessage = 'Invalid credentials.';
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = 'The email address is not valid.';
  }
  
  errorContainer.innerText = errorMessage;
  errorContainer.style.display = 'block';
}



function logout() {
  firebase.auth().signOut().then(() => {
    console.log('Logged out');
    window.location.href = 'index.html';
  }).catch(error => {
    console.error('Logout error:', error);
  });
}

document.getElementById('favoritesList').addEventListener('click', function(event) {
  if (event.target && event.target.matches('li')) {
    const selectedWord = event.target.innerText;
    displayWordDetailsFromHistoryOrFavorites(selectedWord);
  }
});

document.getElementById('historyList').addEventListener('click', function(event) {
  if (event.target && event.target.matches('li')) {
    const selectedWord = event.target.innerText;
    displayWordDetailsFromHistoryOrFavorites(selectedWord);
  }
});

function displayWordDetailsFromHistoryOrFavorites(word) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(response => response.json())
    .then(data => {
      if (data.title && data.title === "No Definitions Found") {
        displayErrorMessage(word);
      } else {
        displayWordDetails(data[0]);
      }
    })
    .catch(error => displayErrorMessage(word));
}

function displayErrorMessage(word) {
  const errorContainer = document.getElementById('wordDetails');
  errorContainer.innerHTML = `<h2>${word}</h2><p>Word not found</p>`;
  errorContainer.classList.remove('d-none');
}
