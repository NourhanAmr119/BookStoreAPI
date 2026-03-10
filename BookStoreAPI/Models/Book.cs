using System.ComponentModel.DataAnnotations;

namespace BookStoreAPI.Models
{
    public class Book
    {
        [Key]
        public int Id { get; set; }

        public string Title { get; set; }

        public string Author { get; set; }

        public double Price { get; set; }

        public int Quantity { get; set; }
    }
}
