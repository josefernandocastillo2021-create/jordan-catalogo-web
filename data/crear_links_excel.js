const XLSX = require('xlsx');

const headers = ['id', 'nombre', 'categoria', 'foto1', 'foto2', 'foto3', 'foto4'];

const productos = [
  // ESTUFAS
  ['GS-K50-Q01B', 'Cocina Eureka 4Q con Horno Negro', 'Estufas', 'https://drive.google.com/file/d/1ygEPAIMrExVhfN5Gz6misTEvBOQ5dFUm/view', '', '', ''],
  ['GS-K50-Q01G', 'Cocina Eureka 4Q con Horno Gris', 'Estufas', 'https://drive.google.com/file/d/1K-fEl0wnqdWDBEWJlY-ChH1IDbsyKoMt/view', '', '', ''],
  ['GS-K50-Q02B', 'Cocina Eureka 4Q con Horno Negro Parrilla Reforzada', 'Estufas', 'https://drive.google.com/file/d/17mfSzunqTq96Mfgg4U0kbfdHZAwYYRKD/view', '', '', ''],
  ['GS-K50-Q02G', 'Cocina Eureka 4Q con Horno Gris Parrilla Reforzada', 'Estufas', 'https://drive.google.com/file/d/1gwczPdhTgJUAja0dr9XuvUzDJFeJOsBJ/view', '', '', ''],
  ['GS-K76Q01B', 'Cocina Eureka 6Q con Horno Negro', 'Estufas', 'https://drive.google.com/file/d/19h47kq3JL-ExVRSo0u26NYjoYFRxfkKw/view', '', '', ''],
  ['GS-K76Q01G', 'Cocina Eureka 6Q con Horno Gris', 'Estufas', 'https://drive.google.com/file/d/1pwQBDjXBI61UUfRj6NE2VIXgi4c_fy6C/view', '', '', ''],
  ['GS-K76Q02S', 'Cocina Eureka 6Q Acero Parrilla Reforzada', 'Estufas', 'https://drive.google.com/file/d/1EyA8_k-K1z31uG8aSlq3U_izx_vC6_to/view', '', '', ''],
  ['M-004SL', 'Cocina Eureka 4Q Meseta 2 Niveles', 'Estufas', 'https://drive.google.com/file/d/1IErexl88HHKQYFiFPVi8JX3yrwyNcRsa/view', '', '', ''],
  ['MF-004Y', 'Cocina Eureka 4Q Meseta Negro', 'Estufas', 'https://drive.google.com/file/d/16ZMk9OtfzhzWtXZ1Tv8nRO-D4X_DwS5F/view', '', '', ''],

  // COMEDORES (sin fotos aún)
  ['COM-001', 'Juego de Comedor 4 Sillas Moderno', 'Comedores', '', '', '', ''],
  ['COM-002', 'Juego de Comedor 6 Sillas Clásico', 'Comedores', '', '', '', ''],
  ['COM-003', 'Juego de Comedor 4 Sillas Minimalista', 'Comedores', '', '', '', ''],
  ['COM-004', 'Juego de Comedor 6 Sillas Colonial', 'Comedores', '', '', '', ''],
  ['COM-005', 'Juego de Comedor 8 Sillas Ejecutivo', 'Comedores', '', '', '', ''],
  ['COM-006', 'Mesa de Comedor Extensible 4-6 Personas', 'Comedores', '', '', '', ''],
  ['COM-007', 'Juego de Comedor 3 Sillas Compacto', 'Comedores', '', '', '', ''],
  ['COM-008', 'Juego de Comedor 4 Sillas Rústico', 'Comedores', '', '', '', ''],
  ['COM-009', 'Juego de Comedor 4 Sillas Industrial', 'Comedores', '', '', '', ''],

  // REFRIGERADORAS
  ['REF-001', 'Refrigeradora 2 Puertas 14 Pies', 'Refrigeradoras', '', '', '', ''],
  ['REF-002', 'Refrigeradora Compacta 7 Pies', 'Refrigeradoras', '', '', '', ''],
  ['REF-003', 'Refrigeradora Side by Side 22 Pies', 'Refrigeradoras', '', '', '', ''],
  ['REF-004', 'Refrigeradora 1 Puerta 9 Pies', 'Refrigeradoras', '', '', '', ''],
  ['REF-005', 'Refrigeradora French Door 26 Pies', 'Refrigeradoras', '', '', '', ''],
  ['REF-006', 'Refrigeradora 2 Puertas 17 Pies No Frost', 'Refrigeradoras', '', '', '', ''],
  ['REF-007', 'Refrigeradora Minibar 3.5 Pies', 'Refrigeradoras', '', '', '', ''],
  ['REF-008', 'Refrigeradora 2 Puertas 20 Pies', 'Refrigeradoras', '', '', '', ''],

  // LAVADORAS
  ['LAV-001', 'Lavadora Automática 12 Kg', 'Lavadoras', '', '', '', ''],
  ['LAV-002', 'Lavadora Semiautomática 8 Kg', 'Lavadoras', '', '', '', ''],
  ['LAV-003', 'Lavadora Automática 16 Kg', 'Lavadoras', '', '', '', ''],
  ['LAV-004', 'Lavadora Carga Frontal 8 Kg', 'Lavadoras', '', '', '', ''],
  ['LAV-005', 'Lavadora Automática 10 Kg', 'Lavadoras', '', '', '', ''],
  ['LAV-006', 'Lavadora Semiautomática 10 Kg', 'Lavadoras', '', '', '', ''],

  // CONGELADORES
  ['CON-001', 'Congelador Horizontal 200 Litros', 'Congeladores', '', '', '', ''],
  ['CON-002', 'Congelador Vertical 150 Litros', 'Congeladores', '', '', '', ''],
  ['CON-003', 'Congelador Horizontal 350 Litros', 'Congeladores', '', '', '', ''],
  ['CON-004', 'Congelador Horizontal 100 Litros', 'Congeladores', '', '', '', ''],
  ['CON-005', 'Congelador Vertical 280 Litros', 'Congeladores', '', '', '', ''],

  // MICROONDAS
  ['MIC-001', 'Microondas Digital 0.9 Pies', 'Microondas', '', '', '', ''],
  ['MIC-002', 'Microondas Manual 1.1 Pies', 'Microondas', '', '', '', ''],
  ['MIC-003', 'Microondas Digital 1.3 Pies 1000W', 'Microondas', '', '', '', ''],
  ['MIC-004', 'Microondas con Grill 1.1 Pies', 'Microondas', '', '', '', ''],
  ['MIC-005', 'Microondas Inverter 2.0 Pies', 'Microondas', '', '', '', ''],

  // PEQUEÑOS ELECTRODOMÉSTICOS
  ['PEQ-001', 'Freidora de Aire Ras 3.5 Litros', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-002', 'Licuadora Ras 1.5 Litros', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-003', 'Plancha Ras Vapor Antiadherente', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-004', 'Waflera Ras Doble', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-005', 'Estufa Eléctrica de Mesa Ras 1 Hornilla', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-006', 'Estufa Eléctrica de Mesa Ras 2 Hornillas', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-007', 'Procesador de Alimentos Ras 1.5 Litros', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-008', 'Freidora de Aire Ras 5.5 Litros', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-009', 'Tostadora Ras 4 Ranuras', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-010', 'Exprimidor Ras Eléctrico', 'Pequeños Electrodomésticos', '', '', '', ''],
  ['PEQ-011', 'Hervidor Eléctrico Ras 1.7 Litros', 'Pequeños Electrodomésticos', '', '', '', ''],
];

const wb = XLSX.utils.book_new();
const wsData = [headers, ...productos];
const ws = XLSX.utils.aoa_to_sheet(wsData);

ws['!cols'] = [
  {wch:14}, {wch:45}, {wch:26}, {wch:65}, {wch:65}, {wch:65}, {wch:65}
];

ws['!freeze'] = { xSplit: 0, ySplit: 1 };
ws['!autofilter'] = { ref: 'A1:G1' };

XLSX.utils.book_append_sheet(wb, ws, 'Links Imagenes');
XLSX.writeFile(wb, 'links_imagenes.xlsx');
console.log(`Excel creado con ${productos.length} productos.`);
