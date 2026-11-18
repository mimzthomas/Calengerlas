import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGWrx3vkpD9lik78AcIcn1dd5EKuOQftk",
  authDomain: "calengerlas.firebaseapp.com",
  projectId: "calengerlas",
  storageBucket: "calengerlas.firebasestorage.app",
  messagingSenderId: "917951367844",
  appId: "1:917951367844:web:3bb4c2adb353bb27ba3431",
  measurementId: "G-W9TCRYRN3D"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventosRef = collection(db, "eventos");

// Elementos del DOM
const modal = document.getElementById("eventModal");
const selectedDateText = document.getElementById("selectedDateText");
const eventTitleInput = document.getElementById("eventTitle");
const eventTimeInput = document.getElementById("eventTime");
const eventAuthorSelect = document.getElementById("eventAuthor");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

let fechaSeleccionada = null;

// Inicializar Calendario
const calendarEl = document.getElementById("calendar");
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: "dayGridMonth",
  locale: "es",
  titleFormat: function (date) {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${meses[date.date.month]} ${date.date.year}`;
  },
  firstDay: 1,
  displayEventTime: false,
  height: "100%",
  expandRows: true,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: ""
  },
  buttonText: {
    today: "Hoy"
  },
  dateClick: function (info) {
    fechaSeleccionada = info.dateStr;
    selectedDateText.textContent = `Fecha: ${fechaSeleccionada}`;
    eventTitleInput.value = "";
    eventTimeInput.value = "";
    modal.classList.remove("hidden");
    eventTitleInput.focus();
  },
  eventClick: async function (info) {
    const confirmar = confirm(`¿Querés borrar "${info.event.title}"?`);
    if (confirmar) {
      await deleteDoc(doc(db, "eventos", info.event.id));
    }
  }
});

calendar.render();

// Escuchar cambios en tiempo real desde Firebase
onSnapshot(eventosRef, (snapshot) => {
  calendar.getEvents().forEach((ev) => ev.remove());

  snapshot.forEach((documento) => {
    const data = documento.data();
    const horaTexto = data.hora ? `${data.hora} - ` : "";

    calendar.addEvent({
      id: documento.id,
      title: `${horaTexto}${data.titulo}`,
      start: data.hora ? `${data.fecha}T${data.hora}` : data.fecha,
      backgroundColor: data.color,
      borderColor: data.color,
      textColor: "#13111c",
      display: "block"
    });
  });
});

// Función para guardar y cerrar el pop-up al instante
async function guardarEvento() {
  const titulo = eventTitleInput.value.trim();
  if (!titulo || !fechaSeleccionada) return;

  const [autor, color] = eventAuthorSelect.value.split("|");
  const hora = eventTimeInput.value;
  const fecha = fechaSeleccionada;

  // Cierra el pop-up inmediatamente
  modal.classList.add("hidden");

  try {
    await addDoc(eventosRef, {
      titulo: titulo,
      hora: hora,
      autor: autor,
      color: color,
      fecha: fecha
    });
  } catch (error) {
    alert("Error al guardar en Firebase (revisá las Reglas de Firestore): " + error.message);
  }
}

saveBtn.addEventListener("click", guardarEvento);

// Permitir guardar también apretando Enter
eventTitleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    guardarEvento();
  }
});

// Cerrar modal
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});
