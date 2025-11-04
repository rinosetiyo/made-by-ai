import os
import django

# Konfigurasi Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from news_api.models import Article, Author

def connect_authors_to_articles():
    # Ambil semua artikel
    articles = Article.objects.all()
    
    for article in articles:
        # Cari author yang sesuai dengan nama di field author
        try:
            author = Author.objects.get(name=article.author)
            article.author_detail = author
            article.save()
            print(f"Artikel '{article.title}' telah dihubungkan ke author '{author.name}'")
        except Author.DoesNotExist:
            print(f"Author dengan nama '{article.author}' tidak ditemukan untuk artikel '{article.title}'")
    
    print(f"Berhasil menghubungkan {articles.count()} artikel ke author yang sesuai")

if __name__ == "__main__":
    connect_authors_to_articles()