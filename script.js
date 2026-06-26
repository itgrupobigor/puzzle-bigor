let moves = 0;
let currentImage = "";
let playerName = "";
let userEmail = "";
let board = [];
let timerInterval;
let isActive = false;
let seconds = 0;

// Al cargar la página, deshabilitamos el botón "Jugar" hasta que el usuario escriba su nombre
document.getElementById("playButton").disabled = true;

// --- LOGIN CON NOMBRE ---
// Escucha cuando el usuario escribe en el campo de texto para validar el botón de Jugar y la depuración
document.getElementById("playerName").addEventListener("input", (e) => {
  const nombreCargado = e.target.value.trim();

  // Habilitar el botón Jugar si el campo no está vacío (mínimo 2 caracteres)
  if (nombreCargado.length >= 2) {
    document.getElementById("playButton").disabled = false;
  } else {
    document.getElementById("playButton").disabled = true;
  }

  // --- Validar nombre para Depuración ---
  const debugButton = document.getElementById("debugButton");
  if (nombreCargado.toLowerCase() === "admin") { // Si escribes "admin" como nombre, se muestra el botón de depuración
    debugButton.style.display = "block"; // Visible solo para ti
  } else {
    debugButton.style.display = "none";  // Para cualquier otro nombre, se oculta
  }
});

// --- BOTÓN JUGAR ---
// Busca el elemento en el HTML con id="playButton" (el botón “Jugar”).
document.getElementById("playButton").addEventListener("click", () => { // Le agrega un escuchador de eventos: cuando el usuario haga clic en ese botón, se ejecuta la función flecha () => { ... }.
  playerName = document.getElementById("playerName").value.trim() || "SinNombre"; // Obtiene el valor escrito en el campo de texto con id="playerName".
                                                                                  // .trim() elimina espacios en blanco al inicio y al final.

  // Guardar datos en etiquetas visibles
  document.getElementById("playerLabel").innerText = playerName; // Coloca el nombre del jugador en el elemento con id="playerLabel".

  // Cambiar de pantalla
  document.getElementById("login").style.display = "none"; // Oculta la sección de login (ya no se ve en pantalla).
  document.getElementById("mainScreen").style.display = "block"; // Muestra la sección principal del juego.
});

// Función para verificar si el botón debe estar activo o no
function verificarInputNombre() {
  const nombreCargado = document.getElementById("playerName").value.trim();

  if (nombreCargado.length >= 2) {
    document.getElementById("playButton").disabled = false;
  } else {
    document.getElementById("playButton").disabled = true;
  }

  // Validar si es el administrador para la depuración
  const debugButton = document.getElementById("debugButton");
  if (nombreCargado.toLowerCase() === "admin") {
    debugButton.style.display = "block";
  } else {
    debugButton.style.display = "none";
  }
}

// Escuchar cuando el usuario escribe manualmente
document.getElementById("playerName").addEventListener("input", verificarInputNombre);


function exitToLogin() {
  const confirmExit = confirm("¿Seguro que deseas salir del juego?");
  if (confirmExit) {
    document.getElementById("mainScreen").style.display = "none";
    document.getElementById("login").style.display = "block";
    moves = 0;
    currentImage = "";
    const puzzleDiv = document.getElementById("puzzle");
    const originalImageDiv = document.getElementById("originalImage");
    if (puzzleDiv) puzzleDiv.innerHTML = "";
    if (originalImageDiv) originalImageDiv.innerHTML = "<p>Selecciona una imagen para comenzar</p>";
    
    // Limpiamos el texto
    document.getElementById("playerName").value = "";
    
    // 🔹 Forzamos la verificación del estado del botón inmediatamente
    verificarInputNombre();
    stopTimer();
  }
}



// --- MODAL ---
function openPuzzleModal(imgSrc) {
  currentImage = imgSrc;
  document.getElementById("puzzleModal").style.display = "flex";

  // ✅ Insertar la imagen original en su contenedor
  const originalDiv = document.getElementById("originalImage");
  originalDiv.innerHTML = `<img src="${imgSrc}" alt="Imagen original">`;

  // Iniciar puzzle y timer
  startPuzzle(imgSrc);
  startTimer();
}

// --- PUZZLE ---
function startPuzzle(imgSrc) {
  moves = 0;
  seconds = 0;
  stopTimer(); // detener cualquier timer previo

  //document.getElementById("status").innerText = "Movimientos: 0";
  document.getElementById("moveCount").textContent = moves;
  //document.getElementById("moveCount").textContent = 0;
  
  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";
  board = [];

  const original = document.getElementById("originalImage");
  original.innerHTML = `<img src="${imgSrc}" style="max-width:300px;">`;

  const img = new Image();
  img.onload = () => {
  // Escalar la imagen si es muy grande
  const maxSize = 600; // tamaño máximo deseado
  const scale = Math.min(maxSize / img.width, maxSize / img.height);

  const imgWidth = img.width * scale;
  const imgHeight = img.height * scale;
  const pieceWidth = imgWidth / 3;
  const pieceHeight = imgHeight / 3;

  let pieces = [];
  const empty = document.createElement("div");
  empty.className = "piece empty";
  empty.style.width = `${pieceWidth}px`;
  empty.style.height = `${pieceHeight}px`;
  empty.dataset.correct = 0;
  pieces.push(empty);

  for (let i = 1; i < 9; i++) {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.style.backgroundImage = `url(${imgSrc})`;
    piece.style.backgroundSize = `${imgWidth}px ${imgHeight}px`;
    piece.style.backgroundPosition = `${-(i % 3) * pieceWidth}px ${-Math.floor(i / 3) * pieceHeight}px`;
    piece.style.width = `${pieceWidth}px`;
    piece.style.height = `${pieceHeight}px`;
    piece.dataset.correct = i;
    pieces.push(piece);
  }

    pieces = shuffle(pieces);
    for (let i = 0; i < 3; i++) {
      board[i] = [];
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        board[i][j] = pieces[index];
      }
    }
    renderBoard();
  };
  img.src = imgSrc;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function renderBoard() {
  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const piece = board[i][j];
      piece.onclick = () => movePiece(i, j);
      puzzle.appendChild(piece);
    }
  }
}

function movePiece(i, j) {
  const [ei, ej] = findEmpty();
  
  if (isAdjacent(i, j, ei, ej)) {
    // 1. OBTENER EL ELEMENTO HTML de la pieza que se va a mover
    const pieceElement = board[i][j];
    
    // 2. FIRST: Registrar la posición física actual en la pantalla
    const rectInicial = pieceElement.getBoundingClientRect();

    // 3. Modificar la matriz interna del estado del juego
    const temp = board[i][j];
    board[i][j] = board[ei][ej];
    board[ei][ej] = temp;

    // 4. LAST: Renderizar el tablero (esto cambia la pieza de celda en el Grid instantáneamente)
    renderBoard();

    // 5. INVERT & PLAY: Animación
    // Volvemos a buscar el elemento en el DOM tras el renderizado para aplicar el efecto
    const newPieceElement = board[ei][ej]; // Ahora está en la posición [ei][ej]
    const rectFinal = newPieceElement.getBoundingClientRect();

    // Calcular la distancia que se movió en píxeles
    const deltaX = rectInicial.left - rectFinal.left;
    const deltaY = rectInicial.top - rectFinal.top;

    // Desactivamos temporalmente la transición para forzar la posición inicial del truco
    newPieceElement.style.transition = 'none';
    newPieceElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Forzamos un reflow del navegador para que registre el cambio sin transición
    newPieceElement.offsetHeight; 

    // Devolvemos la transición y limpiamos el transform para que "deslice" a su posición final
    newPieceElement.style.transition = 'transform 0.25s ease-out';
    newPieceElement.style.transform = 'translate(0, 0)';

    // Actualizar contadores
    moves++;
    document.getElementById("moveCount").textContent = moves;
    
    checkWin();
  }
}

function findEmpty() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j].classList.contains("empty")) return [i, j];
    }
  }
}

function isAdjacent(i, j, ei, ej) {
  return (Math.abs(i - ei) + Math.abs(j - ej)) === 1;
}

function checkWin() {
  const correct = board.flat().every((p, i) => parseInt(p.dataset.correct) === i);
  if (correct) {
    stopTimer();

    const emptyPiece = document.querySelector(".empty");
    if (emptyPiece) emptyPiece.style.backgroundImage = "";

    console.log("=== VERIFICACIÓN DE DATOS ANTES DE ENVIAR ===");
    console.log("userEmail:", userEmail);
    console.log("playerName:", playerName); 
    console.log("currentImage:", currentImage);
    console.log("moves:", moves);
    console.log("seconds:", seconds);
    console.log("============================================");

    saveToGoogleSheets(userEmail, playerName, currentImage, moves, seconds);

    // 1️⃣ El confeti inicia inmediatamente sobre el puzzle
    showCelebration(seconds);

    // Formateo del tiempo (mantenemos tu lógica exacta)
    let timeText;
    if (seconds < 60) {
      timeText = `${seconds} segundos`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeText = `${mins} minuto${mins > 1 ? "s" : ""} y ${secs} segundo${secs !== 1 ? "s" : ""}`;
    }

    // 2️⃣ REEMPLAZO DE SWEETALERT: Inyectamos datos y desplegamos el panel lateral
    
    // Asignamos los movimientos y el tiempo formateado a las etiquetas del panel lateral
    document.getElementById("finalMoves").textContent = moves;
    
    // Nota: Como en tu HTML pusimos un solo texto, vamos a actualizar el párrafo completo 
    // para que use tu variable estilizada de tiempo:
    const textoFelicidades = document.querySelector("#victorySidebar p");
    if (textoFelicidades) {
      textoFelicidades.innerHTML = `¡Felicitaciones! Has armado la imagen en <strong>${moves} movimientos</strong> y <strong>${timeText}</strong>.`;
    }

    // Deslizamos el panel lateral añadiendo la clase active
    const sidebar = document.getElementById("victorySidebar");
    if (sidebar) sidebar.classList.add("active");

    // Desplazamos el workspace para que no colisione visualmente con el panel
    const workspace = document.getElementById("gameWorkspace");
    if (workspace) workspace.style.marginRight = "300px";
  }
}


// --- TIMER ---
function startTimer() {
  stopTimer(); // evitar duplicados
  isActive = true;
  timerInterval = setInterval(() => {
    if (isActive) {
      seconds++;
      
      // 🔹 Si en el futuro agregas un id="timer" en tu HTML, esto lo actualizará automáticamente sin romperse
      const timerElement = document.getElementById("timer");
      if (timerElement) {
        timerElement.innerText = seconds;
      }

      // 🔹 Actualizamos el contador de movimientos de forma correcta usando su ID real
      const moveCountElement = document.getElementById("moveCount");
      if (moveCountElement) {
        moveCountElement.innerText = moves;
      }
    }
  }, 1000);
}


function stopTimer() {
  clearInterval(timerInterval);
  isActive = false;
}

window.onblur = () => { isActive = false; };
window.onfocus = () => { isActive = true; };

// --- BOTONES ---
function resetPuzzle() {
  startPuzzle(currentImage);
  startTimer();
}


function showInfo() {
  alert(AUTHOR);
}


function exitPuzzle() {
  const confirmExit = confirm("¿Deseas salir del puzzle?");
  if (confirmExit) {
    stopTimer();
    document.getElementById("puzzleModal").style.display = "none";
  }
}





// --- ESCAPE KEY ---
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.getElementById("puzzleModal").style.display === "flex") {
    const confirmExit = confirm("¿Deseas salir del puzzle?");
    if (confirmExit) {
      stopTimer();
      document.getElementById("puzzleModal").style.display = "none";
    }
  }
});


async function saveToGoogleSheets(email, name, image, moves, time) {
  if (!SCRIPT_URL) {
    console.error("SCRIPT_URL no está definida.");
    return;
  }

  // 🔹 Convertimos los datos a formato de formulario tradicional (Key=Value)
  const formData = new URLSearchParams();
  formData.append("email", email);
  formData.append("name", name);
  formData.append("image", image);
  formData.append("moves", moves);
  formData.append("time", time);

  try {
    // El modo 'no-cors' con este content-type evita que el navegador pida permisos especiales
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });
    
    console.log("¡Petición enviada a Google Sheets!");
  } catch (error) {
    console.error("Error al guardar en Google Sheets:", error);
  }
}


function debugPuzzle() {
  const size = board.length; 

  // 1. Traemos todas las piezas y las ordenamos en el estado ganador exacto
  let flatBoard = board.flat();
  flatBoard.sort((a, b) => parseInt(a.dataset.correct) - parseInt(b.dataset.correct));

  // 2. Llenamos la matriz 'board' asegurando el orden correcto de victoria 
  // 🔹 CORRECCIÓN: Forzamos que el dataset.correct coincida exactamente con el índice 'k'
  let k = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      board[i][j] = flatBoard[k];
      board[i][j].dataset.correct = k; // Sincroniza el ID con la posición ganadora
      k++;
    }
  }

  // 3. Renderizamos el estado 100% resuelto para sincronizar el DOM
  if (typeof renderBoard === "function") {
    renderBoard();
  }

  // 4. El retroceso legal desde (0, 1) hacia (0, 0)
  console.log("Generando estado pre-victoria...");
  movePiece(0, 1);

  // 5. Reseteamos el contador de movimientos a 0 para la prueba
  moves = 0;
  document.getElementById("moveCount").textContent = moves;
}


// --- 1. Variable Global para rastrear el contenedor ---
// Esto es Crucial para poder detenerlo después
let confettiContainerRef = null; 

function showCelebration(seconds) {
  // Limpiamos cualquier rastro previo por seguridad
  stopConfetti();

  confettiContainerRef = document.createElement("div");
  confettiContainerRef.id = "activeConfetti"; 
  confettiContainerRef.classList.add("confetti-container");
  
  // 🔹 IMPORTANTE: Lo inyectamos dentro del modal para que caiga ahí dentro
  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    modalContent.appendChild(confettiContainerRef);
  } else {
    document.body.appendChild(confettiContainerRef);
  }

  const colors = ["#FFC107", "#FF5722", "#E91E63", "#9C27B0", "#3F51B5", "#00BCD4", "#4CAF50"];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "%"; // Cambiado a % para que mida el modal
    confetti.style.animationDelay = Math.random() * 2 + "s";
    
    const size = Math.random() * 8 + 6;
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    confettiContainerRef.appendChild(confetti);
  }
  
  // ❌ SE ELIMINÓ EL SETTIMEOUT AUTOMÁTICO. Ahora es infinito hasta que tú decidas.
}


// --- 3. NUEVA Función para detener el confeti ---
function stopConfetti() {
  // Buscamos el contenedor usando la referencia global o el ID
  const container = confettiContainerRef || document.getElementById("activeConfetti");
  
  if (container) {
    // Eliminamos el elemento padre de raíz, desapareciendo todo el confeti al instante
    container.remove();
    // Limpiamos la referencia global
    confettiContainerRef = null;
    console.log("Confeti detenido y limpiado.");
  }
}








