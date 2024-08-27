import Papa from 'papaparse'
import { writeBatch, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

console.log('Hola, Webpack!');


let currentId = 1000;


async function products(params) {
  const usuarios = collection(db, 'User');
  
  const usuariosSnapshot = await docs.map(doc => doc.data )
}





// Manejar el evento de carga del archivo
document.getElementById('uploadButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('csvFileInput');
  if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      await processCsvAndWriteToFirestore(file, "Products");
  } else {
      console.log("No file selected.");
  }
});

// Procesar el CSV y escribirlo en Firestore
async function processCsvAndWriteToFirestore(file, collectionPath) {
  try {
      const data = await readCsv(file);
      if (data.length > 0) {
          await writeBatchToFirestore(data, collectionPath);
      } else {
          console.log("No data to write.");
      }
  } catch (error) {
      console.error("Error processing CSV:", error);
  }
}

// Leer el archivo CSV usando PapaParse
function readCsv(file) {
  return new Promise((resolve, reject) => {
      Papa.parse(file, {
          header: true,
          complete: function(results) {
              //resolve(results.data);

              // Limpiar los datos para eliminar campos en blanco
              const cleanedData = results.data.map(row => {
                const cleanedRow = {};
                for (let key in row) {
                    if (row[key].trim()) { // Solo agregar campos que no estén vacíos
                        cleanedRow[key] = row[key].trim();
                    }
                }

                return cleanedRow;
            });

            resolve(cleanedData); // Resolver la promesa con los datos limpiados

          },
          error: function(error) {
              reject(error);
          }
      });
  });
}


// Escribir datos en Firestore en un lote
async function writeBatchToFirestore(data, collectionPath) {
  const batch = writeBatch(db);

  let counterInsert = 0
  data.forEach(item => {
      const docRef = doc(db, collectionPath, generateUniqueId());
      batch.set(docRef, item);
      console.log(counterInsert++)
  });

  try {
      await batch.commit();
      console.log("Batch write successful");
  } catch (error) {
      console.error("Batch write failed: ", error);
  }
}

// Generar un ID único para los documentos
function generateUniqueId() {
  //return `id_${Math.random().toString(36).substr(2, 9)}`;
  currentId += 1; // Incrementa el ID en 1
    return `id_${currentId}`;
}
