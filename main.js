// Variabel Global dan Konstanta
let listBooks = loadDataBook();
const MAKING_EVENT = "making-dataBook";
const BREAKPOINT_WIDTH = 1023;

const yourBooks = document.getElementById("yourBooks");
const uncompletedBook = document.getElementById("uncompletedBook");
const completeBook = document.getElementById("completeBook");
const bookAddForm = document.getElementById("inputBook");
const searchBookTitle = document.getElementById("searchBookTitle");
const mobileSidebar = document.getElementById("checkbox");
const rightSide = document.getElementById("rightSide");
const overlay = document.querySelector(".overlay");

// Deklarasi Fungsi
function checkLocalStorageAvailability() {
  return typeof Storage !== "undefined"
    ? true
    : Swal.fire({
        title: "browser anda tidak mendukung local storage!",
        icon: "warning",
      });
}

function saveDataBook() {
  if (checkLocalStorageAvailability()) {
    localStorage.setItem("data-books", JSON.stringify(listBooks));
  }
}

function loadDataBook() {
  if (checkLocalStorageAvailability()) {
    const storedBook = localStorage.getItem("data-books");
    if (storedBook) {
      return JSON.parse(storedBook);
    }
  }
  return [];
}

function saveEditedBook(id, editedDataBook) {
  editedBookIndex = listBooks.findIndex((book) => book.id === id);

  if (editedBookIndex !== -1) {
    listBooks[editedBookIndex] = editedDataBook;
    saveDataBook();
    document.dispatchEvent(new Event(MAKING_EVENT));
  }
}

// Event Listeners
document.addEventListener(MAKING_EVENT, () => {
  renderBooks();
});

bookAddForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  addBook(title, author, year, isComplete);

  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
});

searchBookTitle.addEventListener("input", () => {
  const textBook = searchBookTitle.value.toLowerCase();
  searchBooks(textBook);
});

mobileSidebar.addEventListener("change", handleToggleSidebar);

mobileSidebar.addEventListener("input", handleToggleSidebar);

overlay.addEventListener("click", () => {
  mobileSidebar.checked = false;
  handleToggleSidebar();
});

window.addEventListener("resize", handleResizeWidth);

// Fungsi terkait aksi (Action Functions)
function searchBooks(bookTitle) {
  const filteredBook = listBooks.filter((book) =>
    book.title.toLowerCase().includes(bookTitle)
  );
  if (filteredBook.length > 0) {
    renderBooks(filteredBook);
  } else {
    uncompletedBook.innerText = "";
    completeBook.innerText = "";
  }
}

function moveBook(id) {
  listBooks = listBooks.map((book) => {
    if (book.id === id) {
      book.isComplete = !book.isComplete;
    }
    return book;
  });

  saveDataBook();
  document.dispatchEvent(new Event(MAKING_EVENT));
}

function removeBook(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Your book has been deleted.",
        icon: "success",
      });
      listBooks = listBooks.filter((book) => book.id !== id);
      saveDataBook();
      document.dispatchEvent(new Event(MAKING_EVENT));
    }
  });
}

async function editBook(id) {
  const bookSelected = listBooks.filter((book) => book.id === id);

  if (bookSelected) {
    const { value: formValues } = await Swal.fire({
      title: "Edit your book",
      html:
        "<form>" +
        `<label for="swal-input1" class="swal-label">Judul: <input id="swal-input1" class="swal-input" type="text" maxlength="15" required placeholder="Judul buku" value="${bookSelected[0].title}"></label>` +
        `<label for="swal-input2" class="swal-label">Penulis: <input id="swal-input2" class="swal-input" type="text" maxlength="15" required placeholder="Penulis buku" value="${bookSelected[0].author}"></label>` +
        `<label for="swal-input3" class="swal-label">Tahun: <input id="swal-input3" class="swal-input" type="number" maxlength="15" required placeholder="Tahun buku" value="${bookSelected[0].year}"></label>` +
        "</form>",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      background: "var(--accent)",
      padding: "2rem",
      backdrop: "rgba(29, 31, 33, 0.7)",
      preConfirm: () => {
        const editedTitle = document.getElementById("swal-input1").value;
        const editedAuthor = document.getElementById("swal-input2").value;
        const editedYear = document.getElementById("swal-input3").value;

        if (!editedTitle || !editedAuthor || !editedYear) {
          Swal.showValidationMessage("can not be empty!");
        }

        return {
          id: bookSelected[0].id,
          title: editedTitle,
          author: editedAuthor,
          year: editedYear,
          isComplete: bookSelected[0].isComplete,
        };
      },
    });

    if (formValues) {
      saveEditedBook(formValues.id, formValues);
    }
  }
}

function addBook(title, author, year, isComplete) {
  const newBook = {
    id: Date.now(),
    title,
    author,
    year,
    isComplete,
  };
  listBooks.push(newBook);
  saveDataBook();
  document.dispatchEvent(new Event(MAKING_EVENT));
}

// Fungsi Pembuatan dan Manipulasi DOM
function createElementDataBook(dataBooks) {
  const bookTitle = document.createElement("h3");
  bookTitle.classList.add("judul");
  bookTitle.innerText = dataBooks.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerHTML = `<span>Penulis :</span> ${dataBooks.author}`;

  const yearOfBook = document.createElement("p");
  yearOfBook.innerHTML = `<span>Tahun :</span> ${dataBooks.year}`;

  const bookMoveBtn = document.createElement("button");
  bookMoveBtn.innerText = dataBooks.isComplete
    ? "Belum selesai"
    : "Sudah selesai";
  bookMoveBtn.classList.add("book_moved");
  bookMoveBtn.addEventListener("click", () => {
    moveBook(dataBooks.id);
  });

  const bookEraserBtn = document.createElement("button");
  bookEraserBtn.innerHTML = "<i class='fa-solid fa-trash-can'></i>";
  bookEraserBtn.classList.add("book_removed");
  bookEraserBtn.addEventListener("click", () => {
    removeBook(dataBooks.id);
  });

  const bookEditorBtn = document.createElement("button");
  bookEditorBtn.innerHTML = "<i class='fa-solid fa-pen-to-square'></i>";
  bookEditorBtn.classList.add("book_edited");
  bookEditorBtn.addEventListener("click", () => {
    editBook(dataBooks.id);
  });

  const actionBtnContainer = document.createElement("div");
  actionBtnContainer.classList.add("action");
  actionBtnContainer.append(bookMoveBtn, bookEraserBtn, bookEditorBtn);

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(bookTitle, bookAuthor, yearOfBook, actionBtnContainer);
  container.setAttribute("id", `book-${dataBooks.id}`);

  return container;
}

// First Execution
document.addEventListener("DOMContentLoaded", () => {
  if (checkLocalStorageAvailability()) {
    loadDataBook();
  }
  document.dispatchEvent(new Event(MAKING_EVENT));
});

// UI/UX Related Code
function renderBooks(searchBooks = []) {
  uncompletedBook.innerHTML = "";
  completeBook.innerHTML = "";
  yourBooks.innerText = `${listBooks ? listBooks.length : 0}`;

  const books = searchBooks.length ? searchBooks : listBooks;
  for (const book of books) {
    const bookElement = createElementDataBook(book);

    !book.isComplete
      ? uncompletedBook.append(bookElement)
      : completeBook.append(bookElement);
  }
}

function handleToggleSidebar() {
  if (mobileSidebar.checked) {
    rightSide.classList.add("active");
    overlay.classList.add("active");
  } else {
    rightSide.classList.remove("active");
    overlay.classList.remove("active");
  }
}

function handleResizeWidth() {
  if (window.innerWidth > BREAKPOINT_WIDTH) {
    mobileSidebar.checked = false;
    handleToggleSidebar();
  }
}
