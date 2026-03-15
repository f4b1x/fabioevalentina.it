# Setup RSVP su Google Sheets (tabellare)

Questa guida salva le risposte RSVP da dispositivi diversi in un unico foglio Google Sheets.

## 1) Crea il Google Sheet

1. Crea un nuovo Google Sheet.
2. Rinomina il primo foglio in `RSVP`.
3. Metti queste intestazioni nella riga 1:

- `Timestamp`
- `Ordine Invitato`
- `Nome Completo`
- `Adulto/Bambino`
- `Parteciperà`
- `Intolleranze`
- `Pagina`

## 2) Crea lo script Apps Script

1. Da Google Sheet vai su `Estensioni > Apps Script`.
2. Incolla questo codice nel file script (sostituisci il contenuto):

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || "{}");
    var guests = data.guests || [];
    var page = data.page || "";
    var timestamp = data.submittedAt || new Date().toISOString();

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVP");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVP");
    }

    guests.forEach(function (guest) {
      sheet.appendRow([
        timestamp,
        guest.ordine || "",
        guest.nomeCompleto || "",
        guest.adultoBambino || "",
        guest.partecipera || "",
        guest.intolleranze || "",
        page,
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3) Pubblica come Web App

1. Clicca `Distribuisci > Nuovo deployment`.
2. Tipo: `Applicazione web`.
3. `Esegui come`: `Me`.
4. `Chi ha accesso`: `Anyone` (o `Anyone with the link`).
5. Copia l'URL del deployment.

## 4) Collega il sito all'endpoint

1. Apri `rsvp.html`.
2. Cerca la riga:

```html
window.RSVP_ENDPOINT = "";
```

3. Inserisci l'URL della Web App, ad esempio:

```html
window.RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbzjMvijUjiq8rRu9kfEBf66U6Lr6ds5MesCY8kaa6l6iBhkKy83EJxYsaWq7VzFw7nL/exec";
```

## 5) Test

1. Apri `rsvp.html` nel browser.
2. Compila il form e invia.
3. Controlla il foglio `RSVP`: ogni invitato viene salvato su una riga.

## Esportazione Excel

Da Google Sheets: `File > Download > Microsoft Excel (.xlsx)` oppure `CSV`.
