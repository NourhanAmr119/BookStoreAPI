using Microsoft.AspNetCore.Mvc;
using BookStoreAPI.Data;
using BookStoreAPI.Models;

namespace BookStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetBooks()
        {
            return Ok(_context.Books.ToList());
        }
        [HttpGet("search")]
        public IActionResult Search(string title)
        {
            var books = _context.Books
                .Where(b => b.Title.Contains(title))
                .ToList();

            return Ok(books);
        }
        [HttpPost]
        public IActionResult AddBook(Book book)
        {
            _context.Books.Add(book);
            _context.SaveChanges();
            return Ok(book);
        }
        [HttpPost("sell")]
        public IActionResult SellBook([FromBody] SellRequest request)
        {
            var book = _context.Books.FirstOrDefault(b => b.Title == request.Title);

            if (book == null)
                return BadRequest("Book not found");

            if (book.Quantity < request.Quantity)
                return BadRequest("Not enough quantity");

            double total = book.Price * request.Quantity;

            if (request.Balance < total)
                return BadRequest("Balance not enough");

            book.Quantity -= request.Quantity;
            _context.SaveChanges();

            return Ok(new
            {
                Book = book.Title,
                Quantity = request.Quantity,
                TotalPrice = total,
                RemainingBalance = request.Balance - total
            });
        }
        [HttpDelete("{id}")]
        public IActionResult DeleteBook(int id)
        {
            var book = _context.Books.Find(id);

            if (book == null)
                return NotFound();

            _context.Books.Remove(book);
            _context.SaveChanges();

            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult UpdateBook(int id, Book updatedBook)
        {
            var book = _context.Books.Find(id);

            if (book == null)
                return NotFound();

            book.Title = updatedBook.Title;
            book.Author = updatedBook.Author;
            book.Price = updatedBook.Price;
            book.Quantity = updatedBook.Quantity;

            _context.SaveChanges();

            return Ok(book);
        }
    }
}