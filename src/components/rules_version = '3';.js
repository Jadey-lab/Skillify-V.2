rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 🔹 USERS COLLECTION
    // Authenticated users may read user profiles; they can write only their own document.
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 🔹 USER PROGRESS COLLECTION
    match /userprogress/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 🔹 EVENTS COLLECTION
    match /myevents/{reservationId} {
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null;
      allow update: if request.auth != null &&
        request.resource.data.uid == request.auth.uid &&
        !request.resource.data.selfCheckinCode;
      allow write, delete: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin" ||
         request.resource.data.uid == request.auth.uid);
    }

    // 🔹 EVENT STATUS
    match /eventStatus/{eventId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // 🔹 STUDY SESSIONS
    match /studySessions/{sessionId} {
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    // 🔹 MENTOR BOOKINGS COLLECTION
    match /mentorBookings/{bookingId} {
      allow create: if request.auth != null &&
        request.resource.data.date is string &&
        request.resource.data.mentorId is string &&
        request.resource.data.uid is string &&
        request.resource.data.name is string &&
        request.resource.data.timestamp is timestamp;
        
      allow read: if request.auth != null &&
        (
          resource.data.uid == request.auth.uid ||
          resource.data.mentorId == request.auth.uid ||
          resource.data.mentorId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.mentorID
        );
        
      allow update, delete: if request.auth != null &&
        (
          resource.data.uid == request.auth.uid || 
          resource.data.mentorId == request.auth.uid ||
          resource.data.mentorId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.mentorID
        );
    }

    // 🔹 SCHEDULED COLLECTION
    match /scheduled/{sessionId} {
      allow create: if request.auth != null &&
        request.resource.data.date is timestamp &&
        request.resource.data.mentorID is string &&
        request.resource.data.menteeId is string &&
        request.resource.data.menteeName is string &&
        request.resource.data.createdAt is timestamp;
      allow read: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.mentorID || 
         request.auth.uid == resource.data.menteeId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "mentor");
      allow delete: if request.auth != null;
    }

    // 🔹 BOOKINGS COLLECTION
    match /bookings/{bookingId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    // 🔹 JOB LISTINGS
    match /jobListings/{jobId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    // 🔹 REQUEST STATES
    match /requestStates/{requestId} {
      allow create, update: if request.auth != null && (
        request.resource.data.uid == request.auth.uid ||
        request.resource.data.mentorId == request.auth.uid
      );
      allow delete: if request.auth != null;
    }

    // 🔹 MENTOR REQUEST ACTIONS
    match /mentorRequestActions/{actionId} {
      allow create: if request.resource.data.requestId is string &&
        request.resource.data.status in ['Accepted', 'Waitlisted', 'Rejected'] &&
        request.resource.data.mentorId is string;
      allow read: if true;
      allow update: if request.resource.data.status in ['Accepted', 'Waitlisted', 'Rejected'];
      allow delete: if request.auth != null;
    }

    // 🔹 MESSAGES
    match /messages/{messageId} {
      allow create: if request.auth != null &&
        request.resource.data.sender == request.auth.uid &&
        request.resource.data.recipient is string;
      allow read: if request.auth != null &&
        (resource.data.sender == request.auth.uid || resource.data.recipient == request.auth.uid);
      allow update, delete: if false;
    }

    // 🔹 MENTOR REQUEST OUTCOMES (Accepted, Waitlisted, Rejected)
    match /acceptedRequests/{docId} {
      allow create: if request.auth != null &&
        request.resource.data.status == 'Accepted' &&
        request.resource.data.processedAt is timestamp &&
        request.resource.data.mentorId is string;
      allow read, update, delete: if request.auth != null;
    }
    match /waitlistedRequests/{docId} {
      allow create: if request.auth != null &&
        request.resource.data.status == 'Waitlisted' &&
        request.resource.data.processedAt is timestamp &&
        request.resource.data.mentorId is string;
      allow read, update, delete: if request.auth != null;
    }
    match /rejectedRequests/{docId} {
      allow create: if request.auth != null &&
        request.resource.data.status == 'Rejected' &&
        request.resource.data.processedAt is timestamp &&
        request.resource.data.mentorId is string;
      allow read, update, delete: if request.auth != null;
    }

    // 🔹 NOTIFICATIONS COLLECTION
    // Allow an authenticated user to create a notification (which automatically
    // creates the collection if it does not yet exist). The document must include
    // a valid message, timestamp, and either a recipientId (single) or recipientIds (group).
    match /notifications/{notificationId} {
      allow create: if request.auth != null &&
        request.resource.data.message is string &&
        request.resource.data.timestamp is timestamp &&
        (
          request.resource.data.recipientId is string ||
          request.resource.data.recipientIds is list
        );
      
      allow read, update, delete: if request.auth != null &&
        (
          resource.data.recipientId == request.auth.uid ||
          (resource.data.recipientIds is list && request.auth.uid in resource.data.recipientIds)
        );
    }

    // 🔹 PROFILE IMAGES COLLECTION
    // Allow any authenticated user to read profile images.
    match /profileImages/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 🔹 DASHBOARD COLLECTION
    match /dashboard/{docId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "mentor";
    }

    // -----------------------------------------------------------------------
    // 🔹 CATCH-ALL: ALLOW CREATION OF NEW COLLECTIONS
    // For any other documents (i.e. collections not explicitly defined above),
    // allow authenticated users to create new documents which in turn creates
    // new collections. Use caution with this rule.
    match /{document=**} {
      allow create: if request.auth != null;
    }
  }
}
