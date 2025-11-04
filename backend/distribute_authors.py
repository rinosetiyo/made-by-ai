import os
import django
from random import choice

# Konfigurasi Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from news_api.models import Article, Author

def distribute_authors_to_articles():
    articles = Article.objects.all()
    authors = list(Author.objects.all())
    
    # Menentukan distribusi author ke artikel:
    # - Author Jane Doe (ID 1) akan menulis 3 artikel (AI, Energy Research, Remote Work)
    # - Author John Smith (ID 2) akan menulis 2 artikel (Stock Markets, Real Estate)
    # - Author Mike Lee (ID 3) akan menulis 2 artikel (Football, Esports)
    # - Author Emily White (ID 4) akan menulis 1 artikel (Blade Runner)
    # - Author Dr. Eva Green (ID 5) akan menulis 1 artikel (Fusion Energy) - sekarang ditulis oleh Jane Doe
    # - Author Adam First (ID 6) akan menulis 1 artikel (Real Estate) - sekarang ditulis oleh John Smith
    # - Author Clara Kent (ID 7) akan menulis 1 artikel (Startup)
    # - Author Jim Clark (ID 8) akan menulis 1 artikel (Formula 1)
    # - Author Patricia Vance (ID 9) akan menulis 1 artikel (Esports) - sekarang ditulis oleh Mike Lee
    # - Author David Muir (ID 10) akan menulis 1 artikel (G7 Summit)
    
    # Update agar lebih realistis: beberapa author menulis beberapa artikel
    # Distribusi baru:
    distribution = {
        0: authors[0],  # Artikel 1 -> Jane Doe
        1: authors[0],  # Artikel 2 -> Jane Doe (menulis 3 artikel: AI, Markets, Energy)
        2: authors[1],  # Artikel 3 -> John Smith
        3: authors[2],  # Artikel 4 -> Mike Lee
        4: authors[0],  # Artikel 5 -> Jane Doe (menulis 3 artikel)
        5: authors[1],  # Artikel 6 -> John Smith (menulis 2 artikel)
        6: authors[3],  # Artikel 7 -> Emily White
        7: authors[4],  # Artikel 8 -> Dr. Eva Green
        8: authors[2],  # Artikel 9 -> Mike Lee (menulis 2 artikel)
        9: authors[5],  # Artikel 10 -> Adam First
    }
    
    for i, article in enumerate(articles):
        if i in distribution:
            author_to_connect = distribution[i]
        else:
            # Jika indeks tidak terdistribusi, pilih author acak
            author_to_connect = choice(authors)
        
        article.author_detail = author_to_connect
        article.save()
        print(f"Artikel '{article.title}' telah dihubungkan ke author '{author_to_connect.name}'")
    
    # Tampilkan ringkasan
    print("\nRingkasan distribusi artikel ke author:")
    for author in authors:
        article_count = Article.objects.filter(author_detail=author).count()
        print(f"- {author.name}: {article_count} artikel")

if __name__ == "__main__":
    distribute_authors_to_articles()