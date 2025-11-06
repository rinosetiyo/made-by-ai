from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=100, unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories', db_index=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['parent__name', 'name']

class Source(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='sources/', null=True, blank=True)

    def __str__(self):
        return self.name

class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class Author(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='authors/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Article(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    content = models.TextField(db_index=True)  # Add index to content for search performance
    author = models.CharField(max_length=100, db_index=True)  # This can be kept for backward compatibility
    publication_date = models.DateTimeField(auto_now_add=True, db_index=True)
    category = models.ForeignKey(Category, related_name='articles', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    source = models.ForeignKey(Source, related_name='articles', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    read_time = models.IntegerField(help_text="Estimated time in minutes to read the article", default=5)
    image = models.ImageField(upload_to='articles/', null=True, blank=True)
    author_detail = models.ForeignKey(Author, related_name='articles', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=['title', 'content']),  # Composite index for search
        ]

class Comment(models.Model):
    article = models.ForeignKey(Article, related_name='comments', on_delete=models.CASCADE, db_index=True)
    author_name = models.CharField(max_length=100, db_index=True)
    author_email = models.EmailField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=True, db_index=True)  # Untuk moderasi komentar

    def __str__(self):
        return f'Comment by {self.author_name} on {self.article.title}'

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  # Seorang pengguna hanya bisa mem-bookmark artikel satu kali

    def __str__(self):
        return f'{self.user.username} bookmarked {self.article.title}'
