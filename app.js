// ============================================
// APE TEACHER - FIREBASE APP
// ============================================

// Firebase App
import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

// Firebase Authentication
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase Firestore
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit
} from
"https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


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
// MODAL FUNCTIONS
// ============================================

window.openLogin = function () {

  document
    .getElementById("loginModal")
    .classList.add("active");

};


window.openRegister = function () {

  document
    .getElementById("registerModal")
    .classList.add("active");

};


window.closeModals = function () {

  document
    .getElementById("loginModal")
    .classList.remove("active");

  document
    .getElementById("registerModal")
    .classList.remove("active");

};


window.switchToRegister = function () {

  closeModals();

  openRegister();

};


window.switchToLogin = function () {

  closeModals();

  openLogin();

};


// ============================================
// REGISTER USER
// ============================================

window.registerUser = async function () {

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

  if (!name || !email || !password) {

    showToast(
      "Please fill all fields."
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

    // Create Firebase account

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    // Save user information
    // to Firestore

    await addDoc(
      collection(db, "users"),
      {

        uid: user.uid,

        name: name,

        email: email,

        role: role,

        createdAt:
          new Date().toISOString()

      }
    );


    showToast(
      "Account created successfully!"
    );


    closeModals();


    // Clear fields

    document.getElementById(
      "registerName"
    ).value = "";

    document.getElementById(
      "registerEmail"
    ).value = "";

    document.getElementById(
      "registerPassword"
    ).value = "";


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    showToast(
      getFirebaseError(error.code)
    );

  }

};


// ============================================
// LOGIN USER
// ============================================

window.loginUser = async function () {

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

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    showToast(
      "Login successful!"
    );


    closeModals();


    document.getElementById(
      "loginEmail"
    ).value = "";

    document.getElementById(
      "loginPassword"
    ).value = "";


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    showToast(
      getFirebaseError(error.code)
    );

  }

};


// ============================================
// FIREBASE AUTH STATE
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
      doc => {

        const ad =
          doc.data();


        container.innerHTML += `

          <div
            class="ad-card"
            onclick="viewAdvertisement('${doc.id}')"
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


    container.innerHTML = `

      <div class="empty">

        Unable to load classes.

      </div>

    `;

  }

}


// ============================================
// VIEW ADVERTISEMENT
// ============================================

window.viewAdvertisement =
function (id) {

  console.log(
    "Advertisement ID:",
    id
  );


  showToast(
    "Advertisement details coming soon."
  );

};


// ============================================
// SEARCH
// ============================================

window.searchTeachers =
function () {

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
    "Search system will be connected next."
  );

};


// ============================================
// SELECT SUBJECT
// ============================================

window.selectSubject =
function (subject) {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (input) {

    input.value =
      subject;

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

};


// ============================================
// LOAD ALL ADS
// ============================================

window.loadAllAds =
function () {

  showToast(
    "All classes page will be added next."
  );

};


// ============================================
// MOBILE MENU
// ============================================

window.toggleMenu =
function () {

  const links =
    document.querySelector(
      ".nav-links"
    );


  if (!links) {
    return;
  }


  if (
    links.style.display ===
    "flex"
  ) {

    links.style.display =
      "none";

  } else {

    links.style.display =
      "flex";

    links.style.flexDirection =
      "column";

  }

};


// ============================================
// TOAST MESSAGE
// ============================================

function showToast(message) {

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


  setTimeout(
    () => {

      toast.style.display =
        "none";

    },
    3000
  );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

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

function getFirebaseError(code) {

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
      "Too many attempts. Please try again later."

  };


  return (
    errors[code] ||
    "Something went wrong. Please try again."
  );

}


// ============================================
// START APPLICATION
// ============================================

loadFeaturedAds();
