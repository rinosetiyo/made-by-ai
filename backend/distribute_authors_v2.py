import os
import django

# Konfigurasi Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from news_api.models import Article, Author

def distribute_authors_to_articles():
    articles = list(Article.objects.all())
    authors = list(Author.objects.all())
    
    # Distribusi baru agar beberapa author menulis beberapa artikel:
    # 0 (AI): Jane Doe (ID 1) - Technology
    # 1 (Markets): Jane Doe (ID 1) - Business (Jane Doe menulis 3 artikel)
    # 2 (Football): Mike Lee (ID 3) - Sports
    # 3 (Blade Runner): Emily White (ID 4) - Entertainment
    # 4 (Energy): Jane Doe (ID 1) - Technology (Jane Doe menulis 3 artikel)
    # 5 (Real Estate): John Smith (ID 2) - Business (John Smith menulis 2 artikel)
    # 6 (Startup): Emily White (ID 4) - Business (Emily White menulis 2 artikel)
    # 7 (Formula 1): Jim Clark (ID 8) - Sports
    # 8 (Esports): Mike Lee (ID 3) - Sports (Mike Lee menulis 2 artikel)
    # 9 (G7 Summit): David Muir (ID 10) - World News
    
    # Pastikan jumlah artikel cukup
    if len(articles) < 10 or len(authors) < 10:
        print("Jumlah artikel atau author tidak mencukupi")
        return
    
    # Update author untuk setiap artikel
    article_author_mapping = [
        (0, 0),  # Artikel 1 -> Jane Doe
        (1, 0),  # Artikel 2 -> Jane Doe
        (2, 2),  # Artikel 3 -> Mike Lee
        (3, 3),  # Artikel 4 -> Emily White
        (4, 0),  # Artikel 5 -> Jane Doe
        (5, 1),  # Artikel 6 -> John Smith
        (6, 3),  # Artikel 7 -> Emily White
        (7, 7),  # Artikel 8 -> Jim Clark
        (8, 2),  # Artikel 9 -> Mike Lee
        (9, 9),  # Artikel 10 -> David Muir
    ]
    
    for article_idx, author_idx in article_author_mapping:
        if article_idx < len(articles) and author_idx < len(authors):
            article = articles[article_idx]
            author = authors[author_idx]
            
            # Update both author field and author_detail
            article.author = author.name
            article.author_detail = author
            article.save()
            print(f"Artikel '{article.title}' telah dihubungkan ke author '{author.name}'")
    
    # Tampilkan ringkasan
    print("\nRingkasan distribusi artikel ke author:")
    for author in authors:
        article_count = Article.objects.filter(author_detail=author).count()
        if article_count > 0:
            print(f"- {author.name}: {article_count} artikel")

if __name__ == "__main__":
    distribute_authors_to_articles()