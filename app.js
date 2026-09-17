// ============================================
// APE TEACHER - FIREBASE APP
// ============================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// ============================================
// FIREBASE CONFIG
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyC8q1b6e1wBXcSoJ7earYUloCZPqHUosKU",
  authDomain: "ape-teacher.firebaseapp.com",
  projectId: "ape-teacher",
  storageBucket: "ape-teacher.firebasestorage.app",
  messagingSenderId: "592443898913",
  appId: "1:592443898913:web:3fec4797559cf9557df760"
};


// ============================================
// INITIALIZE FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================================
// DOM READY
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  setupButtons();

  setupForms();

  setupModals();

  loadFeaturedAds();

});


// ============================================
// BUTTON SETUP
// ============================================

function setupButtons() {

  const loginBtn =
    document.getElementById("loginBtn");

  const registerBtn =
    document.getElementById("registerBtn");

  const teacherRegisterBtn =
    document.getElementById("teacherRegisterBtn");

  const searchBtn =
    document.getElementById("searchBtn");

  const menuBtn =
    document.getElementById("menuBtn");


  if (loginBtn) {

    loginBtn.addEventListener(
      "click",
      openLogin
    );

  }


  if (registerBtn) {

    registerBtn.addEventListener(
      "click",
      openRegister
    );

  }


  if (teacherRegisterBtn) {

    teacherRegisterBtn.addEventListener(
      "click",
      openRegister
    );

  }


  if (searchBtn) {

    searchBtn.addEventListener(
      "click",
      searchTeachers
    );

  }


  if (menuBtn) {

    menuBtn.addEventListener(
      "click",
      toggleMenu
    );

  }


  document
    .querySelectorAll(".subject-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          selectSubject(
            button.dataset.subject
          );

        }
      );

    });

}


// ============================================
// FORM SETUP
// ============================================

function setupForms() {

  const loginForm =
    document.getElementById("loginForm");

  const registerForm =
    document.getElementById("registerForm");


  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        await loginUser();

      }
    );

  }


  if (registerForm) {

    registerForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        await registerUser();

      }
    );

  }

}


// ============================================
// MODAL SETUP
// ============================================

function setupModals() {

  document
    .querySelectorAll("[data-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModals
      );

    });


  const switchRegister =
    document.getElementById(
      "switchRegister"
    );

  const switchLogin =
    document.getElementById(
      "switchLogin"
    );


  if (switchRegister) {

    switchRegister.addEventListener(
      "click",
      switchToRegister
    );

  }


  if (switchLogin) {

    switchLogin.addEventListener(
      "click",
      switchToLogin
    );

  }


  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (event.target === modal) {

            closeModals();

          }

        }
      );

    });

}


// ============================================
// OPEN LOGIN
// ============================================

function openLogin() {

  closeModals();

  const modal =
    document.getElementById(
      "loginModal"
    );

  if (modal) {

    modal.classList.add("active");

  }

}


// ============================================
// OPEN REGISTER
// ============================================

function openRegister() {

  closeModals();

  const modal =
    document.getElementById(
      "registerModal"
    );

  if (modal) {

    modal.classList.add("active");

  }

}


// ============================================
// CLOSE MODALS
// ============================================

function closeModals() {

  const loginModal =
    document.getElementById(
      "loginModal"
    );

  const registerModal =
    document.getElementById(
      "registerModal"
    );


  if (loginModal) {

    loginModal.classList.remove("active");

  }


  if (registerModal) {

    registerModal.classList.remove("active");

  }

}


// ============================================
// SWITCH MODALS
// ============================================

function switchToRegister() {

  closeModals();

  openRegister();

}


function switchToLogin() {

  closeModals();

  openLogin();

}


// ============================================
// REGISTER USER
// ============================================

async function registerUser() {

  const name =
    document
      .getElementById("registerName")
      .value
      .trim();


  const email =
    document
      .getElementById("registerEmail")
      .value
      .trim();


  const password =
    document
      .getElementById("registerPassword")
      .value;


  const role =
    document
      .getElementById("registerRole")
      .value;


  // Validation

  if (!name) {

    showToast(
      "Please enter your name."
    );

    return;

  }


  if (!email) {

    showToast(
      "Please enter your email."
    );

    return;

  }


  if (password.length < 6) {

    showToast(
      "Password must be at least 6 characters."
    );

    return;

  }


  try {

    showToast(
      "Creating your account..."
    );


    // Create Firebase Authentication account

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    // Create Firestore user profile

    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      {

        uid: user.uid,

        name: name,

        email: email,

        role: role,

        createdAt:
          new Date().toISOString(),

        status: "active"

      }
    );


    showToast(
      "Account created successfully! 🎉"
    );


    // Clear form

    document
      .getElementById("registerForm")
      .reset();


    setTimeout(() => {

      closeModals();

    }, 1200);


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    showToast(
      getFirebaseError(
        error.code
      )
    );

  }

}


// ============================================
// LOGIN USER
// ============================================

async function loginUser() {

  const email =
    document
      .getElementById("loginEmail")
      .value
      .trim();


  const password =
    document
      .getElementById("loginPassword")
      .value;


  if (!email || !password) {

    showToast(
      "Please enter email and password."
    );

    return;

  }


  try {

    showToast(
      "Logging in..."
    );


    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    showToast(
      "Login successful! 🎉"
    );


    document
      .getElementById("loginForm")
      .reset();


    setTimeout(() => {

      closeModals();

    }, 1000);


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    showToast(
      getFirebaseError(
        error.code
      )
    );

  }

}


// ============================================
// AUTH STATE
// ============================================

onAuthStateChanged(
  auth,
  user => {

    if (user) {

      console.log(
        "Logged in:",
        user.email
      );

    } else {

      console.log(
        "No user logged in"
      );

    }

  }
);


// ============================================
// LOAD FEATURED ADS
// ============================================

async function loadFeaturedAds() {

  const container =
    document.getElementById(
      "adsContainer"
    );


  if (!container) {

    return;

  }


  try {

    const adsQuery =
      query(

        collection(
          db,
          "advertisements"
        ),

        where(
          "status",
          "==",
          "active"
        ),

        where(
          "featured",
          "==",
          true
        ),

        limit(6)

      );


    const snapshot =
      await getDocs(
        adsQuery
      );


    if (snapshot.empty) {

      container.innerHTML = `
        <div class="empty">
          No featured classes yet.
        </div>
      `;

      return;

    }


    container.innerHTML = "";


    snapshot.forEach(
      adDocument => {

        const ad =
          adDocument.data();


        container.innerHTML += `

          <div
            class="ad-card"
            data-ad-id="${adDocument.id}"
          >

            <div class="ad-content">

              <div class="ad-tag">
                ${escapeHTML(
                  ad.subject ||
                  "Tuition"
                )}
              </div>

              <h3>
                ${escapeHTML(
                  ad.title ||
                  "Tuition Class"
                )}
              </h3>

              <div class="ad-meta">
                👨‍🏫
                ${escapeHTML(
                  ad.teacherName ||
                  "Teacher"
                )}
              </div>

              <div class="ad-meta">
                📍
                ${escapeHTML(
                  ad.district ||
                  "Sri Lanka"
                )}
              </div>

              <div class="ad-meta">
                🎓
                ${escapeHTML(
                  ad.grade ||
                  "All Grades"
                )}
              </div>

            </div>

          </div>

        `;

      }
    );


  } catch (error) {

    console.error(
      "Loading ads error:",
      error
    );


    // Don't stop the whole application
    // if advertisements collection is empty
    // or has a temporary Firestore issue.

    container.innerHTML = `
      <div class="empty">
        No featured classes yet.
      </div>
    `;

  }

}


// ============================================
// SEARCH
// ============================================

function searchTeachers() {

  const search =
    document
      .getElementById(
        "searchInput"
      )
      .value
      .trim();


  const district =
    document
      .getElementById(
        "districtFilter"
      )
      .value;


  console.log(
    "Search:",
    search
  );


  console.log(
    "District:",
    district
  );


  showToast(
    "Search system is being connected."
  );

}


// ============================================
// SELECT SUBJECT
// ============================================

function selectSubject(
  subject
) {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (input) {

    input.value = subject;

  }


  const classes =
    document.getElementById(
      "classes"
    );


  if (classes) {

    classes.scrollIntoView({
      behavior: "smooth"
    });

  }

}


// ============================================
// MOBILE MENU
// ============================================

function toggleMenu() {

  const links =
    document.getElementById(
      "navLinks"
    );


  if (!links) {

    return;

  }


  links.classList.toggle(
    "mobile-open"
  );

}


// ============================================
// TOAST
// ============================================

function showToast(
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {

    return;

  }


  toast.textContent =
    message;


  toast.style.display =
    "block";


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      () => {

        toast.style.display =
          "none";

      },
      3500
    );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(
  value
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// ============================================
// FIREBASE ERROR MESSAGES
// ============================================

function getFirebaseError(
  code
) {

  const errors = {

    "auth/email-already-in-use":
      "This email is already registered.",

    "auth/invalid-email":
      "Invalid email address.",

    "auth/weak-password":
      "Password is too weak.",

    "auth/invalid-credential":
      "Email or password is incorrect.",

    "auth/user-not-found":
      "User not found.",

    "auth/wrong-password":
      "Incorrect password.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/operation-not-allowed":
      "Email/Password login is not enabled in Firebase.",

    "auth/network-request-failed":
      "Network error. Please check your internet connection.",

    "permission-denied":
      "Firebase permission denied."

  };


  return (
    errors[code] ||
    "Something went wrong. Please try again."
  );

}
