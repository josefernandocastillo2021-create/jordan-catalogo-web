const XLSX = require('xlsx');

const headers = ['id','nombre','precio','precio_anterior','categoria','descripcion','foto1','foto2','foto3','foto4','activo','destacado'];

const productos = [
  // COMEDORES
  ['COM-001','Juego de Comedor 4 Sillas Moderno',3299,3999,'Comedores','Juego de comedor para 4 personas, mesa de madera MDF con sillas tapizadas en tela.','','','','','TRUE','TRUE'],
  ['COM-002','Juego de Comedor 6 Sillas Clásico',5499,'','Comedores','Comedor familiar para 6 personas, estructura sólida y sillas con respaldo alto.','','','','','TRUE','FALSE'],
  ['COM-003','Juego de Comedor 4 Sillas Minimalista',3799,4299,'Comedores','Diseño minimalista con patas metálicas y superficie de vidrio templado.','','','','','TRUE','FALSE'],
  ['COM-004','Juego de Comedor 6 Sillas Colonial',6499,'','Comedores','Estilo colonial en madera sólida de pino, acabado natural barnizado.','','','','','TRUE','TRUE'],
  ['COM-005','Juego de Comedor 8 Sillas Ejecutivo',8999,10500,'Comedores','Comedor ejecutivo para 8 personas ideal para salas de juntas y hogares grandes.','','','','','TRUE','FALSE'],
  ['COM-006','Mesa de Comedor Extensible 4-6 Personas',4199,4899,'Comedores','Mesa extensible, de 4 a 6 puestos con dos hojas adicionales incluidas.','','','','','TRUE','FALSE'],
  ['COM-007','Juego de Comedor 3 Sillas Compacto',2999,'','Comedores','Ideal para espacios pequeños, 3 sillas con asiento acolchado en tela gris.','','','','','TRUE','FALSE'],
  ['COM-008','Juego de Comedor 4 Sillas Rústico',4599,5200,'Comedores','Acabado rústico en madera de teca, sillas con respaldo de listones.','','','','','TRUE','TRUE'],

  // COCINAS
  ['COC-001','Cocina Eureka 4 Quemadores con Horno',4299,4899,'Cocinas','Cocina a gas 4 quemadores con horno incorporado, encendido eléctrico, color blanco.','','','','','TRUE','TRUE'],
  ['COC-002','Cocina Eureka 4 Quemadores con Patas',3499,'','Cocinas','Cocina a gas 4 quemadores con patas, sin horno, ideal para espacios pequeños.','','','','','TRUE','FALSE'],
  ['COC-003','Cocina Eureka 6 Quemadores con Horno',6299,7100,'Cocinas','Cocina profesional 6 quemadores con horno amplio, parrilla incluida.','','','','','TRUE','TRUE'],
  ['COC-004','Cocina Eureka 4 Quemadores Acero Inoxidable',4999,5599,'Cocinas','Acabado acero inoxidable, 4 quemadores, horno con timer, encendido eléctrico.','','','','','TRUE','FALSE'],
  ['COC-005','Cocina Eureka 2 Quemadores Meseta',1899,'','Cocinas','Cocina de meseta 2 quemadores a gas, portátil, ideal para cocinas pequeñas.','','','','','TRUE','FALSE'],
  ['COC-006','Cocina Eureka 6 Quemadores Acero Inoxidable',7499,8500,'Cocinas','6 quemadores en acero inoxidable con doble horno y cajón inferior de almacenamiento.','','','','','TRUE','FALSE'],

  // REFRIGERADORAS
  ['REF-001','Refrigeradora 2 Puertas 14 Pies',8999,10500,'Refrigeradoras','Refrigeradora de 14 pies cúbicos, 2 puertas, dispensador de agua, color silver.','','','','','TRUE','TRUE'],
  ['REF-002','Refrigeradora Compacta 7 Pies',4499,'','Refrigeradoras','Refrigeradora compacta ideal para habitaciones o pequeños apartamentos.','','','','','TRUE','FALSE'],
  ['REF-003','Refrigeradora Side by Side 22 Pies',18999,22000,'Refrigeradoras','Refrigeradora Side by Side con dispensador de agua y hielo, pantalla digital.','','','','','TRUE','TRUE'],
  ['REF-004','Refrigeradora 1 Puerta 9 Pies',5999,6800,'Refrigeradoras','Refrigeradora de 1 puerta 9 pies, bajo consumo eléctrico, color blanco.','','','','','TRUE','FALSE'],
  ['REF-005','Refrigeradora French Door 26 Pies',24500,'','Refrigeradoras','French Door 26 pies con cajón inferior congelador y dispensador externo.','','','','','TRUE','TRUE'],
  ['REF-006','Refrigeradora 2 Puertas 17 Pies No Frost',11500,13200,'Refrigeradoras','No Frost 17 pies, sistema de enfriamiento rápido, luz LED interior.','','','','','TRUE','FALSE'],
  ['REF-007','Refrigeradora Minibar 3.5 Pies',2999,3499,'Refrigeradoras','Minibar 3.5 pies ideal para oficinas y habitaciones, silenciosa y eficiente.','','','','','TRUE','FALSE'],

  // LAVADORAS
  ['LAV-001','Lavadora Automática 12 Kg',6299,7200,'Lavadoras','Lavadora automática de carga superior 12 kg, múltiples programas de lavado.','','','','','TRUE','TRUE'],
  ['LAV-002','Lavadora Semiautomática 8 Kg',3799,'','Lavadoras','Lavadora semiautomática de doble tina, 8 kg de capacidad, bajo consumo eléctrico.','','','','','TRUE','FALSE'],
  ['LAV-003','Lavadora Automática 16 Kg',8499,9800,'Lavadoras','Carga superior 16 kg, panel digital, 12 programas de lavado, color plata.','','','','','TRUE','TRUE'],
  ['LAV-004','Lavadora Carga Frontal 8 Kg',7299,8500,'Lavadoras','Carga frontal 8 kg, bajo consumo de agua y energía, motor inverter.','','','','','TRUE','FALSE'],
  ['LAV-005','Lavadora Automática 10 Kg',5499,'','Lavadoras','10 kg carga superior, selector de temperatura, centrifugado de alta velocidad.','','','','','TRUE','FALSE'],
  ['LAV-006','Lavadora Semiautomática 10 Kg',4299,4999,'Lavadoras','Doble tina 10 kg con temporizador integrado y tapa transparente.','','','','','TRUE','FALSE'],

  // CONGELADORES
  ['CON-001','Congelador Horizontal 200 Litros',7499,8500,'Congeladores','Congelador horizontal 200 litros, canasta interior, cierre hermético, bajo consumo.','','','','','TRUE','FALSE'],
  ['CON-002','Congelador Vertical 150 Litros',6999,'','Congeladores','Congelador vertical tipo nevera con 3 cajones, ideal para negocios y hogares.','','','','','TRUE','FALSE'],
  ['CON-003','Congelador Horizontal 350 Litros',10999,12500,'Congeladores','Gran capacidad 350 litros, doble canasta, termostato ajustable, color blanco.','','','','','TRUE','TRUE'],
  ['CON-004','Congelador Horizontal 100 Litros',5499,6200,'Congeladores','Congelador compacto 100 litros ideal para negocios pequeños y tiendas.','','','','','TRUE','FALSE'],
  ['CON-005','Congelador Vertical 280 Litros',12999,'','Congeladores','Vertical 280 litros con 4 cajones transparentes y alarma de temperatura.','','','','','TRUE','FALSE'],

  // MICROONDAS
  ['MIC-001','Microondas Digital 0.9 Pies',1899,2299,'Microondas','Microondas digital 0.9 pies cúbicos, 700W, 10 niveles de potencia, color blanco.','','','','','TRUE','FALSE'],
  ['MIC-002','Microondas Manual 1.1 Pies',1499,'','Microondas','Microondas manual 1.1 pies, 800W, control de perilla, diseño clásico.','','','','','TRUE','FALSE'],
  ['MIC-003','Microondas Digital 1.3 Pies 1000W',2499,2999,'Microondas','1.3 pies, 1000W, pantalla digital, 6 funciones preestablecidas, color negro.','','','','','TRUE','TRUE'],
  ['MIC-004','Microondas con Grill 1.1 Pies',2199,2599,'Microondas','Función grill para gratinar, 1.1 pies, 800W, color plata.','','','','','TRUE','FALSE'],
  ['MIC-005','Microondas Inverter 2.0 Pies',3899,4499,'Microondas','Tecnología inverter 2.0 pies para cocción pareja, 1200W, sensor de vapor.','','','','','TRUE','FALSE'],

  // PEQUEÑOS ELECTRODOMÉSTICOS
  ['PEQ-001','Freidora de Aire Ras 3.5 Litros',1299,1599,'Pequeños Electrodomésticos','Freidora de aire 3.5 litros, 1400W, cocina sin aceite, pantalla digital.','','','','','TRUE','TRUE'],
  ['PEQ-002','Licuadora Ras 1.5 Litros',599,'','Pequeños Electrodomésticos','Licuadora Ras 1.5 litros, 3 velocidades, vaso de vidrio resistente.','','','','','TRUE','FALSE'],
  ['PEQ-003','Plancha Ras Vapor Antiadherente',499,649,'Pequeños Electrodomésticos','Plancha de vapor con suela antiadherente cerámica, 2200W, golpe de vapor.','','','','','TRUE','FALSE'],
  ['PEQ-004','Waflera Ras Doble',699,849,'Pequeños Electrodomésticos','Waflera doble con placas antiadherentes removibles, luz indicadora de listo.','','','','','TRUE','FALSE'],
  ['PEQ-005','Estufa Eléctrica de Mesa Ras 1 Hornilla',499,'','Pequeños Electrodomésticos','Estufa eléctrica de 1 hornilla, 1000W, termostato regulable, compacta.','','','','','TRUE','FALSE'],
  ['PEQ-006','Estufa Eléctrica de Mesa Ras 2 Hornillas',799,950,'Pequeños Electrodomésticos','2 hornillas eléctricas, 1500W total, base antideslizante, fácil limpieza.','','','','','TRUE','FALSE'],
  ['PEQ-007','Procesador de Alimentos Ras 1.5 Litros',899,1099,'Pequeños Electrodomésticos','Procesador multifunción con 3 cuchillas intercambiables, bowl de 1.5 litros.','','','','','TRUE','TRUE'],
  ['PEQ-008','Freidora de Aire Ras 5.5 Litros',1699,1999,'Pequeños Electrodomésticos','Capacidad familiar 5.5 litros, pantalla táctil, 8 programas preestablecidos.','','','','','TRUE','TRUE'],
  ['PEQ-009','Tostadora Ras 4 Ranuras',599,749,'Pequeños Electrodomésticos','Tostadora de 4 ranuras anchas, 6 niveles de tostado, bandeja de migas extraíble.','','','','','TRUE','FALSE'],
  ['PEQ-010','Exprimidor Ras Eléctrico',449,'','Pequeños Electrodomésticos','Exprimidor eléctrico con 2 conos intercambiables, anti-goteo, jarra de 1 litro.','','','','','TRUE','FALSE'],
  ['PEQ-011','Hervidor Eléctrico Ras 1.7 Litros',549,699,'Pequeños Electrodomésticos','Hervidor eléctrico 1.7 litros, 1500W, apagado automático, base giratoria 360°.','','','','','TRUE','FALSE'],
  ['COM-009','Juego de Comedor 4 Sillas Industrial',4899,5699,'Comedores','Estilo industrial con estructura de hierro negro y madera de pino, 4 taburetes altos.','','','','','TRUE','FALSE'],
  ['REF-008','Refrigeradora 2 Puertas 20 Pies',14999,17500,'Refrigeradoras','20 pies con tecnología inverter, dispensador externo de agua y hielo, color acero.','','','','','TRUE','TRUE'],
];

const wb = XLSX.utils.book_new();
const wsData = [headers, ...productos];
const ws = XLSX.utils.aoa_to_sheet(wsData);

ws['!cols'] = [
  {wch:12},{wch:45},{wch:12},{wch:14},{wch:26},{wch:58},
  {wch:18},{wch:18},{wch:18},{wch:18},{wch:9},{wch:10}
];

ws['!freeze'] = { xSplit: 0, ySplit: 1 };
ws['!autofilter'] = { ref: 'A1:L1' };

XLSX.utils.book_append_sheet(wb, ws, 'Productos');
XLSX.writeFile(wb, 'productos_jordan.xlsx');
console.log(`Excel creado con ${productos.length} productos.`);
