import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminDb = getFirestore();

async function migrate() {
  const invitationsSnap = await adminDb.collection("invitations").get();
  let totalFamilies = 0;

  for (const invDoc of invitationsSnap.docs) {
    const guestsSnap = await invDoc.ref.collection("guests").get();
    if (guestsSnap.empty) continue;

    for (const familyDoc of guestsSnap.docs) {
      const batch = adminDb.batch();
      const newFamilyRef = invDoc.ref.collection("families").doc(familyDoc.id);

      // // 1. guests/{familyId} → families/{familyId}
      // batch.set(newFamilyRef, familyDoc.data(), { merge: true });

      // // 2. guests/{familyId}/private/contactInfo → families/{familyId}/private/contactInfo
      // const contactSnap = await familyDoc.ref
      //   .collection("private")
      //   .doc("contactInfo")
      //   .get();
      // if (contactSnap.exists) {
      //   batch.set(
      //     newFamilyRef.collection("private").doc("contactInfo"),
      //     contactSnap.data()!,
      //     { merge: true }
      //   );
      // }

      // 3. guests/{familyId}/quotes/quote → families/{familyId}/quotes/quote
      const quoteSnap = await familyDoc.ref
        .collection("quotes")
        .doc("quote")
        .get();
      if (quoteSnap.exists) {
        batch.set(
          newFamilyRef.collection("quotes").doc("quote"),
          quoteSnap.data()!,
          { merge: true },
        );
      }

      await batch.commit();
      totalFamilies++;
    }

    console.log(`✓ ${invDoc.id} — ${guestsSnap.size} quotes procesadas`);
  }

  console.log(
    `\nMigración completa. Total: ${totalFamilies} familias procesadas.`,
  );
}

migrate().catch(console.error);
