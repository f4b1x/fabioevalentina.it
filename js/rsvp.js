const guestList = document.getElementById("guest-list");
const addGuestButton = document.getElementById("add-guest-button");
const rsvpForm = document.getElementById("rsvp-form");
const statusElement = document.getElementById("rsvp-status");
const successBox = document.getElementById("rsvp-success");
const submitButton = rsvpForm?.querySelector("button[type='submit']");
const endpoint = (window.RSVP_ENDPOINT || "").trim();

function createGuestBlock(index) {
  const guestNumber = index + 1;
  const section = document.createElement("section");
  section.className = "guest-block";
  section.dataset.guestIndex = String(guestNumber);

  section.innerHTML = `
    <p class="guest-title">Invitato ${guestNumber}</p>

    <label for="nome-completo-${guestNumber}">Nome Completo</label>
    <input id="nome-completo-${guestNumber}" name="guests[${index}][nome-completo]" type="text" />

    <fieldset class="choice-group">
      <legend>Adulto / Bambino</legend>
      <label class="choice-option" for="adulto-${guestNumber}">
        <input id="adulto-${guestNumber}" name="guests[${index}][fascia-ospite]" type="radio" value="adulto" />
        <span>Adulto</span>
      </label>
      <label class="choice-option" for="bambino-${guestNumber}">
        <input id="bambino-${guestNumber}" name="guests[${index}][fascia-ospite]" type="radio" value="bambino" />
        <span>Bambino</span>
      </label>
    </fieldset>

    <fieldset class="choice-group">
      <legend>Parteciperai all'evento?</legend>
      <label class="choice-option" for="partecipa-si-${guestNumber}">
        <input id="partecipa-si-${guestNumber}" name="guests[${index}][parteciperai]" type="radio" value="si" />
        <span>Sì</span>
      </label>
      <label class="choice-option" for="partecipa-no-${guestNumber}">
        <input id="partecipa-no-${guestNumber}" name="guests[${index}][parteciperai]" type="radio" value="no" />
        <span>No</span>
      </label>
    </fieldset>

    <label for="intolleranze-${guestNumber}">Hai intolleranze o restrizioni alimentari da segnalare?</label>
    <textarea
      id="intolleranze-${guestNumber}"
      name="guests[${index}][intolleranze]"
      rows="5"
      placeholder="Scrivi qui eventuali intolleranze o richieste alimentari specifiche"
    ></textarea>
  `;

  return section;
}

if (guestList && addGuestButton) {
  addGuestButton.addEventListener("click", () => {
    const currentCount = guestList.querySelectorAll(".guest-block").length;
    const newBlock = createGuestBlock(currentCount);
    guestList.appendChild(newBlock);
    const firstInput = newBlock.querySelector("input[type='text']");
    if (firstInput) {
      firstInput.focus();
    }
  });
}

function setStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function hideSuccessBox() {
  if (successBox) {
    successBox.hidden = true;
  }
}

function showSuccessBox() {
  if (successBox) {
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function getGuestPayload() {
  if (!guestList) return [];

  const blocks = guestList.querySelectorAll(".guest-block");
  const guests = [];

  blocks.forEach((block, index) => {
    const nameInput = block.querySelector("input[name^='guests'][name$='[nome-completo]']");
    const categoryInput = block.querySelector("input[name^='guests'][name$='[fascia-ospite]']:checked");
    const attendanceInput = block.querySelector("input[name^='guests'][name$='[parteciperai]']:checked");
    const dietaryInput = block.querySelector("textarea[name^='guests'][name$='[intolleranze]']");

    const fullName = nameInput?.value.trim() || "";
    const guestType = categoryInput?.value || "";
    const willAttend = attendanceInput?.value || "";
    const dietaryNotes = dietaryInput?.value.trim() || "";

    if (!fullName && !guestType && !willAttend && !dietaryNotes) {
      return;
    }

    guests.push({
      ordine: index + 1,
      nomeCompleto: fullName,
      adultoBambino: guestType,
      partecipera: willAttend,
      intolleranze: dietaryNotes,
    });
  });

  return guests;
}

async function handleSubmit(event) {
  event.preventDefault();
  hideSuccessBox();

  const guests = getGuestPayload();
  if (!guests.length) {
    setStatus("Inserisci almeno un invitato prima di inviare.");
    return;
  }

  if (!guests[0].nomeCompleto) {
    setStatus("Il campo Nome Completo del primo invitato è obbligatorio.");
    const firstName = document.getElementById("nome-completo-1");
    firstName?.focus();
    return;
  }

  if (!endpoint) {
    setStatus("Imposta prima window.RSVP_ENDPOINT in rsvp.html per salvare su Google Sheets.");
    return;
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    page: "rsvp.html",
    guests,
  };

  try {
    if (submitButton) submitButton.disabled = true;
    setStatus("Invio in corso...");

    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    setStatus("");
    showSuccessBox();
    rsvpForm?.reset();
  } catch {
    setStatus("Errore durante l'invio. Riprova tra qualche minuto.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", handleSubmit);
}
