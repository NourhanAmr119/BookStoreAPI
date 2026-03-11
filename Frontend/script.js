const api = "https://localhost:7054/api/books";

let currentEditId = null;
let allBooks = [];
const COL_ID = 0;
const COL_TITLE = 1;
const COL_AUTHOR = 2;
const COL_PRICE = 3;
const COL_QUANTITY = 4;

function convertTo2DArray(data) {
    let books2D = [];
    for (let i = 0; i < data.length; i++) {
        books2D[i] = [
            data[i].id,
            data[i].title,
            data[i].author,
            data[i].price,
            data[i].quantity
        ];
    }
    return books2D;
}
function loadBooks() {
    fetch(api)
        .then(res => res.json())
        .then(data => {
            allBooks = convertTo2DArray(data);
            renderTable(allBooks);
        })
        .catch(() => {
            document.getElementById("booksTable").innerHTML = "";
            document.getElementById("emptyState").style.display = "none";
            document.getElementById("errorState").style.display = "block";
        });
}
function renderTable(books2D) {
    const tbody = document.getElementById("booksTable");
    const empty = document.getElementById("emptyState");
    const errorDiv = document.getElementById("errorState");
    const template = document.getElementById("rowTemplate");

    tbody.innerHTML = "";
    empty.style.display = "none";
    errorDiv.style.display = "none";

    if (books2D.length === 0) {
        empty.style.display = "block";
        return;
    }
    for (let i = 0; i < books2D.length; i++) {

        const row = template.content.cloneNode(true);
        row.querySelector("[data-field='id']").textContent = books2D[i][COL_ID];
        row.querySelector("[data-field='title']").textContent = books2D[i][COL_TITLE];
        row.querySelector("[data-field='author']").textContent = books2D[i][COL_AUTHOR];
        row.querySelector("[data-field='price']").textContent = "$" + parseFloat(books2D[i][COL_PRICE]).toFixed(2);

        const qtySpan = row.querySelector("[data-field='qty']");
        qtySpan.textContent = books2D[i][COL_QUANTITY];
        qtySpan.classList.add(books2D[i][COL_QUANTITY] > 3 ? "ok" : "low");
        const bookId = books2D[i][COL_ID];
        row.querySelector("[data-action='delete']").addEventListener("click", () => deleteBook(bookId));
        row.querySelector("[data-action='edit']").addEventListener("click", () => openEdit(bookId));

        tbody.appendChild(row);
    }
}

function searchBook() {
    const text = document.getElementById("searchInput").value.trim().toLowerCase();
    const type = document.getElementById("searchType").value;

    if (!text) {
        renderTable(allBooks);
        return;
    }

    let results = [];
    for (let i = 0; i < allBooks.length; i++) {
        if (type === "id") {
            if (allBooks[i][COL_ID].toString() === text) {
                results.push(allBooks[i]);
            }
        }
        else if (type === "title") {
            if (allBooks[i][COL_TITLE].toLowerCase().includes(text)) {
                results.push(allBooks[i]);
            }
        }
        else if (type === "author") {
            if (allBooks[i][COL_AUTHOR].toLowerCase().includes(text)) {
                results.push(allBooks[i]);
            }
        }
    }

    if (results.length === 0) {
        Swal.fire({
            icon: "info",
            title: "No Results",
            text: "No book found matching \"" + document.getElementById("searchInput").value + "\" by " + type + ".",
            confirmButtonText: "OK"
        });
        return;
    }

    renderTable(results);
}

function resetSearch() {
    document.getElementById("searchInput").value = "";
    document.getElementById("searchType").value = "title";
    renderTable(allBooks);
}

function addBook() {
    const t = document.getElementById("addTitle").value.trim();
    const a = document.getElementById("addAuthor").value.trim();
    const p = document.getElementById("addPrice").value.trim();
    const q = document.getElementById("addQuantity").value.trim();

    if (!t || !a || !p || !q) {
        Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill in all fields before adding a book." });
        return;
    }

    fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, author: a, price: parseFloat(p), quantity: parseInt(q) })
    })
        .then(res => { if (!res.ok) throw new Error("Failed to add book"); return res.json(); })
        .then(() => {
            Swal.fire({ icon: "success", title: "Book Added!", text: "\"" + t + "\" has been added to the store.", confirmButtonText: "Great! 🎉" });
            document.getElementById("addTitle").value = "";
            document.getElementById("addAuthor").value = "";
            document.getElementById("addPrice").value = "";
            document.getElementById("addQuantity").value = "";
            loadBooks();
        })
        .catch(err => Swal.fire({ icon: "error", title: "Error", text: err.message }));
}

function openEdit(id) {
    let bookToEdit = null;
    for (let i = 0; i < allBooks.length; i++) {
        if (allBooks[i][COL_ID] === id) {
            bookToEdit = allBooks[i];
        }
    }

    if (!bookToEdit) {
        Swal.fire({ icon: "error", title: "Not Found", text: "Could not find this book." });
        return;
    }

    currentEditId = id;
    document.getElementById("editTitle").value = bookToEdit[COL_TITLE];
    document.getElementById("editAuthor").value = bookToEdit[COL_AUTHOR];
    document.getElementById("editPrice").value = bookToEdit[COL_PRICE];
    document.getElementById("editQuantity").value = bookToEdit[COL_QUANTITY];

    showSection("edit");
}

function updateBook() {
    const titleVal = document.getElementById("editTitle").value.trim();
    const authorVal = document.getElementById("editAuthor").value.trim();
    const priceVal = document.getElementById("editPrice").value.trim();
    const quantityVal = document.getElementById("editQuantity").value.trim();

    if (!titleVal || !authorVal || !priceVal || !quantityVal) {
        Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill in all fields before saving." });
        return;
    }

    fetch(api + "/" + currentEditId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: currentEditId,
            title: titleVal,
            author: authorVal,
            price: parseFloat(priceVal),
            quantity: parseInt(quantityVal)
        })
    })
        .then(res => { if (!res.ok) throw new Error("Update failed — " + res.status); return res.json(); })
        .then(() => {
            Swal.fire({
                icon: "success", title: "Updated!",
                text: "\"" + titleVal + "\" has been updated successfully.",
                timer: 1700, showConfirmButton: false
            }).then(() => {
                currentEditId = null;
                loadBooks();
                showSection("books");
            });
        })
        .catch(err => Swal.fire({ icon: "error", title: "Update Failed", text: err.message }));
}

function deleteBook(id) {
    Swal.fire({
        icon: "warning", title: "Delete Book?", text: "This action cannot be undone.",
        showCancelButton: true, confirmButtonText: "Yes, delete it", cancelButtonText: "Cancel",
        confirmButtonColor: "#e05252"
    }).then(result => {
        if (!result.isConfirmed) return;
        fetch(api + "/" + id, { method: "DELETE" })
            .then(res => { if (!res.ok) throw new Error("Delete failed"); })
            .then(() => {
                Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
                loadBooks();
            })
            .catch(err => Swal.fire({ icon: "error", title: "Error", text: err.message }));
    });
}

const SELL_INPUTS = {
    title: "",   
    quantity: 0,    
    balance: 0     
};

function sellBook() {
    const t = document.getElementById("sellTitle").value.trim();
    const q = document.getElementById("sellQuantity").value.trim();
    const b = document.getElementById("balance").value.trim();

    if (!t || !q || !b) {
        Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill in all sale details." });
        return;
    }
    if (parseInt(q) <= 0) {
        Swal.fire({ icon: "warning", title: "Invalid Quantity", text: "Quantity must be greater than zero." });
        return;
    }

    if (parseFloat(b) <= 0) {
        Swal.fire({ icon: "warning", title: "Invalid Balance", text: "Balance must be greater than zero." });
        return;
    }
    let bookFound = false;
    for (let i = 0; i < allBooks.length; i++) {
        if (allBooks[i][COL_TITLE].toLowerCase() === t.toLowerCase()) {
            bookFound = true;
            if (allBooks[i][COL_QUANTITY] < parseInt(q)) {
                Swal.fire({
                    icon: "error", title: "Not Enough Stock",
                    text: "Only " + allBooks[i][COL_QUANTITY] + " copies available."
                });
                return;
            }
            const total = allBooks[i][COL_PRICE] * parseInt(q);
            if (parseFloat(b) < total) {
                Swal.fire({
                    icon: "error", title: "Insufficient Balance",
                    text: "You need $" + total.toFixed(2) + " but only have $" + parseFloat(b).toFixed(2) + "."
                });
                return;
            }
        }
    }
    if (!bookFound) {
        Swal.fire({ icon: "error", title: "Book Not Found", text: "\"" + t + "\" does not exist in the store." });
        return;
    }
    fetch(api + "/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, quantity: parseInt(q), balance: parseFloat(b) })
    })
        .then(res => { if (!res.ok) return res.text().then(msg => { throw new Error(msg); }); return res.json(); })
        .then(invoice => {
            renderInvoice(invoice);
            Swal.fire({
                icon: "success", title: "Sale Completed! 🎉",
                html: "<b>" + invoice.book + "</b> × " + invoice.quantity + "<br>Total: <b>$" + invoice.totalPrice.toFixed(2) + "</b>",
                confirmButtonText: "View Receipt"
            });
            loadBooks();
        })
        .catch(err => {
            document.getElementById("invoice-panel").style.display = "none";
            Swal.fire({ icon: "error", title: "Sale Failed", text: err.message });
        });
}

function renderInvoice(inv) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const receiptNo = "RCP-" + Math.floor(10000 + Math.random() * 90000);
    const unitPrice = (inv.totalPrice / inv.quantity).toFixed(2);
    const barcode = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 10000).toString().padStart(4, "0")
    ).join(" ");

    document.getElementById("inv-date").textContent = dateStr + "  |  " + timeStr + "  |  #" + receiptNo;
    document.getElementById("inv-book-name").textContent = inv.book;
    document.getElementById("inv-unit-price").textContent = "$" + unitPrice;
    document.getElementById("inv-quantity").textContent = "× " + inv.quantity;
    document.getElementById("inv-subtotal").textContent = "$" + inv.totalPrice.toFixed(2);
    document.getElementById("inv-total").textContent = "$" + inv.totalPrice.toFixed(2);
    document.getElementById("inv-remaining").textContent = "$" + inv.remainingBalance.toFixed(2);
    document.getElementById("inv-barcode").textContent = barcode;

    document.getElementById("invoice-panel").style.display = "block";
}

function showSection(id) {
    const sections = document.querySelectorAll("section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.add("hidden");
    }
    document.getElementById(id).classList.remove("hidden");

    const navItems = document.querySelectorAll(".nav-item");
    for (let i = 0; i < navItems.length; i++) {
        if (navItems[i].dataset.section === id) {
            navItems[i].classList.add("active");
        } else {
            navItems[i].classList.remove("active");
        }
    }
}

loadBooks();