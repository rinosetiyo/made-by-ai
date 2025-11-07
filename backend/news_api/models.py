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
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', db_index=True)  # Untuk reply komentar
    likes = models.PositiveIntegerField(default=0)  # Untuk jumlah like komentar

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


class ReadingHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_history')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='reading_history')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  # Prevent duplicate entries for the same user/article
        ordering = ['-timestamp']  # Order by most recent first

    def __str__(self):
        return f'{self.user.username} read {self.article.title}'


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_article', 'New Article'),
        ('comment_reply', 'Comment Reply'),
        ('comment_like', 'Comment Like'),
        ('comment_mention', 'Comment Mention'),
        ('system', 'System Message'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, null=True, blank=True)
    related_comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    related_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='related_notifications')

    def __str__(self):
        return f'Notification for {self.user.username}: {self.title}'

    class Meta:
        ordering = ['-created_at']

class CommentLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='user_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} liked comment {self.comment.id}'

    class Meta:
        unique_together = ('user', 'comment')  # Satu pengguna hanya bisa menyukai komentar satu kali


class CommentReport(models.Model):
    REPORT_REASONS = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
        ('misleading', 'Misleading Information'),
        ('other', 'Other'),
    ]
    
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_reports')
    reason = models.CharField(max_length=20, choices=REPORT_REASONS)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_reports')

    def __str__(self):
        return f'Report on comment {self.comment.id} by {self.user.username}'

    class Meta:
        unique_together = ('comment', 'user')  # Satu pengguna hanya bisa melaporkan komentar satu kali

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    preferred_categories = models.ManyToManyField(Category, blank=True)
    preferred_sources = models.ManyToManyField(Source, blank=True)
    newsletter_subscription = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Preferences for {self.user.username}'
