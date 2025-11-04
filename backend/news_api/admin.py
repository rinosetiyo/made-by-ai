from django.contrib import admin
from .models import Article, Category, Source, Subscriber

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'logo')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at')

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'source', 'publication_date')
    list_filter = ('category', 'source', 'publication_date')
    search_fields = ('title', 'content')
