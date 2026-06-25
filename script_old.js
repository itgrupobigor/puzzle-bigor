let moves = 0;
let currentImage = "";
let playerName = "";
let userEmail = "";
let board = [];
let timerInterval;
let isActive = false;
let seconds = 0;

// Al cargar la página, deshabilitamos el botón "Jugar" hasta que el usuario inicie sesión
document.getElementById("playButton").disabled = true;

// --- LOGIN ---
// Esta función se ejecuta automáticamente cuando Google devuelve la respuesta de autenticación.
function handleCredentialResponse(response) { // El parámetro response contiene el token JWT con los datos del usuario.
  const data = jwt_decode(response.credential); // El resultado (data) es un objeto con información del usuario (correo, nombre, etc.).
  userEmail = data.email; // Extrae el correo electrónico del objeto data y lo guarda en la variable global userEmail.

  // Habilitar el botón Jugar después del login
  document.getElementById("playButton").disabled = false; // Busca el botón con id playButton y lo habilita (disabled = false).

  // Mostrar el correo dinámico en el span
  document.getElementById("emailText").textContent = userEmail; // Busca el elemento con id emailText y coloca dentro el correo del usuario.

  // --- Validar correo para Depuración ---
  const debugButton = document.getElementById("debugButton"); // Obtiene el botón de depuración (id debugButton) para poder manipularlo.
  if (userEmail === "itgrupobigor@gmail.com") { // Si el correo del usuario es tu correo personal (itgrupobigor@gmail.com), el botón de depuración se muestra (display = "block").
    debugButton.style.display = "block"; // Visible solo para ti
  } else {
    debugButton.style.display = "none"; // Si es cualquier otro correo, el botón se oculta (display = "none").
  }
}

// -- - BOTÓN JUGAR ---
// Busca el elemento en el HTML con id="playButton" (el botón “Jugar”).
document.getElementById("playButton").addEventListener("click", () => { // Le agrega un escuchador de eventos: cuando el usuario haga clic en ese botón, se ejecuta la función flecha () => { ... }.
  playerName = document.getElementById("playerName").value.trim() || "SinNombre"; // Obtiene el valor escrito en el campo de texto con id="playerName".
                                                                                  // .trim() elimina espacios en blanco al inicio y al final.
  if (!userEmail) {
    alert("Primero inicia sesión con tu cuenta de Google."); // Verifica si la variable userEmail está vacía (es decir, el usuario no inició sesión con Google).
    return; // Si no hay correo, muestra un mensaje de alerta y detiene la ejecución con return.
  }

  // Guardar datos en etiquetas visibles
  document.getElementById("playerLabel").innerText = playerName; // Coloca el nombre del jugador en el elemento con id="playerLabel".

  // ✅ Mantener el ícono y solo actualizar el texto dinámico
  document.getElementById("emailText").textContent = userEmail; // Actualiza el contenido del span con el correo electrónico del usuario.

  // Cambiar de pantalla
  document.getElementById("login").style.display = "none"; // Oculta la sección de login (ya no se ve en pantalla).
  document.getElementById("mainScreen").style.display = "block"; // Muestra la sección principal del juego.
});


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
    const temp = board[i][j];
    board[i][j] = board[ei][ej];
    board[ei][ej] = temp;
    renderBoard();
    moves++;
 
    //document.getElementById("status").innerText = `Movimientos: ${moves}`;
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

    // 🔹 COLÓCALO AQUÍ (Justo antes de enviar los datos)
    console.log("=== VERIFICACIÓN DE DATOS ANTES DE ENVIAR ===");
    console.log("userEmail:", userEmail);
    console.log("playerName:", playerName); // 👈 Si aquí te sale "" o undefined, el fallo está en tu JS
    console.log("currentImage:", currentImage);
    console.log("moves:", moves);
    console.log("seconds:", seconds);
    console.log("============================================");

    saveToGoogleSheets(userEmail, playerName, currentImage, moves, seconds);

    // 1️⃣ El confeti inicia inmediatamente sobre el puzzle
    showCelebration(seconds);

    let timeText;
    if (seconds < 60) {
      timeText = `${seconds} segundos`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeText = `${mins} minuto${mins > 1 ? "s" : ""} y ${secs} segundo${secs !== 1 ? "s" : ""}`;
    }

    // 2️⃣ Mostramos SweetAlert con la tecla Escape habilitada
    Swal.fire({
      title: "¡Completado! 🎉",
      text: `Completado en ${moves} movimientos y ${timeText}`,
      icon: "success",
      confirmButtonText: "Aceptar",
      backdrop: "rgba(0, 0, 0, 0.4)",
      target: document.getElementById("puzzleModal"),
      allowOutsideClick: false, // Sigue bloqueado el clic afuera para evitar cierres accidentales
      allowEscapeKey: true      // 🔹 HABILITADO: Permite cerrar con la tecla Escape
    }).then((result) => {
      
      // 3️⃣ EL USUARIO PULSÓ "ACEPTAR" O PRESIONÓ LA TECLA "ESCAPE"
      // Validamos si se confirmó o si se cerró usando la tecla Escape (esc)
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.esc) {
        
        // A. Detener y borrar el confeti inmediatamente
        stopConfetti();

        // B. Transición de salida de la ventana modal
        const modal = document.getElementById("puzzleModal");
        if (modal) {
          modal.style.transition = "opacity 0.5s ease";
          modal.style.opacity = "0";
          
          setTimeout(() => {
            modal.style.display = "none";
            modal.style.opacity = "1"; // Dejar la opacidad restaurada para el próximo juego

            // C. Mostrar la mainScreen limpia
            const mainScreen = document.getElementById("mainScreen");
            if (mainScreen) {
              mainScreen.style.setProperty("display", "block", "important");
              mainScreen.style.opacity = "0";
              mainScreen.style.transition = "opacity 0.5s ease";
              
              setTimeout(() => {
                mainScreen.style.opacity = "1";
              }, 20);
            }
          }, 500);
        }
      }
    });
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


function exitToLogin() {
  const confirmExit = confirm("¿Seguro que deseas salir del juego?");
  if (confirmExit) {
    document.getElementById("mainScreen").style.display = "none";
    document.getElementById("login").style.display = "block";
    moves = 0;
    currentImage = "";
    document.getElementById("puzzle").innerHTML = "";
    document.getElementById("originalImage").innerHTML = "<p>Selecciona una imagen para comenzar</p>";
    document.getElementById("playerName").value = "";
    stopTimer();
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








