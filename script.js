const url = "https://striveschool-api.herokuapp.com/books";

/* creo questa variabile globale in modo da poterla richiamare in più funzioni senza 
doverla per forza vincolare all'interno di una funzione,per evitare l'annidamento di più funzioni*/
let libri = []; 
                

fetch(url).then((response) => {
    if (!response.ok) {
        throw new Error("Risposta network non ok"); //avvisa se la risposta non è stata ricevuta correttamente
    }
    return response.json(); //converto la risposta in file JSON
})
.then((libriOttenuti) => {
    libri = libriOttenuti; // gli oggetti ottenuti dalla chiamata API saranno chiamati "libri"
    displayBooks(libri); // dichiaro il nome della funzione per visualizzare i libri che utilizzerò in altre funzioni
})
.catch((error) => {
    console.error("Errore:", error); // mostro eventuali errori
});

//funzione per visualizzare i libri ottenuti dalla chiamata API
function displayBooks(libri) {
    let row = document.getElementById(`books-section`); // gli indico quale div voglio popolare con le card
    row.innerHTML = ""; // Pulisce prima di riempire con nuovi libri
    libri.forEach(libro => { // Per ogni libro nell'array libri, esegue il seguente codice
        let card = document.createElement(`div`); //gli dico che deve crearmi un div
        card.classList.add(`col`); //questo div avrà classe "col", in modo da sfruttare bootstrap
        card.innerHTML = ` 
        <div class="card">
          <img src="${libro.img}" class="cardimg" alt="${libro.title}">
          <div class="buybadge badge-dnone">
            <span class="badgetxt"> Acquistato </span>
          </div>
          <div class="card-body text-center">
            <h5 class="Book-title">${libro.title}</h5>
            <div class="d-flex justify-content-between mt-3">
              <p class="Book-text">${libro.category}</p>
              <p class="Book-price">${libro.price}€</p>
            </div>
            <a href="#" class="btn cart-btn">Aggiungi al carrello</a>
          </div>
        </div>`;
        row.appendChild(card); // aggiungo la card al contenitore "row"
    });
    setupCardListeners(); // Imposto gli event listener di ogni card dopo averle create
}

// configuro le funzionalità del pulsante "aggiungi al carrello"
function setupCardListeners() {
    const cartButtons = document.querySelectorAll('.cart-btn'); // seleziono tutti i pulsanti di aggiunta al carrello
    cartButtons.forEach(button => {  // per ognuno di questi elementi, configuro l'interazione con il carrello
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Evita il comportamento di default del pulsante
            const card = this.closest('.card'); // Trova la card corrispondente al pulsante cliccato
            const libro = libri.find(libri => libri.title === card.querySelector('.Book-title').textContent); // Trova il libro corrispondente nella lista

            let isInCart = cart.includes(libro); //Verifico se il libro è già nel carrello
            if (!isInCart) { // se il libro non è nel carrello
                cart.push(libro); // Aggiunge il libro al carrello
                updateCartView(); // Aggiorna la visualizzazione del carrello
                this.textContent = "Aggiunto al carrello!"; // il testo del pulsante cambia 
                this.classList.add("disabled"); // Disabilita il pulsante

                let buyBadge = card.querySelector('.buybadge'); // seleziono la classe che voglio manipolare
                if (buyBadge) {
                    buyBadge.classList.remove('badge-dnone'); // Mostra il badge di "Acquistato" togliendo il display none
                }

                setTimeout(() => {
                    this.textContent = "Rimuovi dal carrello"; // indico il nuovo testo che apparirà dopo un determinato tempo
                    this.classList.remove("disabled"); // Cambio il testo e riabilito il pulsante dopo 3 secondi
                }, 3000); //il pulsante si riattiverà dopo 3s con il nuovo testo
            } else {
                cart = cart.filter(item => item !== libro); // Rimuovo il libro dal carrello
                updateCartView(); // Aggiorno la visualizzazione del carrello
                this.textContent = "Aggiungi al carrello";
                let buyBadge = card.querySelector('.buybadge');
                if (buyBadge) {
                    buyBadge.classList.add('badge-dnone'); // Nasconde il badge di "Acquistato" se rimuoviamo il libro dal carrello
                }
            }
        });
    });
}

let cart = []; // creo un array vuoto da popolare man mano che aggiungo i libri al carrello

function updateCartView() {
    let cartContainer = document.getElementById('cart'); // indico il contenitore del carrello
    cartContainer.innerHTML = ""; // Pulisco il contenitore del carrello
    cart.forEach(book => {
        let BooksInCart = document.createElement('div');
        //creo la struttura di come verrà visualizzato il libro aggiunto nel carrello
        BooksInCart.innerHTML = `
        <div class="cartbooks">
          <img src="${book.img}" class="cartbookimg" alt="${book.title}">
          - <span class="cartbooktext">${book.title}</span>
          - <span class="cartbooktext">${book.price}€</span>
        </div>`;
        cartContainer.appendChild(BooksInCart); // Aggiungo il libro nel carrello
    });
    updateCartTotals();
}

function updateCartTotals() {
  let totalItems = cart.length;
  let totalPrice = cart.reduce((total, book) => total + parseFloat(book.price), 0);
  let totalsDisplay = document.getElementById('cart-totals');
  totalsDisplay.textContent = `Totale articoli: ${totalItems}, Prezzo Totale: ${totalPrice.toFixed(2)}€`;
}


const eraseOrderButton = document.querySelector('.eraseorder');
eraseOrderButton.addEventListener('click', () => {
    cart = []; // Svuota l'array del carrello
    updateCartView(); // Aggiorna la visualizzazione del carrello
    updateCartTotals(); // Aggiorna gli elementi totali e il loro prezzo totale

    // Trova tutti i badge "Acquistato" e li resetto se cancello l'ordine
    const badges = document.querySelectorAll('.buybadge');
    badges.forEach(badge => {
        if (!badge.classList.contains('badge-dnone')) {
            badge.classList.add('badge-dnone');
        }
    });

    // Resetta tutti i pulsanti "Aggiungi al carrello" se sono stati disabilitati
    const buttons = document.querySelectorAll('.cart-btn');
    buttons.forEach(button => {
        button.textContent = "Aggiungi al carrello";
        if (button.classList.contains('disabled')) {
            button.classList.remove('disabled');
        }
    });
});

const srcInput = document.querySelector("input[type='search']");

srcInput.addEventListener("input", () => {
    const searchText = srcInput.value.toLowerCase(); // Ottiene il testo di ricerca e lo converte in minuscolo
    if (searchText.length >= 3) { //comincia a filtrare dopo le prime 3 lettere inserite nell'input
        const filteredBooks = libri.filter(libro => libro.title.toLowerCase().includes(searchText));
        displayBooks(filteredBooks); // Visualizza solo i libri filtrati
    } else if (searchText.length === 0) {
        displayBooks(libri); // Visualizza tutti i libri se il campo di ricerca è vuoto
    }
});





// creo la logica che consente al pulsante search di "aprirsi" quando lo si clicka
const search = document.querySelector(".search-wrapper");
const input = search.querySelector("input");

search.addEventListener("click", () => {
  if (!input.matches(":focus")) {
    search.classList.add("activesrc");
  }
});

search.addEventListener("mouseleave", () => {
  if (!input.matches(":focus") && !input.value.trim()) {
    search.classList.remove("activesrc");
  }
});