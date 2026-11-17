import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ⚠️ MANTENÉ ACÁ TUS CREDENCIALES DE FIREBASE ⚠️
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
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

// Guardar nuevo evento
saveBtn.addEventListener("click", async () => {
  const titulo = eventTitleInput.value.trim();
  if (!titulo || !fechaSeleccionada) return;

  const [autor, color] = eventAuthorSelect.value.split("|");
  const hora = eventTimeInput.value;

  await addDoc(eventosRef, {
    titulo: titulo,
    hora: hora,
    autor: autor,
    color: color,
    fecha: fechaSeleccionada
  });

  modal.classList.add("hidden");
});

// Cerrar modal
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});
