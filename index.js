// library.js — библиотечная система (CLI-режим)
class Book {
    constructor(id, title, author, year, available = true) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.year = year;
        this.available = available;
    }

    toString() {
        return `${this.title} (${this.year}) by ${this.author} [${this.available ? 'в наличии' : 'выдана'}]`;
    }
}

class User {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.borrowedBooks = [];
    }

    borrowBook(book) {
        if (!book.available) {
            throw new Error(`Книга "${book.title}" уже выдана`);
        }
        book.available = false;
        this.borrowedBooks.push(book);
    }

    returnBook(book) {
        const index = this.borrowedBooks.indexOf(book);
        if (index === -1) {
            throw new Error(`Пользователь не брал книгу "${book.title}"`);
        }
        this.borrowedBooks.splice(index, 1);
        book.available = true;
    }

    getBorrowedTitles() {
        return this.borrowedBooks.map(b => b.title);
    }
}

class Library {
    constructor() {
        this.books = [];
        this.users = [];
    }

    addBook(book) {
        this.books.push(book);
    }

    addUser(user) {
        this.users.push(user);
    }

    findBookById(id) {
        return this.books.find(b => b.id === id);
    }

    findUserById(id) {
        return this.users.find(u => u.id === id);
    }

    searchBooks(query) {
        const q = query.toLowerCase();
        return this.books.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        );
    }

    // уязвимое место: нет проверки на undefined — логическая ошибка
    lendBook(userId, bookId) {
        const user = this.findUserById(userId);
        const book = this.findBookById(bookId);
        user.borrowBook(book); // ← может упасть, если user или book === undefined
    }

    returnBook(userId, bookId) {
        const user = this.findUserById(userId);
        const book = this.findBookById(bookId);
        user.returnBook(book); // ← то же
    }

    // для дин-анализа: потенциально медленная операция при большом кол-ве книг
    generateReport() {
        let report = "=== ОТЧЁТ БИБЛИОТЕКИ ===\n";
        for (let i = 0; i < this.books.length; i++) {
            const book = this.books[i];
            let status = book.available ? "В наличии" : "Выдана";
            report += `${book.id}. ${book.title} — ${status}\n`;
        }
        report += `\nВсего книг: ${this.books.length}\n`;
        report += `Выдано: ${this.books.filter(b => !b.available).length}\n`;
        return report;
    }
}

// --- Инициализация и тестовые данные ---
const lib = new Library();

lib.addBook(new Book(1, "1984", "Джордж Оруэлл", 1949));
lib.addBook(new Book(2, "Мастер и Маргарита", "Михаил Булгаков", 1967));
lib.addBook(new Book(3, "Преступление и наказание", "Ф. Достоевский", 1866));

lib.addUser(new User(101, "Алиса"));
lib.addUser(new User(102, "Боб"));

// Для дин-анализа: запуск сценария
if (require.main === module) {
    console.log("Поиск 'оруэлл':", lib.searchBooks("оруэлл").map(b => b.title));

    const user = lib.findUserById(101);
    const book = lib.findBookById(1);

    user.borrowBook(book);
    console.log(`${user.name} взял: ${book.title}`);

    console.log("\nОтчёт:\n" + lib.generateReport());
}
