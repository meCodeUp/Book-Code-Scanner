// State
let myLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
let html5QrcodeScanner = null;
let isScanning = false;

// DOM Elements
const screens = {
    scanner: document.getElementById('screen-scanner'),
    detail: document.getElementById('screen-detail'),
    library: document.getElementById('screen-library')
};

const navListBtn = document.getElementById('nav-list-btn');
const fabScan = document.getElementById('fab-scan');
const cancelScanBtn = document.getElementById('cancel-scan-btn');
const saveBtn = document.getElementById('save-btn');
const discardBtn = document.getElementById('discard-btn');
const exportBtn = document.getElementById('export-btn');
const libraryList = document.getElementById('library-list');
const bookCount = document.getElementById('book-count');

// Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

// initialization
function init() {
    renderLibrary();
    // Start at library if we have books, otherwise scanner
    if (myLibrary.length > 0) {
        showScreen('library');
    } else {
        showScreen('library'); // Changed to Library as default base
    }

    // Event Listeners
    fabScan.addEventListener('click', startScanner);
    navListBtn.addEventListener('click', () => {
        stopScanner();
        showScreen('library');
    });
    cancelScanBtn.addEventListener('click', () => {
        stopScanner();
        showScreen('library');
    });
    
    document.getElementById('book-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBook();
    });

    discardBtn.addEventListener('click', () => {
        showScreen('library');
    });

    exportBtn.addEventListener('click', exportLibrary);
}

// Scanner Logic
function startScanner() {
    showScreen('scanner');
    isScanning = true;
    
    // Use the Html5Qrcode library
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Prefer back camera
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error("Error starting scanner", err);
        alert("Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.");
    });
}

function stopScanner() {
    if (html5QrcodeScanner && isScanning) {
        html5QrcodeScanner.stop().then(() => {
            console.log("Scanner stopped");
        }).catch(err => console.error("Failed to stop scanner", err));
        isScanning = false;
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    stopScanner();
    // Beep or Vibrate
    if (navigator.vibrate) navigator.vibrate(200);
    
    fetchBookDetails(decodedText);
}

function onScanFailure(error) {
    // console.warn(`Code scan error = ${error}`);
}

// API Logic
async function fetchBookDetails(isbn) {
    showScreen('detail'); // Show detailed form immediately with loading state if needed
    
    // Clear form
    document.getElementById('book-form').reset();
    document.getElementById('detail-cover').innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
    
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await response.json();
        
        if (data.totalItems > 0) {
            const book = data.items[0].volumeInfo;
            populateForm(book, isbn);
        } else {
            alert('Kein Buch gefunden. Bitte Daten manuell eingeben.');
            document.getElementById('detail-cover').innerHTML = '<i class="ph ph-question"></i>';
        }
    } catch (error) {
        console.error("API Error", error);
        alert("Fehler beim Abrufen der Buchdaten.");
    }
}

function populateForm(book, isbn) {
    document.getElementById('title').value = book.title || '';
    document.getElementById('authors').value = book.authors ? book.authors.join(', ') : '';
    document.getElementById('publishedDate').value = book.publishedDate || '';
    document.getElementById('categories').value = book.categories ? book.categories.join(', ') : '';
    
    // Store ISBN in a hidden way or data attribute, needed for saving?
    // We can allow user to edit everything, so just grabbing values from form is fine.
    
    const coverContainer = document.getElementById('detail-cover');
    if (book.imageLinks && book.imageLinks.thumbnail) {
        coverContainer.innerHTML = `<img src="${book.imageLinks.thumbnail.replace('http:', 'https:')}" alt="Cover" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
    } else {
        coverContainer.innerHTML = '<i class="ph ph-book"></i>';
    }
}

// Storage Logic
function saveBook() {
    const title = document.getElementById('title').value;
    const authors = document.getElementById('authors').value;
    const publishedDate = document.getElementById('publishedDate').value;
    const categories = document.getElementById('categories').value;
    const notes = document.getElementById('notes').value;
    const coverHtml = document.getElementById('detail-cover').innerHTML;
    // Extract src from coverHtml if it exists, otherwise null
    const imgMatch = coverHtml.match(/src="([^"]*)"/);
    const thumbnail = imgMatch ? imgMatch[1] : null;

    const newBook = {
        id: Date.now(),
        title,
        authors,
        publishedDate,
        categories,
        notes,
        thumbnail,
        scannedAt: new Date().toISOString()
    };

    myLibrary.unshift(newBook); // Add to top
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    
    renderLibrary();
    showScreen('library');
}

function deleteBook(id) {
    if(confirm("Möchtest du dieses Buch wirklich löschen?")) {
        myLibrary = myLibrary.filter(b => b.id !== id);
        localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
        renderLibrary();
    }
}

function renderLibrary() {
    libraryList.innerHTML = '';
    bookCount.textContent = `${myLibrary.length} Bücher`;

    if (myLibrary.length === 0) {
        libraryList.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-books"></i>
                <p>Noch keine Bücher gescannt.</p>
            </div>
        `;
        return;
    }

    myLibrary.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item';
        
        const imgTag = book.thumbnail 
            ? `<img src="${book.thumbnail}" class="book-item-cover" alt="Cover">`
            : `<div class="book-item-cover" style="display:flex;align-items:center;justify-content:center;background:#334;"><i class="ph ph-book"></i></div>`;

        item.innerHTML = `
            ${imgTag}
            <div class="book-info" style="flex:1;">
                <h3>${book.title}</h3>
                <p>${book.authors}</p>
                ${book.notes ? `<p style="color:var(--accent); font-size:0.8rem; margin-top:0.2rem;">Currently: ${book.notes}</p>` : ''}
            </div>
            <button class="icon-btn" onclick="deleteBook(${book.id})" style="color:var(--text-muted); font-size:1.2rem;"><i class="ph ph-trash"></i></button>
        `;
        libraryList.appendChild(item);
    });
}

// Global scope for delete wrapper
window.deleteBook = deleteBook;

// Export Logic
async function exportLibrary() {
    if (myLibrary.length === 0) {
        alert("Keine Daten zum Exportieren.");
        return;
    }

    // Convert to CSV
    const headers = ["Titel", "Autor", "Jahr", "Genre", "Notizen", "Gescannt am"];
    const csvContent = [
        headers.join(','),
        ...myLibrary.map(b => {
            const row = [
                `"${b.title.replace(/"/g, '""')}"`,
                `"${b.authors.replace(/"/g, '""')}"`,
                `"${b.publishedDate}"`,
                `"${b.categories.replace(/"/g, '""')}"`,
                `"${b.notes.replace(/"/g, '""')}"`,
                `"${b.scannedAt}"`
            ];
            return row.join(',');
        })
    ].join('\n');

    const file = new File([csvContent], "meine_bibliothek.csv", { type: "text/csv" });

    // Use Web Share API if available
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: 'Meine Bibliothek Export',
                text: 'Hier ist meine Bücherliste als CSV.',
                files: [file]
            });
        } catch (err) {
            console.error("Share failed", err);
        }
    } else {
        // Fallback to Download
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = "meine_bibliothek.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Start App
init();
