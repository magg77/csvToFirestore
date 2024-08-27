import Papa from 'papaparse';
import { writeBatch, doc, getDocs, collection} from "firebase/firestore";
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

        // Verificar si el objeto promociones está vacío
        const tienePromocion = Object.keys(promociones).length > 0;

        return {
            nombre: row['nombre'],
            unidad: row['unidad'],
            precio: parseFloat(row['precio']),
            ...(tienePromocion && { promociones }) // Solo incluir promociones si existen
        };
    });
}

// Escribir datos en Firestore en un lote
async function writeBatchToFirestore(data, collectionPath) {
  const batch = writeBatch(db);

  data.forEach(item => {
      const docRef = doc(db, collectionPath, generateUniqueId());
      batch.set(docRef, item);
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





// Llamar a la función con el botón de exportación
document.getElementById('exportButton').addEventListener('click', () => {
    exportProductsToCsv('Products');
});


async function exportProductsToCsv(collectionPath) {
    try {
        // Obtener todos los documentos de la colección
        const querySnapshot = await getDocs(collection(db, collectionPath));

        // Crear un array para almacenar los datos
        const data = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            data.push({
                nombre: docData.nombre,
                unidad: docData.unidad,
                precio: docData.precio,
                'promociones.descuento': docData.promociones?.descuento || '',
                'promociones.fechaInicio': docData.promociones?.fechaInicio || '',
                'promociones.fechaFin': docData.promociones?.fechaFin || ''
            });
        });

        // Convertir los datos a CSV
        const csv = Papa.unparse(data);

        // Crear un enlace para descargar el archivo CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.csv';
        a.click();
        URL.revokeObjectURL(url); // Liberar la URL del blob

        console.log("CSV generated and download initiated.");
    } catch (error) {
        console.error("Error exporting to CSV:", error);
    }
}

