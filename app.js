// ============================================================
// LOCAL TUITION - FIREBASE APP
// ============================================================

// Firebase imports

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// ============================================================
// 1. YOUR FIREBASE CONFIG
// ============================================================

// Firebase Console → Project Settings → Your apps → Web App
// වලින් මේ values ගන්න.

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.firebasestorage.app",

  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

  appId: "YOUR_APP_ID"

};


// ============================================================
// 2. INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================================================
// 3. AUTH STATE
// ============================================================

let currentUser = null;


onAuthStateChanged(auth, user => {

  currentUser = user;

  if (user) {

    console.log("Logged in:", user.email);

    showToast("Welcome back!");

  } else {

    console.log("No user logged in");

  }

});


// ============================================================
// 4. LOGIN
// ============================================================

window.loginUser = async function(event) {

  event.preventDefault();

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    closeModal("loginModal");

    showToast("Login successful!");

  } catch (error) {

    console.error(error);

    showToast(getFirebaseError(error));

  }

};


// ============================================================
// 5. REGISTER
// ============================================================

window.registerUser = async function(event) {

  event.preventDefault();


  const name =
    document.getElementById("registerName").value.trim();

  const email =
    document.getElementById("registerEmail").value.trim();

  const phone =
    document.getElementById("registerPhone").value.trim();

  const password =
    document.getElementById("registerPassword").value;


  try {

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = result.user;


    // Save user profile in Firestore

    await setDoc(
      doc(db, "users", user.uid),
      {

        name: name,

        email: email,

        phone: phone,

        role: "teacher",

        status: "active",

        createdAt: serverTimestamp()

      }
    );


    closeModal("registerModal");

    showToast("Account created successfully!");

  } catch (error) {

    console.error(error);

    showToast(getFirebaseError(error));

  }

};


// ============================================================
// 6. POST ADVERTISEMENT
// ============================================================

window.submitAd = async function(event) {

  event.preventDefault();


  // User must login first

  if (!currentUser) {

    closeModal("postAdModal");

    openLogin();

    showToast("Please login first.");

    return;

  }


  const data = {

    title:
      document.getElementById("adTitle").value.trim(),

    teacherName:
      document.getElementById("teacherName").value.trim(),

    subject:
      document.getElementById("adSubject").value,

    grade:
      document.getElementById("adGrade").value,

    district:
      document.getElementById("adDistrict").value,

    city:
      document.getElementById("adCity").value.trim(),

    classType:
      document.getElementById("classType").value,

    fee:
      document.getElementById("adFee").value.trim(),

    phone:
      document.getElementById("adPhone").value.trim(),

    whatsapp:
      document.getElementById("adWhatsapp").value.trim(),

    description:
      document.getElementById("adDescription").value.trim(),

    userId:
      currentUser.uid,

    featured: false,

    status: "pending",

    createdAt:
      serverTimestamp()

  };


  try {

    await addDoc(
      collection(db, "advertisements"),
      data
    );


    closeModal("postAdModal");

    document.querySelector("#postAdModal form").reset();

    showToast(
      "Advertisement submitted for approval!"
    );


  } catch (error) {

    console.error(error);

    showToast(
      "Could not submit advertisement."
    );

  }

};


// ============================================================
// 7. LOAD FEATURED ADS
// ============================================================

async function loadFeaturedAds() {

  const container =
    document.getElementById("featuredAds");


  try {

    const adsQuery = query(

      collection(db, "advertisements"),

      where("status", "==", "active"),

      where("featured", "==", true),

      limit(6)

    );


    const snapshot =
      await getDocs(adsQuery);


    container.innerHTML = "";


    if (snapshot.empty) {

      container.innerHTML = `
        <div class="loading">
          No featured classes yet.
        </div>
      `;

      return;

    }


    snapshot.forEach(docSnap => {

      createAdCard(
        docSnap.id,
        docSnap.data(),
        container
      );

    });


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="loading">
        Unable to load classes.
      </div>
    `;

  }

}


// ============================================================
// 8. CREATE AD CARD
// ============================================================

function createAdCard(id, ad, container) {

  const card =
    document.createElement("div");

  card.className = "ad-card";


  card.innerHTML = `

    <div class="ad-image">

      <span>📚</span>

      ${
        ad.featured
          ? '<div class="featured-tag">⭐ FEATURED</div>'
          : ''
      }

    </div>


    <div class="ad-content">

      <h3>
        ${escapeHTML(ad.title || "Tuition Class")}
      </h3>


      <div class="ad-teacher">

        👨‍🏫
        ${escapeHTML(ad.teacherName || "")}

      </div>


      <div class="ad-info">

        <span>📚 ${escapeHTML(ad.subject || "")}</span>

        <span>🎓 ${escapeHTML(ad.grade || "")}</span>

        <span>📍 ${escapeHTML(ad.city || "")}</span>

      </div>


      <button
        class="view-ad"
        onclick="viewAdvertisement('${id}')">

        View Advertisement →

      </button>

    </div>

  `;


  container.appendChild(card);

}


// ============================================================
// 9. SEARCH
// ============================================================

window.searchAds = async function() {

  const subject =
    document.getElementById("subjectFilter").value;

  const grade =
    document.getElementById("gradeFilter").value;

  const district =
    document.getElementById("districtFilter").value;


  let filters = [];


  filters.push(
    where("status", "==", "active")
  );


  if (subject) {

    filters.push(
      where("subject", "==", subject)
    );

  }


  if (grade) {

    filters.push(
      where("grade", "==", grade)
    );

  }


  if (district) {

    filters.push(
      where("district", "==", district)
    );

  }


  try {

    const q = query(
      collection(db, "advertisements"),
      ...filters,
      limit(50)
    );


    const snapshot =
      await getDocs(q);


    const container =
      document.getElementById("featuredAds");


    container.innerHTML = "";


    if (snapshot.empty) {

      container.innerHTML = `
        <div class="loading">
          No classes found for your search.
        </div>
      `;

    }


    snapshot.forEach(docSnap => {

      createAdCard(
        docSnap.id,
        docSnap.data(),
        container
      );

    });


    document
      .getElementById("classes")
      ?.scrollIntoView();


  } catch (error) {

    console.error(error);

    showToast(
      "Search failed. Please try again."
    );

  }

};


// ============================================================
// 10. SELECT SUBJECT
// ============================================================

window.selectSubject = function(subject) {

  document.getElementById(
    "subjectFilter"
  ).value = subject;

  searchAds();

};


// ============================================================
// 11. VIEW AD
// ============================================================

window.viewAdvertisement = function(id) {

  // V1 placeholder.
  // Next step: create professional advertisement details page.

  showToast(
    "Advertisement details page coming next."
  );

};


// ============================================================
// 12. OPEN LOGIN
// ============================================================

window.openLogin = function() {

  closeModal("registerModal");

  closeModal("postAdModal");

  document
    .getElementById("loginModal")
    .classList.add("show");

};


// ============================================================
// 13. OPEN REGISTER
// ============================================================

window.openRegister = function() {

  closeModal("loginModal");

  document
    .getElementById("registerModal")
    .classList.add("show");

};


// ============================================================
// 14. OPEN POST AD
// ============================================================

window.openPostAd = function() {

  if (!currentUser) {

    openLogin();

    showToast(
      "Login required to post an advertisement."
    );

    return;

  }


  document
    .getElementById("postAdModal")
    .classList.add("show");

};


// ============================================================
// 15. CLOSE MODAL
// ============================================================

window.closeModal = function(id) {

  document
    .getElementById(id)
    .classList.remove("show");

};


// ============================================================
// 16. MOBILE MENU
// ============================================================

window.toggleMenu = function() {

  showToast("Mobile navigation coming soon.");

};


// ============================================================
// 17. SHOW ALL ADS
// ============================================================

window.showAllAds = function() {

  document
    .getElementById("subjectFilter")
    .value = "";

  document
    .getElementById("gradeFilter")
    .value = "";

  document
    .getElementById("districtFilter")
    .value = "";

  searchAds();

};


// ============================================================
// 18. TOAST
// ============================================================

window.showToast = function(message) {

  const toast =
    document.getElementById("toast");


  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(() => {

    toast.classList.remove("show");

  }, 3500);

};


// ============================================================
// 19. FIREBASE ERROR TRANSLATION
// ============================================================

function getFirebaseError(error) {

  switch (error.code) {

    case "auth/invalid-email":
      return "Invalid email address.";

    case "auth/user-not-found":
      return "Account not found.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/email-already-in-use":
      return "This email is already registered.";

    case "auth/weak-password":
      return "Password should contain at least 6 characters.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    default:
      return "Something went wrong. Please try again.";

  }

}


// ============================================================
// 20. SECURITY - ESCAPE HTML
// ============================================================

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


// ============================================================
// 21. INITIAL LOAD
// ============================================================

loadFeaturedAds();
