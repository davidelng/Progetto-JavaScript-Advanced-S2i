// link API:
// https://openlibrary.org/developers/api

import _ from "lodash";
import styles from "../css/style.css";

// Selezioniamo i nostri elementi nell'HTML, ovvero campo input, bottone e contenitore dei risultati
const submitBtn = document.querySelector("#submit-btn"),
    searchField = document.querySelector("#query"),
    resultList = document.querySelector(".result-container");

// funzione asincrona per ottenere i libri
async function fetchBooks(subject) {
    try {
        // mostriamo un feedback di caricamento, poiché l'api può rispondere più o meno  velocemente
        let loadingText = document.createElement("p");
        loadingText.innerText = "Loading..";
        loadingText.classList.add("feedback");
        resultList.appendChild(loadingText);

        // creiamo l'elemento lista che conterrà i libri
        let bookList = document.createElement("ul");
        bookList.classList.add("book-list");
        resultList.appendChild(bookList);

        // il fetch vero e proprio che ci darà la lista dei libri
        let res = await fetch(
            `https://openlibrary.org/subjects/${subject}.json`
        );
        let data = await res.json();
        let books = _.get(data, "works", []);

        // se non ci sono libri, mandiamo un errore
        if (books.length === 0) {
            throw Error;
        }

        // rimuoviamo il feedback di caricamento
        resultList.removeChild(loadingText);

        // con un loop andiamo a filtrare e mostrare i risultati
        books.forEach((book) => {
            // per ognuno creiamo l'elemento lista
            let bookCard = document.createElement("li");
            bookCard.classList.add("book-card");

            // salviamo il titolo, l'autore e la chiave
            let title = book.title,
                author = book.authors[0].name,
                key = book.key;

            // diamo l'attributo con la chiave identificativa all'elemento lista (servirà per ottenere dopo la descrizione)
            bookCard.setAttribute("key", key);

            // creiamo gli elementi HTML che conterranno le informazioni appena ottenute
            let bookTitle = document.createElement("h3"),
                bookAuthor = document.createElement("h4"),
                bookBtn = document.createElement("button");

            bookTitle.innerText = title;
            bookAuthor.innerText = author;
            bookBtn.innerText = "Show More";
            bookBtn.classList.add("show-more-btn");
            // sul bottone aggiungiamo un event listener con una funzione che ci permetterà di ottenere dopo informazioni aggiuntive
            bookBtn.addEventListener("click", () => fetchDescription(key));

            // appendiamo tutto al DOM
            bookCard.appendChild(bookTitle);
            bookCard.appendChild(bookAuthor);
            bookCard.appendChild(bookBtn);

            bookList.appendChild(bookCard);
        });
    } catch (e) {
        // svuotiamo la lista dei risultati precedenti
        resultList.innerHTML = "";
        // mostriamo un feedback di errore
        let noMatchesText = document.createElement("p");
        noMatchesText.innerText = "No matches found";
        noMatchesText.classList.add("feedback");
        resultList.appendChild(noMatchesText);
    }
}

// funzione asincrona per ottenere la descrizione dei libri
async function fetchDescription(key) {
    try {
        // selezioniamo il libro attraverso la sua key identificativa
        let bookCard = document.querySelector(`[key="${key}"]`);

        // usiamo una funzione per mostrare o nascondere la descrizione
        // se non abbiamo una descrizione, chiamiamo l'api e la otteniamo
        if (!bookCard.querySelector(".description")) {
            let res = await fetch(`https://openlibrary.org${key}.json`);
            let data = await res.json();

            // controlliamo se è presente una descrizione e settiamo un fallback
            let summary = _.get(
                data,
                "description",
                "No description available"
            );
            if (summary.value) {
                summary = summary.value;
            }

            // creiamo un paragrafo ed appendiamo poi il risultato
            let description = document.createElement("p");
            description.innerText = summary;
            description.classList.add("description");

            bookCard.appendChild(description);

            // il bottone adesso mostra "Show Less"
            let btn = bookCard.querySelector(".show-more-btn");
            btn.innerText = "Show Less";
        } else {
            // se ha già una descrizione, la rimuoviamo e il bottone mostrerà "Show More"
            bookCard.removeChild(bookCard.querySelector(".description"));
            let btn = bookCard.querySelector(".show-more-btn");
            btn.innerText = "Show More";
        }
    } catch (e) {
        console.log(e);
    }
}

// aggiungiamo un event listener al bottone che sul click fa partire la chiamata all'api
submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // svuotiamo la lista dei risultati
    resultList.innerHTML = "";

    // prendiamo l'input dal campo di ricerca
    let query = searchField.value;
    // modifichiamo l'input per assicurarci che sia lowercase e senza spazi, così come richiede l'api
    query = query.toLowerCase().trim();
    // passiamo il risultato come argomento alla funzione che si occupa del fetch
    fetchBooks(query);

    // svuotiamo il campo input e rimettiamo il focus per la prossima ricerca
    searchField.value = "";
    searchField.focus();
});
