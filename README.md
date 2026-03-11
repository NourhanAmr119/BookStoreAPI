📚 Book Store
A simple web application to manage a bookstore inventory, built with ASP.NET Core Web API and Vanilla JavaScript.

🛠 Technologies Used

Backend: ASP.NET Core Web API (C#)
Database: SQL Server + Entity Framework Core
Frontend: HTML, CSS, JavaScript
UI Alerts: SweetAlert2


✨ Features

View Books — Display all books in a table
Add Book — Add a new book with title, author, price, and quantity
Edit Book — Update an existing book's information
Delete Book — Remove a book from the store
Search Books — Search by Book ID, Title, or Author
Sell Book — Process a sale and generate a receipt invoice


📁 Project Structure
BookStoreAPI/          → Backend (ASP.NET Core)
├── Controllers/
│   └── BooksController.cs
├── Models/
│   ├── Book.cs
│   └── SellRequest.cs
├── Data/
│   └── AppDbContext.cs
└── Program.cs

Frontend/              → Frontend (HTML/CSS/JS)
├── index.html
├── style.css
└── script.js

🚀 How to Run
Backend

Open the project in Visual Studio
Update the connection string in appsettings.json
Run migrations:

   dotnet ef database update

Start the project — API runs on https://localhost:7054

Frontend

Open index.html in your browser
Make sure the backend is running first
