import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

console.log("Arrancando el script de migración...");

// 🔥 Definimos los nombres directamente aquí para evitar problemas
// con los imports y alias (@/) de Next.js en Node puro.
const familiesCollectionName = "families";
const invitationsCollectionName = "invitations";

// Cargamos variables de entorno
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Validación temprana para asegurar que el .env se leyó correctamente
if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ ERROR: Faltan variables de entorno. Verifica que el comando --env-file=.env está leyendo el archivo correcto.",
  );
  process.exit(1);
}

// Inicialización segura de Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  console.log("Firebase Admin inicializado correctamente.");
}

const adminDb = getFirestore();

async function migrateQuotes() {
  console.log("Buscando invitaciones en la base de datos...");

  const invitationsSnap = await adminDb
    .collection(invitationsCollectionName)
    .get();

  let totalQuotesMigrated = 0;
  console.log(
    `Se encontraron ${invitationsSnap.size} invitaciones. Procesando...`,
  );

  for (const invDoc of invitationsSnap.docs) {
    const familiesSnap = await invDoc.ref
      .collection(familiesCollectionName)
      .get();
    if (familiesSnap.empty) continue;

    let batch = adminDb.batch();
    let batchCount = 0;
    let invitationQuotesCount = 0;

    for (const familyDoc of familiesSnap.docs) {
      // 1. Leer de la RUTA VIEJA: invitations/{invId}/families/{familyId}/quotes/quote
      const oldQuoteSnap = await familyDoc.ref
        .collection("quotes")
        .doc("quote")
        .get();

      if (oldQuoteSnap.exists) {
        // 2. Apuntar a la RUTA NUEVA: invitations/{invId}/quotes/{familyId}
        const newQuoteRef = invDoc.ref.collection("quotes").doc(familyDoc.id);

        const quoteData = oldQuoteSnap.data()!;

        // Inyectamos el familyId por seguridad (para seguir la nueva convención)
        if (!quoteData.familyId) {
          quoteData.familyId = familyDoc.id;
        }

        // 3. Agregar la escritura al lote
        batch.set(newQuoteRef, quoteData, { merge: true });
        batchCount++;
        invitationQuotesCount++;
        totalQuotesMigrated++;

        // Firebase permite máximo 500 operaciones por batch.
        // Si llegamos a 400, comiteamos y abrimos uno nuevo.
        if (batchCount >= 400) {
          await batch.commit();
          batch = adminDb.batch();
          batchCount = 0;
        }
      }
    }

    // Comitear los remanentes de la invitación actual
    if (batchCount > 0) {
      await batch.commit();
    }

    if (invitationQuotesCount > 0) {
      console.log(
        `✓ Invitación ${invDoc.id} — ${invitationQuotesCount} mensajes migrados.`,
      );
    }
  }

  console.log(
    `\n🎉 Migración completa. Total: ${totalQuotesMigrated} mensajes migrados exitosamente.`,
  );
}

// Ejecutar script
migrateQuotes().catch((error) => {
  console.error("❌ Error durante la migración:", error);
  process.exit(1);
});
