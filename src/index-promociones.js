import Papa from 'papaparse'
import { writeBatch, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

console.log('Hola, Webpack!');

let currentId = 1000; // ID inicial

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
            const cleanedData = processCsvData(results.data);
            resolve(cleanedData); // Resolver la promesa con los datos limpiados
          },
          error: function(error) {
              reject(error);
          }
      });
  });
}

// Procesar y limpiar los datos del CSV
function processCsvData(data) {
    return data.map(row => {
        const promociones = {
            descuento: row['promociones.descuento'],
            fechaInicio: row['promociones.fechaInicio'],
            fechaFin: row['promociones.fechaFin']
        };

        // Eliminar campos vacíos en el mapa de promociones
        Object.keys(promociones).forEach(key => {
            if (!promociones[key] || promociones[key].trim() === '') {
                delete promociones[key];
            }
        });

        return {
            nombre: row['nombre'],
            unidad: row['unidad'],
            precio: parseFloat(row['precio']),
            promociones: promociones
        };
    });
}

// Escribir datos en Firestore en un lote
async function writeBatchToFirestore(data, collectionPath) {
  const batch = writeBatch(db);

  let counterInsert = 0;
  data.forEach(item => {
      const docRef = doc(db, collectionPath, generateUniqueId());
      batch.set(docRef, item);
      console.log(counterInsert++);
  });

  try {
      await batch.commit();
      console.log("Batch write successful");
  } catch (error) {
      console.error("Batch write failed: ", error);
  }
}

// Generar un ID único e incremental para los documentos
function generateUniqueId() {
  currentId += 1; // Incrementa el ID en 1
  return `id_${currentId}`;
}